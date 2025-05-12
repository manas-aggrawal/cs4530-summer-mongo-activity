"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts - Separate Express app from server startup
const express_1 = __importDefault(require("express"));
const mongo_transcript_service_1 = require("./services/mongo-transcript-service");
// Create Express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Create service instance
const transcriptService = new mongo_transcript_service_1.MongoTranscriptService();
// Define routes
app.post("/students", (req, res, next) => {
    (async () => {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: "Student name is required" });
            }
            const id = await transcriptService.addStudent(name);
            res.status(201).json({ id, message: "Student added successfully" });
        }
        catch (error) {
            next(error);
        }
    })();
});
app.get("/students", (req, res, next) => {
    (async () => {
        try {
            const ids = await transcriptService.getAllStudentIDs();
            res.json({ ids });
        }
        catch (error) {
            next(error);
        }
    })();
});
app.get("/students/search", (req, res, next) => {
    (async () => {
        try {
            const { name } = req.query;
            if (!name || typeof name !== "string") {
                return res.status(400).json({ error: "Student name is required" });
            }
            const ids = await transcriptService.nameToIDs(name);
            res.json({ ids });
        }
        catch (error) {
            next(error);
        }
    })();
});
app.get("/transcripts/:id", (req, res, next) => {
    (async () => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: "Invalid ID format" });
            }
            const transcript = await transcriptService.getTranscript(id);
            res.json(transcript);
        }
        catch (error) {
            if (error instanceof Error && error.message === "unknown ID") {
                return res.status(404).json({ error: "Student not found" });
            }
            next(error);
        }
    })();
});
app.post("/transcripts/:id/grades", (req, res, next) => {
    (async () => {
        try {
            const id = parseInt(req.params.id);
            const { course, grade } = req.body;
            if (isNaN(id) || !course || !grade) {
                return res.status(400).json({ error: "Invalid request parameters" });
            }
            await transcriptService.addGrade(id, course, grade);
            res.json({ message: "Grade added successfully" });
        }
        catch (error) {
            if (error instanceof Error && error.message === "unknown ID") {
                return res.status(404).json({ error: "Student not found" });
            }
            next(error);
        }
    })();
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Server error" });
});
exports.default = app;
