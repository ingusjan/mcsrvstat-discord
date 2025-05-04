import mongoose from "mongoose";

// Define the player schema for MongoDB
const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  lastSeen: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Create the player model
export const Player = mongoose.model("Player", playerSchema);

// Define the message schema for MongoDB
const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["statusMessage"],
    default: "statusMessage",
  },
  messageId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the message model for storing Discord message IDs
export const Message = mongoose.model("Message", messageSchema);
