# API Contract: User Signup

**Feature**: User Sign-Up  
**Branch**: `001-feat-sign-up`  
**Date**: 2025-10-09  
**API Version**: v1

## Overview

This document defines the HTTP API contract for user signup operations. The frontend application calls this external API endpoint to register new users.

---

## Endpoint: Create User Account

### Request

**Method**: `POST`  
**Path**: `/api/signup` (or `/api/v1/users/signup`)  
**Content-Type**: `application/json`  
**Authentication**: None (public endpoint)

#### Request Body

```json
{
  "name": "string",
  "email": "string"
}
```

**Field Specifications**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | string | ✅ Yes | 2-100 characters, trimmed | User's full name |
| `email` | string | ✅ Yes | Valid email format (RFC 5322), unique | User's email address |

**Example Request**:
```http
POST /api/signup HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

### Response: Success (201 Created)

**Status Code**: `201 Created`  
**Content-Type**: `application/json`

#### Response Body

```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string",
  "createdAt": "string (ISO 8601)",
  "emailVerified": boolean
}
```

**Field Specifications**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique identifier for the created user |
| `name` | string | User's full name (as provided) |
| `email` | string | User's email address (lowercase) |
| `createdAt` | string (ISO 8601) | Timestamp of account creation |
| `emailVerified` | boolean | Email verification status (initially `false`) |

**Example Success Response**:
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-10-09T14:30:00.000Z",
  "emailVerified": false
}
```

---

### Response: Validation Error (400 Bad Request)

**Status Code**: `400 Bad Request`  
**Content-Type**: `application/json`

#### Response Body

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

**Example Validation Error**:
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name must be at least 2 characters"
    },
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

**Common Validation Errors**:
- Name too short: `"Name must be at least 2 characters"`
- Name too long: `"Name must not exceed 100 characters"`
- Name empty: `"Name is required"`
- Email invalid: `"Please enter a valid email address"`
- Email empty: `"Email is required"`

---

### Response: Duplicate Email (409 Conflict)

**Status Code**: `409 Conflict`  
**Content-Type**: `application/json`

#### Response Body

```json
{
  "error": "Email already registered",
  "message": "An account with this email address already exists",
  "code": "DUPLICATE_EMAIL"
}
```

**Example Duplicate Error**:
```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": "Email already registered",
  "message": "An account with this email address already exists",
  "code": "DUPLICATE_EMAIL"
}
```

---

### Response: Server Error (500 Internal Server Error)

**Status Code**: `500 Internal Server Error`  
**Content-Type**: `application/json`

#### Response Body

```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred. Please try again later.",
  "requestId": "string (optional)"
}
```

**Example Server Error**:
```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "Internal server error",
  "message": "An unexpected error occurred. Please try again later.",
  "requestId": "req_abc123xyz"
}
```

---

## Endpoint: Check Email Existence (Optional)

### Request

**Method**: `GET`  
**Path**: `/api/signup/check-email?email={email}`  
**Authentication**: None (public endpoint)

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | ✅ Yes | Email address to check |

**Example Request**:
```http
GET /api/signup/check-email?email=john@example.com HTTP/1.1
Host: api.example.com
```

---

### Response: Email Check (200 OK)

**Status Code**: `200 OK`  
**Content-Type**: `application/json`

#### Response Body

```json
{
  "exists": boolean,
  "email": "string"
}
```

**Example Response (Email Exists)**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "exists": true,
  "email": "john@example.com"
}
```

**Example Response (Email Available)**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "exists": false,
  "email": "new@example.com"
}
```

---

## Status Code Summary

| Status Code | Meaning | When Used |
|-------------|---------|-----------|
| `201 Created` | Success | User account created successfully |
| `400 Bad Request` | Validation Error | Invalid input data (name/email format) |
| `409 Conflict` | Duplicate Email | Email address already registered |
| `500 Internal Server Error` | Server Error | Unexpected server-side failure |
| `503 Service Unavailable` | Service Down | API temporarily unavailable |

---

## Error Code Reference

| Error Code | HTTP Status | Description | User Message |
|------------|-------------|-------------|--------------|
| `VALIDATION_FAILED` | 400 | Input validation failed | "Please check your input and try again" |
| `DUPLICATE_EMAIL` | 409 | Email already exists | "This email is already registered. Please log in or use a different email." |
| `INTERNAL_ERROR` | 500 | Server error | "Something went wrong. Please try again later." |
| `SERVICE_UNAVAILABLE` | 503 | API down | "Service is temporarily unavailable. Please try again shortly." |

---

## Request/Response Examples

### Example 1: Successful Signup

