# Exam System - Directory Structure & Schema Design

## 📁 Cấu trúc thư mục

```
public/exams/
├── index.yaml                      # Danh sách tất cả các exam
├── exam-01/                        # TOEIC Test 01
│   ├── meta.yaml                   # Thông tin exam
│   ├── parts/                      # Các phần thi
│   │   ├── part-01.yaml           # Listening - Photographs
│   │   ├── part-02.yaml           # Listening - Question-Response
│   │   ├── part-03.yaml           # Listening - Conversations
│   │   ├── part-04.yaml           # Listening - Talks
│   │   ├── part-05.yaml           # Reading - Incomplete Sentences
│   │   ├── part-06.yaml           # Reading - Text Completion
│   │   └── part-07.yaml           # Reading - Reading Comprehension
│   ├── questions/                  # Bank câu hỏi
│   │   ├── q-001.yaml
│   │   ├── q-002.yaml
│   │   ├── q-003.yaml
│   │   └── ...
│   └── assets/                     # Audio/Image
│       ├── audio/
│       │   ├── part-01/
│       │   │   ├── q-001.mp3
│       │   │   └── ...
│       │   ├── part-02/
│       │   └── ...
│       └── images/
│           ├── part-01/
│           │   ├── q-001.jpg
│           │   └── ...
│           └── part-07/
│               └── ...
├── exam-02/
│   ├── meta.yaml
│   ├── parts/
│   ├── questions/
│   └── assets/
└── ...

```

## 📋 Schema Definitions

### 1. index.yaml - Danh sách Exam

```yaml
# Metadata
version: "1.0.0"
lastUpdated: "2025-12-28T14:00:00Z"

# Danh sách exams
exams:
  - id: "exam-01"
    title: "TOEIC Practice Test 01"
    description: "Full-length TOEIC practice test with 7 parts"
    type: "toeic"
    level: "intermediate"
    totalQuestions: 200
    duration: 120 # minutes
    isActive: true
    createdAt: "2025-01-01T00:00:00Z"
    updatedAt: "2025-01-15T10:30:00Z"
    tags: ["toeic", "listening", "reading"]
    thumbnail: "/exams/exam-01/assets/images/thumbnail.jpg"

  - id: "exam-02"
    title: "TOEIC Practice Test 02"
    description: "Advanced TOEIC test for score improvement"
    type: "toeic"
    level: "advanced"
    totalQuestions: 200
    duration: 120
    isActive: true
    createdAt: "2025-01-05T00:00:00Z"
    updatedAt: "2025-01-20T14:20:00Z"
    tags: ["toeic", "advanced", "practice"]
    thumbnail: "/exams/exam-02/assets/images/thumbnail.jpg"

# Exam types supported
examTypes:
  - id: "toeic"
    name: "TOEIC"
    description: "Test of English for International Communication"
  - id: "ielts"
    name: "IELTS"
    description: "International English Language Testing System"
  - id: "custom"
    name: "Custom Quiz"
    description: "User-created custom quizzes"

# Difficulty levels
levels:
  - id: "beginner"
    name: "Beginner"
    description: "For learners starting out"
  - id: "intermediate"
    name: "Intermediate"
    description: "For learners with basic knowledge"
  - id: "advanced"
    name: "Advanced"
    description: "For experienced learners"
```

### 2. meta.yaml - Thông tin Exam

```yaml
# Exam Metadata
id: "exam-01"
title: "TOEIC Practice Test 01"
description: "Full-length TOEIC practice test covering all 7 parts"
type: "toeic"
level: "intermediate"
version: "1.0.0"

# Timing
duration: 120 # minutes
totalTime: 7200 # seconds (alternative)

# Structure
totalParts: 7
totalQuestions: 200

# Scoring
passingScore: 400
maxScore: 990
scoringRules:
  listening:
    minScore: 5
    maxScore: 495
    parts: ["part-01", "part-02", "part-03", "part-04"]
  reading:
    minScore: 5
    maxScore: 495
    parts: ["part-05", "part-06", "part-07"]

# Parts configuration
parts:
  - id: "part-01"
    order: 1
    title: "Photographs"
    description: "Listen and select the statement that best describes the photograph"
    type: "listening"
    totalQuestions: 10
    timeLimit: null # no individual time limit

  - id: "part-02"
    order: 2
    title: "Question-Response"
    description: "Listen to a question and select the best response"
    type: "listening"
    totalQuestions: 30
    timeLimit: null

  - id: "part-03"
    order: 3
    title: "Conversations"
    description: "Listen to conversations and answer questions"
    type: "listening"
    totalQuestions: 39
    timeLimit: null

  - id: "part-04"
    order: 4
    title: "Talks"
    description: "Listen to talks and answer questions"
    type: "listening"
    totalQuestions: 30
    timeLimit: null

  - id: "part-05"
    order: 5
    title: "Incomplete Sentences"
    description: "Complete the sentences with the best option"
    type: "reading"
    totalQuestions: 30
    timeLimit: null

  - id: "part-06"
    order: 6
    title: "Text Completion"
    description: "Complete the texts with appropriate words or phrases"
    type: "reading"
    totalQuestions: 16
    timeLimit: null

  - id: "part-07"
    order: 7
    title: "Reading Comprehension"
    description: "Read passages and answer comprehension questions"
    type: "reading"
    totalQuestions: 54
    timeLimit: null

# Metadata
createdAt: "2025-01-01T00:00:00Z"
updatedAt: "2025-01-15T10:30:00Z"
createdBy: "admin"
tags: ["toeic", "listening", "reading", "practice"]
isActive: true
isPublished: true

# Additional settings
settings:
  allowReview: true # Allow review after submission
  showExplanation: true # Show explanations
  shuffleQuestions: false # Don't shuffle questions
  shuffleOptions: false # Don't shuffle answer options
  allowSkip: true # Allow skipping questions
  showTimer: true # Show countdown timer
  autoSubmit: true # Auto-submit when time is up
```

