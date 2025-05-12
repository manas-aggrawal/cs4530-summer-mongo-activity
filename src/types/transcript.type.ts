import mongoose from "mongoose";
import { CourseGradeDocument } from "./course.type";

// These interfaces describe our data
export interface Student {
  studentName: string;
}

export interface TranscriptDocument extends Document {
  studentId: number;
  studentName: string;
  grades: mongoose.Types.ObjectId[] | CourseGradeDocument[];
}

export type StudentID = number;
export type Course = string;
export type CourseGrade = string;

/**
 * Interface for MongoTranscriptService class
 */
export interface TranscriptService {
  addStudent(newName: string): Promise<number>;
  nameToIDs(studentName: string): Promise<number[]>;
  getTranscript(id: number): Promise<TranscriptDocument>;
  addGrade(id: number, course: string, courseGrade: string): Promise<void>;
  getGrade(id: number, course: string): Promise<string>;
  getAllStudentIDs(): Promise<number[]>;
}
