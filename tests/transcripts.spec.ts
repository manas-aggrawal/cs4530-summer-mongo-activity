import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app";
import Transcript from "../src/models/transcript";
import CourseGrade from "../src/models/course";
import { CourseGradeDocument } from "../src/types/course.type";
import { MongoTranscriptService } from "../src/services/mongo-transcript.service";

// MongoDB in-memory server instance for testing
let mongoServer: MongoMemoryServer;
let transcriptService: MongoTranscriptService;

// Set up the MongoDB connection before tests
beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory MongoDB
  await mongoose.connect(mongoUri);

  // Create a transcript service instance for direct access in tests
  transcriptService = new MongoTranscriptService();
});

// Clean up resources after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear all data before each test
beforeEach(async () => {
  await CourseGrade.deleteMany({});
  await Transcript.deleteMany({});
});

// Test suite for student creation and retrieval
describe("Student API", () => {
  // Create student test
  it("should create a new student", async () => {
    const response = await request(app)
      .post("/students")
      .send({ name: "John Doe" })
      .expect(201);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty(
      "message",
      "Student added successfully"
    );

    // Verify the student was actually created in the database
    const ids = await transcriptService.nameToIDs("John Doe");
    expect(ids).toContain(response.body.id);
  });

  // Get all students test
  it("should return all student IDs", async () => {
    // Add some test students
    const id1 = await transcriptService.addStudent("Student One");
    const id2 = await transcriptService.addStudent("Student Two");

    const response = await request(app).get("/students").expect(200);

    expect(response.body).toHaveProperty("ids");
    expect(response.body.ids).toContain(id1);
    expect(response.body.ids).toContain(id2);
  });

  // Search students by name test
  it("should find student IDs by name", async () => {
    // Add test students with the same name
    const id1 = await transcriptService.addStudent("John Smith");
    const id2 = await transcriptService.addStudent("Jane Doe");
    const id3 = await transcriptService.addStudent("John Smith");

    const response = await request(app)
      .get("/students/search?name=John Smith")
      .expect(200);

    expect(response.body).toHaveProperty("ids");
    expect(response.body.ids).toHaveLength(2);
    expect(response.body.ids).toContain(id1);
    expect(response.body.ids).toContain(id3);
    expect(response.body.ids).not.toContain(id2);
  });

  // Handle invalid search
  it("should return 400 when searching without a name", async () => {
    await request(app).get("/students/search").expect(400);
  });
});

// Test suite for transcript operations
describe("Transcript API", () => {
  let studentId: number;

  // Create a student before testing transcripts
  beforeEach(async () => {
    studentId = await transcriptService.addStudent("Test Student");
  });

  // Test getting a transcript
  it("should return a student transcript", async () => {
    const response = await request(app)
      .get(`/transcripts/${studentId}`)
      .expect(200);

    expect(response.body).toHaveProperty("studentId", studentId);
    expect(response.body).toHaveProperty("studentName", "Test Student");
    expect(response.body).toHaveProperty("grades");
    expect(response.body.grades).toEqual([]);
  });

  // Test 404 for non-existent student
  it("should return 404 for non-existent student", async () => {
    const nonExistentId = 9999;

    await request(app).get(`/transcripts/${nonExistentId}`).expect(404);
  });

  // Test adding a grade
  it("should add a grade to a student transcript", async () => {
    // Add a grade
    await request(app)
      .post(`/transcripts/${studentId}/grades`)
      .send({ course: "Math 101", grade: 95 })
      .expect(200);

    // Verify the grade was added
    const transcript = await transcriptService.getTranscript(studentId);
    expect(transcript.grades).toHaveLength(1);

    // Use type assertion here
    const grades = transcript.grades as unknown as CourseGradeDocument[];
    expect(grades[0]).toHaveProperty("course", "Math 101");
    expect(grades[0]).toHaveProperty("grade", 95);
  });

  // Test adding multiple grades
  it("should support adding multiple grades to a transcript", async () => {
    // Add first grade
    await request(app)
      .post(`/transcripts/${studentId}/grades`)
      .send({ course: "Math 101", grade: 95 })
      .expect(200);

    // Add second grade
    await request(app)
      .post(`/transcripts/${studentId}/grades`)
      .send({ course: "Physics 201", grade: 87 })
      .expect(200);

    // Verify both grades were added
    const transcript = await transcriptService.getTranscript(studentId);
    expect(transcript.grades).toHaveLength(2);

    // Check if both courses are in the grades array
    // Use type assertion to help TypeScript understand we're working with populated documents
    const grades = transcript.grades as unknown as CourseGradeDocument[];
    const courses = grades.map((g) => g.course);
    expect(courses).toContain("Math 101");
    expect(courses).toContain("Physics 201");
  });

  // Test error handling for adding a grade to non-existent student
  it("should return 404 when adding grade to non-existent student", async () => {
    const nonExistentId = 9999;

    await request(app)
      .post(`/transcripts/${nonExistentId}/grades`)
      .send({ course: "Math 101", grade: 95 })
      .expect(404);
  });

  // Test validation for adding a grade
  it("should validate grade input parameters", async () => {
    // Missing course
    await request(app)
      .post(`/transcripts/${studentId}/grades`)
      .send({ grade: 95 })
      .expect(400);

    // Missing grade
    await request(app)
      .post(`/transcripts/${studentId}/grades`)
      .send({ course: "Math 101" })
      .expect(400);

    // Both missing
    await request(app)
      .post(`/transcripts/${studentId}/grades`)
      .send({})
      .expect(400);
  });
});

