import express from "express";
import type { Request, Response, NextFunction } from "express";
import { MongoTranscriptService } from "./services/mongo-transcript-service";

// Create Express app
const app = express();
app.use(express.json());

// Create service instance
const transcriptService = new MongoTranscriptService();

// Define routes
app.post("/students", (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Student name is required" });
      }

      const id = await transcriptService.addStudent(name);
      res.status(201).json({ id, message: "Student added successfully" });
    } catch (error) {
      next(error);
    }
  })();
});

app.get("/students", (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const ids = await transcriptService.getAllStudentIDs();
      res.json({ ids });
    } catch (error) {
      next(error);
    }
  })();
});

app.get(
  "/students/search",
  (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const { name } = req.query;
        if (!name || typeof name !== "string") {
          return res.status(400).json({ error: "Student name is required" });
        }

        const ids = await transcriptService.nameToIDs(name);
        res.json({ ids });
      } catch (error) {
        next(error);
      }
    })();
  }
);

app.get(
  "/transcripts/:id",
  (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ error: "Invalid ID format" });
        }

        const transcript = await transcriptService.getTranscript(id);
        res.json(transcript);
      } catch (error) {
        if (error instanceof Error && error.message === "unknown ID") {
          return res.status(404).json({ error: "Student not found" });
        }
        next(error);
      }
    })();
  }
);

app.post(
  "/transcripts/:id/grades",
  (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const id = parseInt(req.params.id);
        const { course, grade } = req.body;

        if (isNaN(id) || !course || !grade) {
          return res.status(400).json({ error: "Invalid request parameters" });
        }

        await transcriptService.addGrade(id, course, grade);
        res.json({ message: "Grade added successfully" });
      } catch (error) {
        if (error instanceof Error && error.message === "unknown ID") {
          return res.status(404).json({ error: "Student not found" });
        }
        next(error);
      }
    })();
  }
);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server error" });
});

export default app;
