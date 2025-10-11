# API Contract: Forgot Password

**Feature**: 002-feat-forgot-password  
**Date**: 2025-10-10  
**Purpose**: Define external API contract for password reset requests

## Overview

This document defines the API contract between the frontend and the external password reset API. The frontend sends a password reset request with an email address, and the API responds with success or error status.

**Security Note**: The API MUST return the same success message for both registered and unregistered emails to prevent email enumeration attacks.

## Base Configuration

**Base URL**: Configured via environment variable

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

**Endpoint**: `/api/forgot-password`

**Full URL**: `${NEXT_PUBLIC_API_BASE_URL}/api/forgot-password`

**Method**: `POST`

**Content-Type**: `application/json`

## Request

### Request Headers

```http
POST /api/forgot-password HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json
```

**Required Headers**:
- `Content-Type: application/json`
- `Accept: application/json`

**Optional Headers**:
- `User-Agent`: Browser identification
- `Accept-Language`: Locale preference (for translated emails)

### Request Body

**Schema**:
```json
{
  "email": "string (required, email format)"
}
```

**Validation Rules**:
- `email`: Required, valid email format, max 254 characters
- Email will be trimmed and lowercased by client before sending
- No additional fields accepted

**Example Request**:
```http
POST /api/forgot-password HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**TypeScript Interface**:
```typescript
interface ForgotPasswordRequest {
  email: string;
}
```

## Response

### Success Response (200 OK)

**Status Code**: `200 OK`

**Response Body**:
```json
{
  "success": true,
  "message": "If an account exists with this email, a reset link has been sent."
}
```

**Schema**:
- `success`: Boolean, always `true` for 200 response
- `message`: String, user-friendly message (same for all emails)

**Important**: The message MUST be the same whether the email exists or not (security requirement).

**TypeScript Interface**:
```typescript
interface ForgotPasswordSuccessResponse {
  success: true;
  message: string;
}
```

**Example**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "If an account exists with this email, a reset link has been sent."
}
```

### Error Response (400 Bad Request)

**Status Code**: `400 Bad Request`

**Use Case**: Invalid email format (shouldn't happen if client validation works)

**Response Body**:
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

**Schema**:
- `success`: Boolean, always `false` for error responses
- `message`: String, user-friendly error message

**TypeScript Interface**:
```typescript
interface ForgotPasswordErrorResponse {
  success: false;
  message: string;
}
```

**Example**:
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "message": "Invalid email format"
}
```

### Error Response (500 Internal Server Error)

**Status Code**: `500 Internal Server Error`

**Use Case**: Server error, email service failure, database issue

**Response Body**:
```json
{
  "success": false,
  "message": "Something went wrong. Please try again later."
}
```

**Frontend Handling**: Display generic error message to user, log details for debugging

**Example**:
```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "success": false,
  "message": "Something went wrong. Please try again later."
}
```

### Error Response (429 Too Many Requests)

**Status Code**: `429 Too Many Requests`

**Use Case**: Rate limit exceeded (too many requests from same IP or email)

**Response Body**:
```json
{
  "success": false,
  "message": "Too many requests. Please try again in a few minutes."
}
```

**Frontend Handling**: Display rate limit message, disable submit button temporarily

**Example**:
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 300

{
  "success": false,
  "message": "Too many requests. Please try again in a few minutes."
}
```

## Network Errors

### Connection Failure

**Scenario**: API unreachable, network offline, DNS failure

**Frontend Handling**:
- Catch `fetch()` network errors
- Display: "Unable to connect. Please check your internet connection."
- Allow retry

**Error Type**: `TypeError` or `NetworkError`

### Timeout

**Scenario**: Request takes too long (> 30 seconds)

**Frontend Handling**:
- Implement request timeout
- Display: "Request timed out. Please try again."
- Allow retry

**Implementation**:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

try {
  const response = await fetch(url, {
    signal: controller.signal,
    // ... other options
  });
} catch (error) {
  if (error.name === 'AbortError') {
    // Handle timeout
  }
}
```

## Request/Response Examples

### Happy Path (Registered Email)

**Request**:
```http
POST /api/forgot-password HTTP/1.1
Content-Type: application/json

