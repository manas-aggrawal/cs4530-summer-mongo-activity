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
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectAllStudentIds = exports.selectAndPopulateArgsForGetTranscript = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TranscriptSchema = new mongoose_1.Schema({
    studentId: { type: Number, required: true, unique: true },
    studentName: { type: String, required: true },
    grades: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "CourseGrade",
        },
    ],
});
// Create and export the model
exports.default = mongoose_1.default.model("Transcript", TranscriptSchema);
exports.selectAndPopulateArgsForGetTranscript = {
    select: "-_id -__v",
    populate: [
        {
            path: "grades",
            select: "-_id -__v",
        },
    ],
};
exports.selectAllStudentIds = {
    select: "studentId -_id",
};
