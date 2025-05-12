"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tests/api.test.ts
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
// Import the necessary models
const transcript_1 = __importDefault(require("../src/models/transcript"));
const course_1 = __importDefault(require("../src/models/course"));
// We'll import the Express app routes rather than the whole app
// to set up our own test MongoDB connection
const mongo_transcript_service_1 = require("../src/services/mongo-transcript-service");
// MongoDB in-memory server instance for testing
let mongoServer;
let app;
let transcriptService;
// Set up the Express app and MongoDB connection before tests
(0, vitest_1.beforeAll)(async () => {
    // Create an in-memory MongoDB instance
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    // Connect to the in-memory MongoDB
    await mongoose_1.default.connect(mongoUri);
    // Create a fresh Express app
    app = (0, express_1.default)();
    app.use(express_1.default.json());
    // Create a transcript service instance
    transcriptService = new mongo_transcript_service_1.MongoTranscriptService();
    // Define routes - recreating the routes from index.ts
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
});
// Clean up resources after all tests
(0, vitest_1.afterAll)(async () => {
    await mongoose_1.default.disconnect();
    await mongoServer.stop();
});
// Clear all data before each test
(0, vitest_1.beforeEach)(async () => {
    await course_1.default.deleteMany({});
    await transcript_1.default.deleteMany({});
});
// Test suite for student creation and retrieval
(0, vitest_1.describe)("Student API", () => {
    // Create student test
    (0, vitest_1.it)("should create a new student", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/students")
            .send({ name: "John Doe" })
            .expect(201);
        (0, vitest_1.expect)(response.body).toHaveProperty("id");
        (0, vitest_1.expect)(response.body).toHaveProperty("message", "Student added successfully");
        // Verify the student was actually created in the database
        const ids = await transcriptService.nameToIDs("John Doe");
        (0, vitest_1.expect)(ids).toContain(response.body.id);
    });
    // Get all students test
    (0, vitest_1.it)("should return all student IDs", async () => {
        // Add some test students
        const id1 = await transcriptService.addStudent("Student One");
        const id2 = await transcriptService.addStudent("Student Two");
        const response = await (0, supertest_1.default)(app).get("/students").expect(200);
        (0, vitest_1.expect)(response.body).toHaveProperty("ids");
        (0, vitest_1.expect)(response.body.ids).toContain(id1);
        (0, vitest_1.expect)(response.body.ids).toContain(id2);
    });
    // Search students by name test
    (0, vitest_1.it)("should find student IDs by name", async () => {
        // Add test students with the same name
        const id1 = await transcriptService.addStudent("John Smith");
        const id2 = await transcriptService.addStudent("Jane Doe");
        const id3 = await transcriptService.addStudent("John Smith");
        const response = await (0, supertest_1.default)(app)
            .get("/students/search?name=John Smith")
            .expect(200);
        (0, vitest_1.expect)(response.body).toHaveProperty("ids");
        (0, vitest_1.expect)(response.body.ids).toHaveLength(2);
        (0, vitest_1.expect)(response.body.ids).toContain(id1);
        (0, vitest_1.expect)(response.body.ids).toContain(id3);
        (0, vitest_1.expect)(response.body.ids).not.toContain(id2);
    });
    // Handle invalid search
    (0, vitest_1.it)("should return 400 when searching without a name", async () => {
        await (0, supertest_1.default)(app).get("/students/search").expect(400);
    });
});
// Test suite for transcript operations
(0, vitest_1.describe)("Transcript API", () => {
    let studentId;
    // Create a student before testing transcripts
    (0, vitest_1.beforeEach)(async () => {
        studentId = await transcriptService.addStudent("Test Student");
    });
    // Test getting a transcript
    (0, vitest_1.it)("should return a student transcript", async () => {
        const response = await (0, supertest_1.default)(app)
            .get(`/transcripts/${studentId}`)
            .expect(200);
        (0, vitest_1.expect)(response.body).toHaveProperty("studentId", studentId);
        (0, vitest_1.expect)(response.body).toHaveProperty("studentName", "Test Student");
        (0, vitest_1.expect)(response.body).toHaveProperty("grades");
        (0, vitest_1.expect)(response.body.grades).toEqual([]);
    });
    // Test 404 for non-existent student
    (0, vitest_1.it)("should return 404 for non-existent student", async () => {
        const nonExistentId = 9999;
        await (0, supertest_1.default)(app).get(`/transcripts/${nonExistentId}`).expect(404);
    });
    // Test adding a grade
    (0, vitest_1.it)("should add a grade to a student transcript", async () => {
        // Add a grade
        await (0, supertest_1.default)(app)
            .post(`/transcripts/${studentId}/grades`)
            .send({ course: "Math 101", grade: "A" })
            .expect(200);
        // Verify the grade was added
        const transcript = await transcriptService.getTranscript(studentId);
        (0, vitest_1.expect)(transcript.grades).toHaveLength(1);
        (0, vitest_1.expect)(transcript.grades[0]).toHaveProperty("course", "Math 101");
        (0, vitest_1.expect)(transcript.grades[0]).toHaveProperty("grade", "A");
    });
    // Test adding multiple grades
    (0, vitest_1.it)("should support adding multiple grades to a transcript", async () => {
        // Add first grade
        await (0, supertest_1.default)(app)
            .post(`/transcripts/${studentId}/grades`)
            .send({ course: "Math 101", grade: "A" })
            .expect(200);
        // Add second grade
        await (0, supertest_1.default)(app)
            .post(`/transcripts/${studentId}/grades`)
            .send({ course: "Physics 201", grade: "B+" })
            .expect(200);
        // Verify both grades were added
        const transcript = await transcriptService.getTranscript(studentId);
        (0, vitest_1.expect)(transcript.grades).toHaveLength(2);
        // Check if both courses are in the grades array
        const courses = transcript.grades.map((g) => g.course);
        (0, vitest_1.expect)(courses).toContain("Math 101");
        (0, vitest_1.expect)(courses).toContain("Physics 201");
    });
    // Test error handling for adding a grade to non-existent student
    (0, vitest_1.it)("should return 404 when adding grade to non-existent student", async () => {
        const nonExistentId = 9999;
        await (0, supertest_1.default)(app)
            .post(`/transcripts/${nonExistentId}/grades`)
            .send({ course: "Math 101", grade: "A" })
            .expect(404);
    });
    // Test validation for adding a grade
    (0, vitest_1.it)("should validate grade input parameters", async () => {
        // Missing course
        await (0, supertest_1.default)(app)
            .post(`/transcripts/${studentId}/grades`)
            .send({ grade: "A" })
            .expect(400);
        // Missing grade
        await (0, supertest_1.default)(app)
            .post(`/transcripts/${studentId}/grades`)
            .send({ course: "Math 101" })
            .expect(400);
        // Both missing
        await (0, supertest_1.default)(app)
            .post(`/transcripts/${studentId}/grades`)
            .send({})
            .expect(400);
    });
});
// Test suite for end-to-end workflow
(0, vitest_1.describe)("End-to-End Transcript Workflow", () => {
    (0, vitest_1.it)("should support a complete transcript workflow", async () => {
        // 1. Create a new student
        const createResponse = await (0, supertest_1.default)(app)
            .post("/students")
            .send({ name: "Workflow Test Student" })
            .expect(201);
        const studentId = createResponse.body.id;
        // 2. Add multiple grades
        await (0, supertest_1.default)(app)
            .post(`/transcripts/${studentId}/grades`)
            .send({ course: "Math 101", grade: "A" })
            .expect(200);
        await (0, supertest_1.default)(app)
            .post(`/transcripts/${studentId}/grades`)
            .send({ course: "Physics 201", grade: "B+" })
            .expect(200);
        await (0, supertest_1.default)(app)
            .post(`/transcripts/${studentId}/grades`)
            .send({ course: "Chemistry 101", grade: "A-" })
            .expect(200);
        // 3. Retrieve the transcript
        const transcriptResponse = await (0, supertest_1.default)(app)
            .get(`/transcripts/${studentId}`)
            .expect(200);
        // 4. Verify all data is correct
        (0, vitest_1.expect)(transcriptResponse.body).toHaveProperty("studentId", studentId);
        (0, vitest_1.expect)(transcriptResponse.body).toHaveProperty("studentName", "Workflow Test Student");
        (0, vitest_1.expect)(transcriptResponse.body).toHaveProperty("grades");
        (0, vitest_1.expect)(transcriptResponse.body.grades).toHaveLength(3);
        // Check all grades are present
        const courses = transcriptResponse.body.grades.map((g) => g.course);
        (0, vitest_1.expect)(courses).toContain("Math 101");
        (0, vitest_1.expect)(courses).toContain("Physics 201");
        (0, vitest_1.expect)(courses).toContain("Chemistry 101");
        // Find and check a specific grade
        const mathGrade = transcriptResponse.body.grades.find((g) => g.course === "Math 101");
        (0, vitest_1.expect)(mathGrade).toHaveProperty("grade", "A");
    });
});
// Test suite for error handling
(0, vitest_1.describe)("API Error Handling", () => {
    (0, vitest_1.it)("should handle invalid ID format in transcript retrieval", async () => {
        await (0, supertest_1.default)(app)
            .get("/transcripts/invalid-id")
            .expect(400)
            .expect((res) => {
            (0, vitest_1.expect)(res.body).toHaveProperty("error", "Invalid ID format");
        });
    });
    (0, vitest_1.it)("should return 404 for non-existent student ID", async () => {
        await (0, supertest_1.default)(app)
            .get("/transcripts/9999")
            .expect(404)
            .expect((res) => {
            (0, vitest_1.expect)(res.body).toHaveProperty("error", "Student not found");
        });
    });
    (0, vitest_1.it)("should handle empty student name during creation", async () => {
        await (0, supertest_1.default)(app)
            .post("/students")
            .send({ name: "" })
            .expect(400)
            .expect((res) => {
            (0, vitest_1.expect)(res.body).toHaveProperty("error", "Student name is required");
        });
    });
    (0, vitest_1.it)("should handle missing student name during creation", async () => {
        await (0, supertest_1.default)(app)
            .post("/students")
            .send({})
            .expect(400)
            .expect((res) => {
            (0, vitest_1.expect)(res.body).toHaveProperty("error", "Student name is required");
        });
    });
});