### 3. part.yaml - Thông tin Part

```yaml
# Part Metadata
id: "part-01"
examId: "exam-01"
order: 1
title: "Photographs"
description: "Listen to four statements about a photograph and select the one that best describes what you see"
type: "listening"

# Structure
totalQuestions: 10
timeLimit: null # null = no individual time limit, uses exam's total time

# Instructions
instructions: |
  Directions: For each question in this part, you will hear four statements about a picture in your test book. When you hear the statements, you must select the one statement that best describes what you see in the picture. Then find the number of the question on your answer sheet and mark your answer.

  The statements will not be printed in your test book and will be spoken only one time.

# Question IDs (references to questions/ directory)
questionIds:
  - "q-001"
  - "q-002"
  - "q-003"
  - "q-004"
  - "q-005"
  - "q-006"
  - "q-007"
  - "q-008"
  - "q-009"
  - "q-010"

# Settings
settings:
  hasAudio: true
  hasImage: true
  hasPassage: false
  autoPlayAudio: false
  allowAudioReplay: true
  maxAudioReplays: 2

# Scoring
pointsPerQuestion: 1
totalPoints: 10

# Metadata
createdAt: "2025-01-01T00:00:00Z"
updatedAt: "2025-01-10T15:00:00Z"
```

### 4. question.yaml - Câu hỏi

#### Example 1: Listening Question with Image (Part 1)

```yaml
# Question Metadata
id: "q-001"
examId: "exam-01"
partId: "part-01"
questionNumber: 1
type: "single-choice"

# Question Content
content: |
  Look at the picture and listen to the four statements. Select the statement that best describes the picture.

# Media Assets
assets:
  image: "/exams/exam-01/assets/images/part-01/q-001.jpg"
  audio: "/exams/exam-01/assets/audio/part-01/q-001.mp3"
  # Audio script (not shown to students during test)
  audioScript: |
    (A) They're looking at a computer screen.
    (B) They're sitting at separate desks.
    (C) They're working on a presentation.
    (D) They're standing in a meeting room.

# Answer Options
options:
  - id: "A"
    text: "They're looking at a computer screen."
    audio: null # audio is in the main audio file

  - id: "B"
    text: "They're sitting at separate desks."
    audio: null

  - id: "C"
    text: "They're working on a presentation."
    audio: null

  - id: "D"
    text: "They're standing in a meeting room."
    audio: null

# Correct Answer
correctAnswer: "A"

# Explanation (shown after answer)
explanation: |
  **Correct Answer: A**

  The photograph shows two people looking at a computer screen together.

  - (A) ✓ Correct - They are indeed looking at a computer screen
  - (B) ✗ Incorrect - They are sitting together, not at separate desks
  - (C) ✗ Incorrect - While they might be working, we cannot confirm it's a presentation
  - (D) ✗ Incorrect - They are sitting, not standing

# Difficulty and Categorization
difficulty: "easy"
category: "listening-photographs"
tags: ["office", "workplace", "computer"]
skills: ["listening", "visual-comprehension"]

# Points
points: 1

# Metadata
createdAt: "2025-01-01T00:00:00Z"
updatedAt: "2025-01-05T10:00:00Z"
createdBy: "content-team"
```

#### Example 2: Reading Question (Part 5)

