"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Get MongoDB connection string from environment variables
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/transcript-db";
// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log("MongoDB connected successfully");
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
