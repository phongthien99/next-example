# 📚 Exam System - YAML-Based Structure

Hệ thống thi/quiz sử dụng YAML để quản lý nội dung một cách linh hoạt và dễ bảo trì.

## 🎯 Tổng quan

Cấu trúc này được thiết kế để:
- ✅ Dễ dàng thêm/sửa/xóa exam và câu hỏi
- ✅ Tái sử dụng câu hỏi cho nhiều exam khác nhau
- ✅ Quản lý assets (audio/image) có tổ chức
- ✅ Hỗ trợ version control (Git-friendly)
- ✅ Tối ưu performance với lazy loading
- ✅ TypeScript type-safe với schema validation

## 📁 Cấu trúc thư mục

```
public/exams/
├── index.yaml              # Danh sách tất cả exam
├── exam-01/                # Exam cụ thể
│   ├── meta.yaml          # Metadata của exam
│   ├── parts/             # Các phần thi
│   │   ├── part-01.yaml
│   │   ├── part-05.yaml
│   │   └── ...
│   ├── questions/         # Bank câu hỏi
│   │   ├── q-001.yaml
│   │   ├── q-101.yaml
│   │   └── ...
│   └── assets/            # Audio & Images
│       ├── audio/
│       └── images/
└── exam-02/
    └── ...
```

## 📝 File Schema

### 1. `index.yaml` - Danh sách Exam

Chứa tất cả exam có sẵn trong hệ thống:

```yaml
version: "1.0.0"
exams:
  - id: "exam-01"
    title: "TOEIC Practice Test 01"
    type: "toeic"
    level: "intermediate"
    totalQuestions: 200
    duration: 120
```

### 2. `meta.yaml` - Metadata Exam

Thông tin chi tiết về exam:

```yaml
id: "exam-01"
title: "TOEIC Practice Test 01"
totalParts: 7
totalQuestions: 200
duration: 120
parts:
  - id: "part-01"
    title: "Photographs"
    totalQuestions: 6
```

### 3. `part.yaml` - Thông tin Part

Cấu hình cho từng phần thi:

```yaml
id: "part-01"
title: "Photographs"
type: "listening"
totalQuestions: 6
questionIds:
  - "q-001"
  - "q-002"
```

### 4. `question.yaml` - Câu hỏi

Nội dung câu hỏi chi tiết:

```yaml
id: "q-001"
partId: "part-01"
content: "Look at the picture..."
options:
  - id: "A"
    text: "Option A"
correctAnswer: "A"
explanation: "Giải thích..."
```

## 🔧 Cách sử dụng

### Load danh sách exam

```typescript
import { parse } from 'yaml';

async function loadExamIndex() {
  const response = await fetch('/exams/index.yaml');
  const yamlText = await response.text();
  const data = parse(yamlText);
  return data.exams;
}
```

### Load metadata exam

```typescript
async function loadExamMeta(examId: string) {
  const response = await fetch(`/exams/${examId}/meta.yaml`);
  const yamlText = await response.text();
  return parse(yamlText);
}
```

### Load part

```typescript
async function loadPart(examId: string, partId: string) {
  const response = await fetch(`/exams/${examId}/parts/${partId}.yaml`);
  const yamlText = await response.text();
  return parse(yamlText);
}
```

### Load câu hỏi

```typescript
async function loadQuestions(examId: string, questionIds: string[]) {
  const questions = await Promise.all(
    questionIds.map(async (qId) => {
      const response = await fetch(`/exams/${examId}/questions/${qId}.yaml`);
      const yamlText = await response.text();
      return parse(yamlText);
    })
  );
  return questions;
}
```

## 🎨 Ví dụ sử dụng trong Next.js

### API Route

```typescript
// app/api/exams/[examId]/route.ts
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'yaml';

export async function GET(
  request: Request,
  { params }: { params: { examId: string } }
) {
  const examPath = path.join(
    process.cwd(),
    'public/exams',
    params.examId,
    'meta.yaml'
  );

  const yamlContent = await fs.readFile(examPath, 'utf8');
  const examData = parse(yamlContent);

  return Response.json(examData);
}
```

