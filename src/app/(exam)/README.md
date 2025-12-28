# Exam Module - Clean Architecture

Module exam được refactor theo Clean Architecture pattern, tách biệt rõ ràng giữa các layer và tuân thủ các nguyên tắc SOLID.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  page.tsx, components/ (Timer, QuestionDisplay, etc.)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│        hooks/UseExamManagement.ts (State Management)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Dependency Injection Layer                  │
│     providers/ExamRepositoryProvider.tsx (DI Context)        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  repositories/ (IExamRepository, InMemory, Registry)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Domain Layer                           │
│    models/, core/, dto/ (Business Logic & Entities)          │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
exam/
├── components/          # UI Components (Presentation Layer)
│   ├── Timer.tsx
│   ├── QuestionNavigationGrid.tsx
│   ├── QuizActions.tsx
│   ├── QuestionDisplay.tsx
│   ├── QuizNavigation.tsx
│   └── QuizSummary.tsx
│
├── core/               # Business Logic (Domain Layer)
│   └── ExamLogic.ts    # Pure functions for quiz operations
│
├── dto/                # Data Transfer Objects
│   └── ExamTypes.ts    # Zod schemas and types
│
├── hooks/              # Application Logic
│   └── UseExamManagement.ts  # State management hook
│
├── models/             # Domain Models (Entities)
│   ├── Question.ts
│   └── Quiz.ts
│
├── providers/          # Dependency Injection
│   └── ExamRepositoryProvider.tsx  # Repository context
│
├── repositories/       # Data Access Layer
│   ├── IExamRepository.ts          # Repository interface
│   ├── InMemoryExamRepository.ts   # In-memory implementation
│   └── ExamRepositoryRegistry.ts   # Factory pattern
│
├── page.tsx           # Main route component
└── index.ts           # Barrel exports
```

## Key Features

### 1. Domain Models
- **Question**: Quiz question entity with options
- **QuizSession**: Quiz session state with answers, flags, time tracking
- **QuizProgress**: Calculated progress metrics

### 2. Business Logic (Core)
Pure functions in `core/ExamLogic.ts`:
- `validateQuizSessionInput()`: Input validation
- `validateAnswerSubmission()`: Answer validation
- `createQuizSessionEntity()`: Entity creation
- `calculateQuizProgress()`: Progress calculation
- `formatTime()`: Time formatting
- `toggleQuestionFlag()`: Flag management

### 3. Repository Pattern
- **IExamRepository**: Interface defining data access contract
- **InMemoryExamRepository**: Mock implementation with 50 AWS DevOps questions
- **ExamRepositoryRegistry**: Factory for repository instantiation

### 4. Dependency Injection
- **ExamRepositoryProvider**: React Context for DI
- **useExamRepository**: Hook to access repository

### 5. Application Layer
**UseExamManagement** hook provides:
- Quiz initialization
- Question navigation
- Answer selection
- Flag toggling
- Pause/Resume functionality
- Time tracking

### 6. UI Components
Reusable, pure components:
- **Timer**: Displays elapsed time with pause indicator
- **QuestionNavigationGrid**: Grid of question buttons with status
- **QuizActions**: Action buttons (flag, pause, summary)
- **QuestionDisplay**: Question content and answer options
- **QuizNavigation**: Previous/Next navigation
- **QuizSummary**: Modal showing progress statistics

## Usage Example

```tsx
import { ExamRepositoryProvider } from './providers/ExamRepositoryProvider';
import { useExamManagement } from './hooks/UseExamManagement';

function ExamContent() {
  const {
    questions,
    currentSession,
    currentQuestion,
    progress,
    initializeQuiz,
    navigateToQuestion,
    selectAnswer,
    toggleFlag,
  } = useExamManagement();

  // Use the hook methods...
}

export default function ExamPage() {
  return (
    <ExamRepositoryProvider repositoryType="memory">
      <ExamContent />
    </ExamRepositoryProvider>
  );
}
```

## Clean Architecture Principles

### 1. Dependency Inversion Principle (DIP)
- High-level modules depend on abstractions (IExamRepository)
- Implementations can be swapped via registry

### 2. Separation of Concerns
- Domain logic in `core/` and `models/`
- Data access in `repositories/`
- UI in `components/`
- State management in `hooks/`

### 3. Single Responsibility Principle (SRP)
- Each module has one reason to change
- Components only handle UI
- Hooks handle state orchestration
- Core handles business logic

### 4. Testability
- Pure functions are easily testable
- Repository interface allows mocking
- Components receive props and callbacks

## Future Enhancements

1. **API Repository**: Implement API-based repository for real backend
2. **Question Bank Management**: CRUD operations for questions
3. **Result Analysis**: Quiz scoring and answer review
4. **Persistence**: Save/restore quiz sessions
5. **Multiple Quiz Sets**: Support different exam categories

## Migration Notes

### Changes from Old JSX Implementation

**Before:**
- Monolithic JSX components
- Mixed business logic and UI
- No type safety
- Hard-coded data in components

**After:**
- TypeScript with full type safety
- Separated layers (Domain, Application, Infrastructure, Presentation)
- Repository pattern for data access
- Dependency injection
- Reusable, testable components
- Pure business logic functions

### Key Improvements
- ✅ Full TypeScript type safety
- ✅ Clean Architecture separation
- ✅ Dependency Injection via Context
- ✅ Repository Pattern for data access
- ✅ Pure business logic functions
- ✅ Reusable UI components
- ✅ Better testability
- ✅ Easier to maintain and extend