// Test suite for end-to-end workflow
describe("End-to-End Transcript Workflow", () => {
  it("should support a complete transcript workflow", async () => {
    // 1. Create a new student
    const createResponse = await request(app)
      .post("/students")
      .send({ name: "Workflow Test Student" })
      .expect(201);

    const studentId = createResponse.body.id;

    // 2. Add multiple grades
    await request(app)
      .post(`/transcripts/${studentId}/grades`)
      .send({ course: "Math 101", grade: 95 })
      .expect(200);

    await request(app)
      .post(`/transcripts/${studentId}/grades`)
      .send({ course: "Physics 201", grade: 87 })
      .expect(200);

    await request(app)
      .post(`/transcripts/${studentId}/grades`)
      .send({ course: "Chemistry 101", grade: 92 })
      .expect(200);

    // 3. Retrieve the transcript
    const transcriptResponse = await request(app)
      .get(`/transcripts/${studentId}`)
      .expect(200);

    // 4. Verify all data is correct
    expect(transcriptResponse.body).toHaveProperty("studentId", studentId);
    expect(transcriptResponse.body).toHaveProperty(
      "studentName",
      "Workflow Test Student"
    );
    expect(transcriptResponse.body).toHaveProperty("grades");
    expect(transcriptResponse.body.grades).toHaveLength(3);

    // Check all grades are present
    const grades = transcriptResponse.body.grades as any[];
    const courses = grades.map((g) => g.course);
    expect(courses).toContain("Math 101");
    expect(courses).toContain("Physics 201");
    expect(courses).toContain("Chemistry 101");

    // Find and check a specific grade
    const mathGrade = grades.find((g) => g.course === "Math 101");
    expect(mathGrade).toHaveProperty("grade", 95);
  });
});

// Test suite for error handling
describe("API Error Handling", () => {
  it("should handle invalid ID format in transcript retrieval", async () => {
    await request(app)
      .get("/transcripts/invalid-id")
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty("error", "Invalid ID format");
      });
  });

  it("should return 404 for non-existent student ID", async () => {
    await request(app)
      .get("/transcripts/9999")
      .expect(404)
      .expect((res) => {
        expect(res.body).toHaveProperty("error", "Student not found");
      });
  });

  it("should handle empty student name during creation", async () => {
    await request(app)
      .post("/students")
      .send({ name: "" })
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty("error", "Student name is required");
      });
  });

  it("should handle missing student name during creation", async () => {
    await request(app)
      .post("/students")
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty("error", "Student name is required");
      });
  });
});
