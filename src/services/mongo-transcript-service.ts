import Transcript, {
  selectAllStudentIds,
  selectAndPopulateArgsForGetTranscript,
} from "../models/transcript";
import CourseGrade from "../models/course";
import { CourseGradeDocument } from "../types/course.type";
import {
  TranscriptDocument,
  TranscriptService,
} from "../types/transcript.type";

export class MongoTranscriptService implements TranscriptService {
  private lastID!: number;

  constructor() {
    this.initializeLastID();
  }

  /**
   *
   */
  private async initializeLastID(): Promise<void> {
    // Find the highest studentId in the database
    const highestStudent = await Transcript.findOne()
      .sort({ studentId: -1 })
      .exec();
    this.lastID = highestStudent ? highestStudent.studentId + 1 : 0;
  }

  /**
   * Method to add student to the database
   * @param newName - name of the student to be added
   * @returns Number
   */
  async addStudent(newName: string): Promise<number> {
    const newID = this.lastID++;

    await Transcript.create({
      studentId: newID,
      studentName: newName,
      grades: [],
    });

    return newID;
  }

  /**
   * Method to find student id from given student name
   * @param studentName
   * @returns Number
   */
  async nameToIDs(studentName: string): Promise<number[]> {
    const transcripts = await Transcript.find({
      studentName,
    }).exec();

    return transcripts.map((t) => t.studentId);
  }

  /**
   * Method to get transcript of grades of a student
   * @param id - id of the student whose transcript we are fetching
   * @returns TranscriptDocument
   */
  async getTranscript(id: number): Promise<TranscriptDocument> {
    const transcript = await Transcript.findOne({ studentId: id })
      .select(selectAndPopulateArgsForGetTranscript.select)
      .populate(selectAndPopulateArgsForGetTranscript.populate)
      .exec();

    if (!transcript) {
      throw new Error("unknown ID");
    }

    return transcript;
  }

  /**
   * Method to add grade for a student in their transcript
   * @param id - student Id
   * @param course - course name
   * @param grade - grade in the given course
   */
  async addGrade(id: number, course: string, grade: string): Promise<void> {
    // First check if the student exists
    const transcript = await Transcript.findOne({ studentId: id });
    if (!transcript) {
      throw new Error("unknown ID");
    }

    // Create a new CourseGrade document
    const newGrade = await CourseGrade.create({
      course,
      grade,
    });

    // Add the grade to the transcript using findOneAndUpdate with $push
    await Transcript.findOneAndUpdate(
      { studentId: id },
      { $push: { grades: newGrade._id } }
    ).exec();
  }

  /**
   * Method to get grade  for a subject from the transcript of the student
   * @param id - student id
   * @param course - course for which we need to find the grade
   * @returns String
   */
  async getGrade(id: number, course: string): Promise<string> {
    const transcript = await this.getTranscript(id);

    // Since we've populated the grades, they are full CourseGradeDocument objects
    const gradeEntry = (transcript.grades as CourseGradeDocument[]).find(
      (g) => g.course === course
    );

    if (!gradeEntry) {
      throw new Error("course not found in transcript");
    }

    return gradeEntry.grade;
  }

  /**
   * Method to get all student's Ids
   * @returns Array(Number)
   */
  async getAllStudentIDs(): Promise<number[]> {
    const transcripts = await Transcript.find()
      .select(selectAllStudentIds.select)
      .exec();
    return transcripts.map((t) => t.studentId);
  }
}
