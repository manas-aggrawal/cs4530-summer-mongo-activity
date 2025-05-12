import mongoose, { Schema, Document } from "mongoose";
import { TranscriptDocument } from "../types/transcript.type";
import { PopulateArgs, SelectArgs } from "../types/common.type";

const TranscriptSchema: Schema = new Schema({
  studentId: { type: Number, required: true, unique: true },
  studentName: { type: String, required: true },
  grades: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseGrade",
    },
  ],
});

// Create and export the model
export default mongoose.model<TranscriptDocument>(
  "Transcript",
  TranscriptSchema
);

export const selectAndPopulateArgsForGetTranscript: PopulateArgs = {
  select: "-_id -__v",
  populate: [
    {
      path: "grades",
      select: "-_id -__v",
    },
  ],
};

export const selectAllStudentIds: SelectArgs = {
  select: "studentId -_id",
};
