// _tests_/usersValidator.test.js
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const {
    createUserRules,
    isValid,
    isVisValidAuth,
    authenticateToken,
} = require("../middleware/usersValidator");
const Users = require("../models/Users");
const jwt = require("jsonwebtoken");
require("dotenv").config(); 

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

    // Rutas de prueba para los middlewares
    app.post("/validate-user", createUserRules, isValid, (req, res) => {
        res.status(200).json({ message: "Usuario válido" });
    });

    app.post("/auth", isVisValidAuth, (req, res) => {
       
    });

    app.get("/protected", authenticateToken, async (req, res) => { 
        const user = await Users.findById(req.userId);
        if (user) {
            res.status(200).json({ userId: req.userId, nombre: user.nombre });
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Users.deleteMany({});
});

describe("usersValidator Middleware", () => {
    describe("createUserRules and isValid", () => {
        it("should pass validation for a valid new user", async () => {
            const userData = {
                nombre: "Valid User",
                edad: 28,
                genero: "Otro",
                email: "valid@example.com",
                password: "secure123",
            };

            const response = await request(app).post("/validate-user").send(userData);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Usuario válido");
        });

        it("should fail validation for missing required fields", async () => {
            const userData = {
                email: "invalid@example.com",
                password: "short",
            };

            const response = await request(app).post("/validate-user").send(userData);

            expect(response.statusCode).toBe(422);
            expect(response.body.errors.length).toBeGreaterThan(0);
            const messages = response.body.errors.map((error) => error.msg);
            expect(messages).toContain("El campo nombre es obligatorio");
            expect(messages).toContain("El campo edad es obligatorio");
            expect(messages).toContain("El campo genero es obligatorio");
            expect(messages).toContain("El campo email es obligatorio");
            expect(messages).toContain(
                "La contraseña debe tener al menos 6 caracteres"
            );
        });

        it("should return 409 if the email already exists", async () => {
            const existingUser = new Users({
                email: "exists@example.com",
                password: "any",
                nombre: "Existing",
                edad: 25,
                genero: "M",
            });
            await existingUser.save();

            const userData = {
                nombre: "Duplicate User",
                edad: 22,
                genero: "Mujer",
                email: "exists@example.com",
                password: "newpassword",
            };

            const response = await request(app).post("/validate-user").send(userData);

            expect(response.statusCode).toBe(409);
            expect(response.body.message).toBe("El usuario ya existe");
        });
    });

    describe("isVisValidAuth", () => {
        it("should return a token and user info for valid credentials", async () => {
            const testUser = new Users({
                id: "testAuthId",
                email: "auth@example.com",
                password: "testpassword",
                nombre: "Test Auth",
                edad: 30,
                genero: "Otro",
            });
            await testUser.save();

            const credentials = {
                email: "auth@example.com",
                password: "testpassword",
            };

            const response = await request(app).post("/auth").send(credentials);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("ok", true);
            expect(response.body).toHaveProperty("token");
            expect(response.body).toHaveProperty("user");
            expect(response.body.user.email).toBe(credentials.email);
        });

        it("should return 400 for invalid credentials", async () => {
            const credentials = {
                email: "wrong@example.com",
                password: "wrongpassword",
            };

            const response = await request(app).post("/auth").send(credentials);
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("ok", false);
            expect(response.body.error).toHaveProperty(
                "message",
                "Usuario no encontrado o credenciales incorrectas"
            );
        });
    });

    describe("authenticateToken", () => {
        it("should allow access to a protected route with a valid token", async () => {
            const protectedId = new mongoose.Types.ObjectId();
            const testUser = new Users({
                _id: protectedId, // Asegúrate de que el _id sea un ObjectId
                nombre: "Protected User",
                email: "protected@example.com",
                password: "secure",
                edad: 26,
                genero: "M",
            });
            await testUser.save();
            const token = jwt.sign({ userId: protectedId.toHexString() }, process.env.SECRET_JWT, { 
                expiresIn: "1h",
            });

            const response = await request(app)
                .get("/protected")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("userId", protectedId.toHexString()); 
            expect(response.body).toHaveProperty("nombre", testUser.nombre);
        });

        it("should return 401 for a missing token", async () => {
            const response = await request(app).get("/protected");

            expect(response.statusCode).toBe(401);
        });

        it("should return 403 for an invalid token", async () => {
            const response = await request(app)
                .get("/protected")
                .set("Authorization", "Bearer invalidtoken");

            expect(response.statusCode).toBe(403);
        });
    });
});