# cs4530-summer-mongo-activity
# MongoDB Transcript Service

A Node.js Express application that manages student transcripts using MongoDB. This service allows you to add students, record grades, and retrieve transcript information through a RESTful API.

## 📋 Project Overview

This project implements a transcript management system with the following features:
- Add new students
- Retrieve student information by ID or name
- Add course grades to student transcripts
- Retrieve complete transcripts with grades
- Query specific grades for specific courses

## 🚀 Getting Started

### Prerequisites
- Node.js (v23.11)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mongo-transcript-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   
   Create a `.env` file in the root directory with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/transcript-db
   PORT=3000
   ```
   
   If you're using MongoDB Atlas, replace the MONGO_URI with your connection string.

4. **Build the project**
   ```bash
   npm run build
   ```

## 🏃‍♂️ Running the Application

### Development Mode
Run the application with hot reloading:
```bash
npm run dev
```

### Production Mode
Build and start the production server:
```bash
npm run build
npm start
```

## 🧪 Testing
Run the tests to ensure everything is working correctly:
```bash
npm test
```

Run tests with coverage report:
```bash
npm run test:coverage
```

## 📝 Tasks to Complete

Before the application will function correctly, you need to complete the following tasks that are marked in the code:

### Task 1: Complete the Transcript Schema
In `src/models/transcript.ts`, define the proper schema for:
- `studentName` field (should be a required string)
- `grades` field (should be an array of references to the CourseGrade model)

### Task 2: Configure Field Selection
In `src/models/transcript.ts`, update `selectAndPopulateArgsForGetTranscript` to select only necessary fields and exclude MongoDB's default fields.

### Task 3: Configure Population
In `src/models/transcript.ts`, update the `populate` array in `selectAndPopulateArgsForGetTranscript` to properly populate the grades field and select only the necessary fields from grades.

### Task 4: Implement Student Creation
In `src/services/mongo-transcript.service.ts`, implement the `addStudent` method to create a new student transcript in the database.

### Task 5: Implement Transcript Retrieval
In `src/services/mongo-transcript.service.ts`, update the `getTranscript` method to select and populate fields according to the configuration from Task 2 and 3.

### Task 6: Implement Grade Addition
In `src/services/mongo-transcript.service.ts`, implement the `addGrade` method using MongoDB's `$push` operator to add a new grade to a student's transcript.

## 📚 API Documentation

### Students

**Create a new student**
```
POST /students
Body: { "name": "John Doe" }
```

**Get all student IDs**
```
GET /students
```

**Search students by name**
```
GET /students/search?name=John
```

### Transcripts

**Get a student's transcript**
```
GET /transcripts/:id
```

**Add a grade to a student's transcript**
```
POST /transcripts/:id/grades
Body: { "course": "Math 101", "grade": 95 }
```

## 📁 Project Structure

```
mongo-transcript-service/
├── src/
│   ├── config/
│   │   └── db.ts                # MongoDB connection setup
│   ├── models/
│   │   ├── course.ts            # CourseGrade model definition
│   │   └── transcript.ts        # Transcript model definition
│   ├── services/
│   │   └── mongo-transcript.service.ts  # Service implementation
│   ├── types/
│   │   ├── common.type.ts       # Shared type definitions
│   │   ├── course.type.ts       # CourseGrade type definitions
│   │   └── transcript.type.ts   # Transcript type definitions
│   ├── app.ts                   # Express app setup and routes
│   └── index.ts                 # Application entry point
├── tests/
│   └── api.test.ts              # API tests
├── .env                         # Environment variables
├── package.json                 # Project dependencies
└── tsconfig.json                # TypeScript configuration
```

## 🛠️ Tips for Completing the Tasks

- Look for the commented sections in the code marked with `TASK #` comments
- Refer to the Mongoose documentation for details on schemas, population, and queries
- Check the test cases to understand the expected behavior
- MongoDB's `$push` operator adds items to an array field