### Client Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { parse } from 'yaml';

export function ExamList() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    async function loadExams() {
      const response = await fetch('/exams/index.yaml');
      const yamlText = await response.text();
      const data = parse(yamlText);
      setExams(data.exams);
    }
    loadExams();
  }, []);

  return (
    <div>
      {exams.map(exam => (
        <div key={exam.id}>
          <h2>{exam.title}</h2>
          <p>{exam.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## 📊 Schema TypeScript

```typescript
// types/exam.ts
export interface ExamIndex {
  version: string;
  lastUpdated: string;
  exams: ExamSummary[];
}

export interface ExamSummary {
  id: string;
  title: string;
  description: string;
  type: 'toeic' | 'ielts' | 'toefl' | 'custom';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  totalQuestions: number;
  duration: number;
  isActive: boolean;
  tags: string[];
}

export interface ExamMeta {
  id: string;
  title: string;
  description: string;
  type: string;
  level: string;
  duration: number;
  totalParts: number;
  totalQuestions: number;
  parts: PartConfig[];
  settings: ExamSettings;
}

export interface Part {
  id: string;
  examId: string;
  order: number;
  title: string;
  description: string;
  type: 'listening' | 'reading';
  totalQuestions: number;
  questionIds: string[];
  settings: PartSettings;
}

export interface Question {
  id: string;
  examId: string;
  partId: string;
  questionNumber: number;
  type: 'single-choice' | 'multiple-choice' | 'true-false';
  content: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  assets?: QuestionAssets;
}

export interface QuestionAssets {
  image?: string;
  audio?: string;
  audioScript?: string;
}
```

## 🎯 Best Practices

### 1. Naming Convention

- **Exam IDs**: `exam-01`, `exam-02`, `exam-toeic-2025-01`
- **Part IDs**: `part-01`, `part-listening-01`
- **Question IDs**: `q-001`, `q-listening-01`

### 2. File Organization

- Mỗi câu hỏi nên là một file riêng
- Group assets theo part để dễ quản lý
- Sử dụng meaningful names cho files

### 3. Performance

- Lazy load questions khi cần
- Cache YAML files ở client
- Sử dụng static generation cho index

### 4. Version Control

- Commit từng exam riêng biệt
- Tag releases với semantic versioning
- Document changes trong meta.yaml

## 🚀 Tạo Exam mới

### Bước 1: Tạo thư mục

```bash
mkdir -p public/exams/exam-03/{parts,questions,assets/{audio,images}}
```

### Bước 2: Tạo meta.yaml

```yaml
id: "exam-03"
title: "Your Exam Title"
# ... other fields
```

### Bước 3: Tạo parts

```yaml
# parts/part-01.yaml
id: "part-01"
title: "Part 1"
questionIds: ["q-001", "q-002"]
```

### Bước 4: Tạo questions

```yaml
# questions/q-001.yaml
id: "q-001"
content: "Question content..."
```

### Bước 5: Cập nhật index.yaml

```yaml
exams:
  - id: "exam-03"
    title: "Your Exam Title"
    # ... other fields
```

## 📚 Tài liệu tham khảo

- [YAML Specification](https://yaml.org/)
- [YAML Parser for JS](https://github.com/eemeli/yaml)
- Xem file `STRUCTURE.md` để biết chi tiết schema

## 🤝 Contributing

Khi thêm exam/question mới:
1. Follow schema đã định nghĩa
2. Validate YAML syntax
3. Test với TypeScript types
4. Update documentation nếu cần

## ❓ FAQ

**Q: Tại sao dùng YAML thay vì JSON?**
A: YAML dễ đọc/viết hơn, hỗ trợ comments, và phù hợp cho content management.

**Q: Có thể reuse questions không?**
A: Có! Chỉ cần reference questionId từ nhiều parts/exams khác nhau.

**Q: Performance có bị ảnh hưởng không?**
A: Không, vì YAML được parse một lần và cache. Lazy loading giúp tối ưu.

**Q: Làm sao validate YAML?**
A: Sử dụng Zod schema hoặc JSON Schema để validate sau khi parse.