```yaml
# Question Metadata
id: "q-101"
examId: "exam-01"
partId: "part-05"
questionNumber: 101
type: "single-choice"

# Question Content
content: |
  The marketing team _______ a comprehensive strategy for the new product launch next month.

# No media assets for reading questions
assets: null

# Answer Options
options:
  - id: "A"
    text: "develops"

  - id: "B"
    text: "developed"

  - id: "C"
    text: "will develop"

  - id: "D"
    text: "has developed"

# Correct Answer
correctAnswer: "D"

# Explanation
explanation: |
  **Correct Answer: D - has developed**

  This sentence uses the present perfect tense because the strategy was completed in the past but is relevant to the present situation (the upcoming product launch next month).

  **Grammar Point:** Present Perfect Tense
  - Form: has/have + past participle
  - Use: Actions completed in the past with present relevance

  **Why other options are incorrect:**
  - (A) "develops" - Simple present doesn't fit the context
  - (B) "developed" - Simple past suggests disconnection from present
  - (C) "will develop" - Future tense contradicts that strategy is ready

# Difficulty and Categorization
difficulty: "intermediate"
category: "grammar-verb-tenses"
tags: ["present-perfect", "verb-tenses", "grammar"]
skills: ["grammar", "verb-usage"]

# Points
points: 1

# Metadata
createdAt: "2025-01-01T00:00:00Z"
updatedAt: "2025-01-05T10:00:00Z"
createdBy: "content-team"
```

#### Example 3: Reading Comprehension with Passage (Part 7)

```yaml
# Question Metadata
id: "q-151"
examId: "exam-01"
partId: "part-07"
questionNumber: 151
type: "single-choice"

# Passage (shared by multiple questions)
passage:
  id: "passage-01"
  type: "email"
  title: "Email about Company Retreat"
  content: |
    From: sarah.johnson@techcorp.com
    To: all-staff@techcorp.com
    Subject: Annual Company Retreat - June 15-17
    Date: May 15, 2025

    Dear Team,

    I'm excited to announce that our annual company retreat will be held at the Seaside Resort from June 15-17. All employees are required to attend the orientation session on the first day at 9:00 AM.

    Lunch will be provided on all three days, and we have planned exciting team-building activities for the afternoons. The retreat will conclude with an awards dinner on the final evening.

    Please confirm your attendance by May 30th by replying to this email. If you have any dietary restrictions, please let us know in your response.

    Looking forward to seeing everyone there!

    Best regards,
    Sarah Johnson
    HR Director

# Question Content
content: |
  What is the main purpose of this email?

# Answer Options
options:
  - id: "A"
    text: "To announce a vacation policy change"

  - id: "B"
    text: "To inform employees about a company retreat"

  - id: "C"
    text: "To schedule a meeting with management"

  - id: "D"
    text: "To advertise a new resort"

# Correct Answer
correctAnswer: "B"

# Explanation
explanation: |
  **Correct Answer: B - To inform employees about a company retreat**

  The email's subject line "Annual Company Retreat" and opening sentence clearly state that the purpose is to announce the company retreat details.

  **Why other options are incorrect:**
  - (A) Vacation policy - Not mentioned
  - (C) Meeting with management - This is a retreat, not a meeting
  - (D) Advertising a resort - The email is for employees, not advertising

# Difficulty and Categorization
difficulty: "easy"
category: "reading-comprehension-email"
tags: ["email", "main-idea", "business-communication"]
skills: ["reading", "comprehension", "identifying-purpose"]

# Related Questions (same passage)
relatedQuestions:
  - "q-152" # When is the deadline to confirm attendance?
  - "q-153" # What time is the orientation?

# Points
points: 1

# Metadata
createdAt: "2025-01-01T00:00:00Z"
updatedAt: "2025-01-05T10:00:00Z"
createdBy: "content-team"
```

## 🔧 Cách sử dụng

### 1. Load danh sách exams
```typescript
// Fetch index
const response = await fetch('/exams/index.yaml');
const indexData = yaml.parse(await response.text());
```

### 2. Load thông tin exam
```typescript
// Fetch exam metadata
const metaResponse = await fetch('/exams/exam-01/meta.yaml');
const examMeta = yaml.parse(await metaResponse.text());
```

### 3. Load một part
```typescript
// Fetch part
const partResponse = await fetch('/exams/exam-01/parts/part-01.yaml');
const partData = yaml.parse(await partResponse.text());
```

### 4. Load câu hỏi
```typescript
// Load questions for a part
const questions = await Promise.all(
  partData.questionIds.map(async (qId) => {
    const qResponse = await fetch(`/exams/exam-01/questions/${qId}.yaml`);
    return yaml.parse(await qResponse.text());
  })
);
```

## ✅ Ưu điểm của cấu trúc này

1. **Modular**: Mỗi câu hỏi là file riêng, dễ quản lý
2. **Scalable**: Dễ thêm exam mới, part mới
3. **Reusable**: Câu hỏi có thể dùng lại cho nhiều exam
4. **Version Control**: Git-friendly, dễ track changes
5. **Performance**: Load theo nhu cầu (lazy loading)
6. **Maintainable**: Dễ cập nhật, sửa đổi
7. **Clear Separation**: Part và Question tách biệt rõ ràng
8. **Asset Management**: Quản lý audio/image có tổ chức
9. **API Ready**: Dễ tạo API endpoints
10. **Type Safe**: Có thể tạo TypeScript types từ schema

## 🎯 Next Steps

1. Tạo TypeScript interfaces/types từ schema
2. Tạo validation schema (Zod)
3. Tạo API routes để serve exam data
4. Tạo repository pattern để load data
5. Implement caching strategy