{
  "email": "registered@example.com"
}
```

**Response**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "If an account exists with this email, a reset link has been sent."
}
```

**Backend Action**: Email with reset link sent to user

### Security Path (Unregistered Email)

**Request**:
```http
POST /api/forgot-password HTTP/1.1
Content-Type: application/json

{
  "email": "notregistered@example.com"
}
```

**Response**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "If an account exists with this email, a reset link has been sent."
}
```

**Backend Action**: No email sent, but same response returned (security)

**Important**: Response time must be similar to registered email case (within 100ms) to prevent timing attacks.

### Error Path (Invalid Email)

**Request**:
```http
POST /api/forgot-password HTTP/1.1
Content-Type: application/json

{
  "email": "not-an-email"
}
```

**Response**:
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "message": "Invalid email format"
}
```

**Note**: This should rarely happen due to client-side validation.

### Error Path (Rate Limited)

**Request**:
```http
POST /api/forgot-password HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response**:
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 300

{
  "success": false,
  "message": "Too many requests. Please try again in 5 minutes."
}
```

## Frontend Implementation

### Repository Method Signature

```typescript
interface IForgotPasswordRepository {
  requestPasswordReset(input: ForgotPasswordInput): Promise<ForgotPasswordResponse>;
}
```

### API Call Implementation

```typescript
class ApiForgotPasswordRepository implements IForgotPasswordRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  async requestPasswordReset(input: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${this.baseUrl}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new ForgotPasswordAPIError(
          response.status,
          data.message || 'Something went wrong. Please try again.',
          data
        );
      }

      // Validate response with Zod
      return ForgotPasswordResponseSchema.parse(data);
    } catch (error) {
      if (error instanceof ForgotPasswordAPIError) {
        throw error;
      }
      if (error.name === 'AbortError') {
        throw new ForgotPasswordAPIError(0, 'Request timed out. Please try again.');
      }
      // Network error
      throw new ForgotPasswordAPIError(0, 'Unable to connect. Please check your internet connection.');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
```

## Testing

### Mock Responses (MSW)

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Success case
  http.post('/api/forgot-password', () => {
    return HttpResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  }),

  // Error case (for testing)
  http.post('/api/forgot-password', () => {
    return HttpResponse.json(
      {
        success: false,
        message: 'Something went wrong. Please try again.',
      },
      { status: 500 }
    );
  }),

  // Rate limit case (for testing)
  http.post('/api/forgot-password', () => {
    return HttpResponse.json(
      {
        success: false,
        message: 'Too many requests. Please try again in a few minutes.',
      },
      { status: 429 }
    );
  }),
];
```

### Test Cases

1. **Success Response**: Verify 200 status and success message displayed
2. **400 Error**: Verify validation error message displayed
3. **500 Error**: Verify generic error message displayed
4. **429 Rate Limit**: Verify rate limit message and retry disabled
5. **Network Error**: Verify connection error message displayed
6. **Timeout**: Verify timeout error message displayed
7. **Response Validation**: Verify Zod schema catches invalid responses

## Security Considerations

1. **Email Enumeration Prevention**:
   - Same message for registered and unregistered emails
   - Similar response time (no timing attacks)
   - No different error messages based on email existence

2. **Rate Limiting** (Backend Responsibility):
   - Limit requests per IP address
   - Limit requests per email address
   - Return 429 status when exceeded

3. **HTTPS Only**:
   - All requests over TLS
   - No plaintext transmission

4. **Input Validation** (Both Sides):
   - Client validates before sending
   - Server validates all inputs
   - Never trust client-side validation alone

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-10 | 1.0.0 | Initial API contract |

## References

- Feature Spec: `/specs/002-feat-forgot-password/spec.md`
- Data Model: `/specs/002-feat-forgot-password/data-model.md`
- Research: `/specs/002-forgot-password/research.md`
