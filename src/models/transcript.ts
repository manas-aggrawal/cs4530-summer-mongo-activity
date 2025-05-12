import mongoose, { Schema, Document } from "mongoose";
import { TranscriptDocument } from "../types/transcript.type";
import { PopulateArgs, SelectArgs } from "../types/common.type";

/**
 * TASK 1: SEE WHAT KIND OF DEFINITION WE CAN GIVE TO "studentName" IN TRANSCRIPT SCHEMA
 * ALSO, "grades" SHOULD BE REFERENCED FROM THE "CourseGradeSchema"
 */
const TranscriptSchema: Schema = new Schema({
  studentId: { type: Number, required: true, unique: true },
  studentName: {},
  grades: [],
});

// Create and export the model
export default mongoose.model<TranscriptDocument>(
  "Transcript",
  TranscriptSchema
);

/**
 * TASK 2: YOU NEED TO SELECT ONLY THOSE FIELDS WHICH ARE REQUIRED
 * FOR OUR WORK OR BY THE CLIENT AND NOT SELECT ANY UNNECESSARY FIELDS
 *
 * TASK 3: A TRANSCRIPT ALSO INCLUDES STUDENT GRADES FOR DIFFERENT COURSES.
 * SO YOU NEED TO FIGURE OUT HOW TO POPULATE THOSE FIELDS AS WELL
 */
export const selectAndPopulateArgsForGetTranscript: PopulateArgs = {
  select: "",
  populate: [],
};

export const selectAllStudentIds: SelectArgs = {
  select: "studentId -_id",
};
