const { Schema, model } = require("mongoose");

const MessageSchema = new Schema({
  sender_id: { type: String, ref: "Users", required: true },
  receiver_id: { type: String, ref: "Users", required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new Schema({
  match_id: { type: String, ref: "Matches", required: true }, // Relación con el match
  messages: [MessageSchema],
});

module.exports = model("Chat", ChatSchema);