**Request**:
```bash
curl -X POST https://api.example.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
  }'
```

**Response**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "createdAt": "2025-10-09T15:45:23.456Z",
  "emailVerified": false
}
```

---

### Example 2: Validation Error

**Request**:
```bash
curl -X POST https://api.example.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "email": "invalid-email"
  }'
```

**Response**:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name must be at least 2 characters"
    },
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

---

### Example 3: Duplicate Email

**Request**:
```bash
curl -X POST https://api.example.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "existing@example.com"
  }'
```

**Response**:
```json
{
  "error": "Email already registered",
  "message": "An account with this email address already exists",
  "code": "DUPLICATE_EMAIL"
}
```

---

## Frontend Integration Notes

### ApiSignupRepository Implementation

```typescript
// src/app/signup/repositories/ApiSignupRepository.ts
import { SignupInput, SignupOutput, SignupOutputSchema } from '../dto/SignupTypes';
import { User } from '../models/User';
import { DuplicateEmailError, SignupAPIError } from '../dto/SignupTypes';
import { ISignupRepository } from './ISignupRepository';

export class ApiSignupRepository implements ISignupRepository {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '') {
    this.baseUrl = baseUrl;
  }

  async signup(input: SignupInput): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      // Handle duplicate email (409 Conflict)
      if (response.status === 409) {
        const errorData = await response.json();
        throw new DuplicateEmailError(input.email);
      }

      // Handle validation errors (400 Bad Request)
      if (response.status === 400) {
        const errorData = await response.json();
        throw new SignupAPIError(
          400,
          errorData.error || 'Validation failed',
          errorData.details
        );
      }

      // Handle other errors
      if (!response.ok) {
        throw new SignupAPIError(
          response.status,
          `Signup failed with status ${response.status}`
        );
      }

      // Parse and validate response
      const data = await response.json();
      const validated = SignupOutputSchema.parse(data);

      // Convert to User domain model
      return {
        id: validated.id,
        name: validated.name,
        email: validated.email,
        createdAt: new Date(validated.createdAt),
        emailVerified: validated.emailVerified,
      };
    } catch (error) {
      if (error instanceof DuplicateEmailError || error instanceof SignupAPIError) {
        throw error;
      }
      throw new SignupAPIError(500, 'Network error or unexpected failure');
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/signup/check-email?email=${encodeURIComponent(email)}`
      );
      if (!response.ok) return false;
      const data = await response.json();
      return data.exists === true;
    } catch {
      return false; // Fail silently for email check
    }
  }
}
```

---

## Environment Variables

**Required Configuration**:

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
```

**Development**:
```env
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Production**:
```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.production.example.com
```

---

## Testing with MSW (Mock Service Worker)

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

const mockUsers: { name: string; email: string }[] = [];

export const signupHandlers = [
  // POST /api/signup
  http.post('/api/signup', async ({ request }) => {
    const body = await request.json() as { name: string; email: string };

    // Check duplicate
    if (mockUsers.some(u => u.email.toLowerCase() === body.email.toLowerCase())) {
      return HttpResponse.json(
        {
          error: 'Email already registered',
          message: 'An account with this email address already exists',
          code: 'DUPLICATE_EMAIL',
        },
        { status: 409 }
      );
    }

    // Validate
    if (!body.name || body.name.length < 2) {
      return HttpResponse.json(
        {
          error: 'Validation failed',
          details: [{ field: 'name', message: 'Name must be at least 2 characters' }],
        },
        { status: 400 }
      );
    }

    // Success
    const user = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email.toLowerCase(),
      createdAt: new Date().toISOString(),
      emailVerified: false,
    };
    mockUsers.push({ name: user.name, email: user.email });

    return HttpResponse.json(user, { status: 201 });
  }),

  // GET /api/signup/check-email
  http.get('/api/signup/check-email', ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const exists = mockUsers.some(u => u.email.toLowerCase() === email?.toLowerCase());
    return HttpResponse.json({ exists, email });
  }),
];
```

---

## Security Considerations

1. **Rate Limiting**: API should implement rate limiting to prevent abuse (e.g., max 5 signups per IP per hour)
2. **Input Sanitization**: Backend must sanitize inputs to prevent injection attacks
3. **Email Verification**: Accounts should require email verification before allowing login
4. **HTTPS Only**: All API requests must use HTTPS in production
5. **CORS**: Configure appropriate CORS headers for frontend domain

---

## Next Steps

1. ✅ API contract complete
2. → Create `quickstart.md` for local development
3. → Implement repository classes following this contract
4. → Setup MSW handlers for testing
