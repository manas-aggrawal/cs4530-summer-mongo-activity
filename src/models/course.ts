import mongoose, { Schema, Document } from "mongoose";
import { CourseGradeDocument } from "../types/course.type";

const CourseGradeSchema: Schema = new Schema({
  course: { type: String, required: true },
  grade: { type: Number, required: true },
});

export default mongoose.model<CourseGradeDocument>(
  "CourseGrade",
  CourseGradeSchema
);
