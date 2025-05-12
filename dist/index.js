"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts - Server startup logic
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
// Connect to MongoDB
(0, db_1.connectDB)();
// Start server
const PORT = process.env.PORT || 3000;
app_1.default.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
