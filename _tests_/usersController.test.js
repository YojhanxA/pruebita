// __tests__/usersController.test.js
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const usersController = require("../controllers/usersController");
const Users = require("../models/Users");
const Swipes = require("../models/Swipes");
const Matches = require("../models/Matches");
const Chat = require("../models/chat");
const jwt = require("jsonwebtoken");
const { getIO } = require("../socket");

jest.mock("../socket", () => ({
    getIO: jest.fn(() => ({
        emit: jest.fn(),
    })),
}));

let mongoServer;
let app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    app = express();
    app.use(express.json());
    app.post("/register", usersController.register);
    app.get("/users", (req, res) => {
        req.userId = "testUserId";
        usersController.list(req, res);
    });
    app.post("/swipe", (req, res) => {
        req.userId = "user1";
        usersController.swipe(req, res);
    });
    app.get("/match", (req, res) => {
        req.userId = "testUser";
        usersController.getMatch(req, res);
    });
    app.post("/mensaje", (req, res) => {
        req.userId = "senderId";
        usersController.sendMessage(req, res);
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {

    await Users.deleteMany({});
    await Swipes.deleteMany({});
    await Matches.deleteMany({});
    await Chat.deleteMany({});
});

describe("usersController", () => {
    it("should register a new user", async () => {
        const userData = {
            nombre: "Test User",
            edad: 25,
            genero: "Masculino",
            preferencias: {},
            ubicacion: "Test Location",
            fotoPerfil: "http://example.com/photo.jpg",
            email: "test@example.com",
            password: "password123",
        };

        const response = await request(app).post("/register").send(userData);

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Usuario registrado correctamente");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user.email).toBe(userData.email);

        const userInDb = await Users.findOne({ email: userData.email });
        expect(userInDb).toBeDefined();
        expect(userInDb.nombre).toBe(userData.nombre);
    });

    it("should not register a user if the email already exists", async () => {
        const existingUser = new Users({
            email: "existing@example.com",
            password: "password",
            nombre: "Existing User",
            edad: 30,
            genero: "Femenino",
        });
        await existingUser.save();

        const userData = {
            nombre: "Another User",
            edad: 30,
            genero: "Femenino",
            email: "existing@example.com",
            password: "anotherpassword",
        };

        const response = await request(app).post("/register").send(userData);

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe(
            "El usuario ya existe con este correo electrónico"
        );
    });

    it("should list all users except the current user", async () => {
        const user1 = new Users({
            id: "testUserId",
            nombre: "Current User",
            email: "current@example.com",
            password: "password",
            edad: 25,
            genero: "Masculino",
        });
        const user2 = new Users({
            id: "user2",
            nombre: "Other User 1",
            email: "other1@example.com",
            password: "password",
            edad: 28,
            genero: "Femenino",
        });
        const user3 = new Users({
            id: "user3",
            nombre: "Other User 2",
            email: "other2@example.com",
            password: "password",
            edad: 32,
            genero: "Otro",
        });
        await Promise.all([user1.save(), user2.save(), user3.save()]);

        const response = await request(app).get("/users");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
        const emails = response.body.map((user) => user.email);
        expect(emails).not.toContain("current@example.com");
        expect(emails).toContain("other1@example.com");
        expect(emails).toContain("other2@example.com");
    });

    it("should record a swipe and create a match if there is a reverse like", async () => {
        const user1 = new Users({ id: "user1", nombre: "User 1", email: "user1@example.com", password: "pass1", edad: 20, genero: "M" });
        const user2 = new Users({ id: "user2", nombre: "User 2", email: "user2@example.com", password: "pass2", edad: 22, genero: "F" });
        await Promise.all([user1.save(), user2.save()]);


        const swipeByUser2 = new Swipes({
            usuario_origen_id: "user2",
            usuario_destino_id: "user1",
            accion: "like",
        });
        await swipeByUser2.save();


        const response = await request(app)
            .post("/swipe")
            .send({ destinoId: "user2", accion: "like" });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("¡Es un match!");
        expect(response.body.match).toHaveProperty("usuario1_id", "user1");
        expect(response.body.match).toHaveProperty("usuario2_id", "user2");

        const matchInDb = await Matches.findOne({
            usuario1_id: "user1",
            usuario2_id: "user2",
        });
        expect(matchInDb).toBeDefined();
    });

    it("should record a swipe without creating a match if there is no reverse like", async () => {
        const user1 = new Users({ id: "user1", nombre: "User 1", email: "user1@example.com", password: "pass1", edad: 20, genero: "M" });
        const user2 = new Users({ id: "user2", nombre: "User 2", email: "user2@example.com", password: "pass2", edad: 22, genero: "F" });
        await Promise.all([user1.save(), user2.save()]);

        const response = await request(app)
            .post("/swipe")
            .send({ destinoId: "user2", accion: "like" });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Le diste like a este usuario.");

        const swipeInDb = await Swipes.findOne({
            usuario_origen_id: "user1",
            usuario_destino_id: "user2",
            accion: "like",
        });
        expect(swipeInDb).toBeDefined();
        const matchInDb = await Matches.findOne({
            usuario1_id: "user1",
            usuario2_id: "user2",
        });
        expect(matchInDb).toBeNull();
    });

    it("should get a match and its messages", async () => {
        const user1 = new Users({ id: "testUser", nombre: "User A", email: "a@example.com", password: "passa", edad: 25, genero: "M" });
        const user2 = new Users({ id: "otherUser", nombre: "User B", email: "b@example.com", password: "passb", edad: 28, genero: "F" });
        await Promise.all([user1.save(), user2.save()]);

        const match = new Matches({
            usuario1_id: "testUser",
            usuario2_id: "otherUser",
        });
        const savedMatch = await match.save();

        const chatMessage1 = {
            sender_id: "testUser",
            receiver_id: "otherUser",
            message: "Hola!",
        };
        const chatMessage2 = {
            sender_id: "otherUser",
            receiver_id: "testUser",
            message: "Qué tal?",
        };
        const chat = new Chat({
            match_id: savedMatch.id,
            messages: [chatMessage1, chatMessage2],
        });
        await chat.save();

        const response = await request(app).get("/match");

        expect(response.statusCode).toBe(200);
        expect(response.body.match).toHaveProperty("id", savedMatch.id);
        expect(Array.isArray(response.body.messages)).toBe(true);
        expect(response.body.messages.length).toBe(2);
        expect(response.body.messages[0]).toHaveProperty("senderName", "User A");
        expect(response.body.messages[1]).toHaveProperty("senderName", "User B");
    });

    it("should send a message in a match", async () => {
        const user1 = new Users({ id: "senderId", nombre: "Sender", email: "sender@example.com", password: "passs", edad: 30, genero: "M" });
        const user2 = new Users({ id: "receiverId", nombre: "Receiver Name", email: "receiver@example.com", password: "passr", edad: 27, genero: "F" });
        await Promise.all([user1.save(), user2.save()]);

        const match = new Matches({
            id: "testMatchId",
            usuario1_id: "senderId",
            usuario2_id: "receiverId",
        });
        await match.save();

        const messagePayload = {
            matchId: "testMatchId",
            message: "This is a test message.",
        };

        const response = await request(app).post("/mensaje").send(messagePayload);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toHaveProperty(
            "message",
            "This is a test message."
        );
        expect(response.body.message).toHaveProperty("senderName", "Sender");


        const mockIO = getIO();
        expect(mockIO.emit).toHaveBeenCalledWith(
            "chat message",
            expect.objectContaining({
                message: "This is a test message.",
                senderId: "senderId",
                senderName: "Sender",
                matchId: "testMatchId",
            })
        );

        const chatInDb = await Chat.findOne({ match_id: "testMatchId" });
        expect(chatInDb).toBeDefined();
        expect(chatInDb.messages.length).toBe(1);
        expect(chatInDb.messages[0].message).toBe("This is a test message.");
        expect(chatInDb.messages[0].sender_id).toBe("senderId");
    });
});
