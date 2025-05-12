"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoTranscriptService = void 0;
const transcript_1 = __importStar(require("../models/transcript"));
const course_1 = __importDefault(require("../models/course"));
class MongoTranscriptService {
    constructor() {
        this.initializeLastID();
    }
    /**
     *
     */
    async initializeLastID() {
        // Find the highest studentId in the database
        const highestStudent = await transcript_1.default.findOne()
            .sort({ studentId: -1 })
            .exec();
        this.lastID = highestStudent ? highestStudent.studentId + 1 : 0;
    }
    /**
     * Method to add student to the database
     * @param newName - name of the student to be added
     * @returns Number
     */
    async addStudent(newName) {
        const newID = this.lastID++;
        await transcript_1.default.create({
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
    async nameToIDs(studentName) {
        const transcripts = await transcript_1.default.find({
            studentName,
        }).exec();
        return transcripts.map((t) => t.studentId);
    }
    /**
     * Method to get transcript of grades of a student
     * @param id - id of the student whose transcript we are fetching
     * @returns TranscriptDocument
     */
    async getTranscript(id) {
        const transcript = await transcript_1.default.findOne({ studentId: id })
            .select(transcript_1.selectAndPopulateArgsForGetTranscript.select)
            .populate(transcript_1.selectAndPopulateArgsForGetTranscript.populate)
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
    async addGrade(id, course, grade) {
        // First check if the student exists
        const transcript = await transcript_1.default.findOne({ studentId: id });
        if (!transcript) {
            throw new Error("unknown ID");
        }
        // Create a new CourseGrade document
        const newGrade = await course_1.default.create({
            course,
            grade,
        });
        // Add the grade to the transcript using findOneAndUpdate with $push
        await transcript_1.default.findOneAndUpdate({ studentId: id }, { $push: { grades: newGrade._id } }).exec();
    }
    /**
     * Method to get grade  for a subject from the transcript of the student
     * @param id - student id
     * @param course - course for which we need to find the grade
     * @returns String
     */
    async getGrade(id, course) {
        const transcript = await this.getTranscript(id);
        // Since we've populated the grades, they are full CourseGradeDocument objects
        const gradeEntry = transcript.grades.find((g) => g.course === course);
        if (!gradeEntry) {
            throw new Error("course not found in transcript");
        }
        return gradeEntry.grade;
    }
    /**
     * Method to get all student's Ids
     * @returns Array(Number)
     */
    async getAllStudentIDs() {
        const transcripts = await transcript_1.default.find()
            .select(transcript_1.selectAllStudentIds.select)
            .exec();
        return transcripts.map((t) => t.studentId);
    }
}
exports.MongoTranscriptService = MongoTranscriptService;
