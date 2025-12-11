# API Contract: Password Reset

**Feature**: Password Reset  
**Version**: 1.0.0  
**Date**: 2025-10-11  
**Protocol**: REST API over HTTPS

## Overview

This document defines the API contract for the password reset endpoint. The backend API is external to this frontend application.

## Base URL

```
Production: https://api.example.com (TBD - configure via environment variable)
Development: http://localhost:3001 (or external API endpoint)
```

**Environment Variable**: `NEXT_PUBLIC_API_BASE_URL`

---

## Endpoint: Reset Password

### Request

**Method**: `POST`  
**Path**: `/api/auth/reset-password`  
**Content-Type**: `application/json`

**Headers**:
```http
Content-Type: application/json
Accept: application/json
```

**Request Body**:
```typescript
{
  token: string;      // Password reset token from email link (query param)
  newPassword: string; // New password (minimum 4 characters)
}
```

**Request Example**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newSecurePassword123"
}
```

**Validation Rules**:
- `token`: Required, non-empty string
- `newPassword`: Required, minimum 4 characters, maximum 128 characters

---

### Response

#### Success Response (200 OK)

**Status Code**: `200`  
**Content-Type**: `application/json`

**Response Body**:
```typescript
{
  success: true;
  message: string; // User-friendly success message
}
```

**Success Example**:
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Frontend Action**:
- Display success message to user
- Wait 2 seconds
- Redirect to `/login` page

---

#### Error Responses

##### 1. Token Expired (401 Unauthorized)

**Status Code**: `401`  
**Content-Type**: `application/json`

**Response Body**:
```json
{
  "success": false,
  "message": "Reset token has expired"
}
```

**Frontend Action**:
- Display error message: "This reset link has expired. Please request a new one."
- Show button: "Request New Reset Link" → redirect to `/forgot-password`

---

##### 2. Token Invalid (401 Unauthorized)

**Status Code**: `401`  
**Content-Type**: `application/json`

**Response Body**:
```json
{
  "success": false,
  "message": "Invalid reset token"
}
```

**Frontend Action**:
- Display error message: "This reset link is invalid. Please request a new password reset."
- Show button: "Request New Reset Link" → redirect to `/forgot-password`

---

##### 3. Validation Error (400 Bad Request)

**Status Code**: `400`  
**Content-Type**: `application/json`

**Response Body**:
```json
{
  "success": false,
  "message": "Password must be at least 4 characters"
}
```

**Frontend Action**:
- Display validation error message inline on form
- Allow user to correct and resubmit

**Common Validation Errors**:
- "Password must be at least 4 characters"
- "Password must not exceed 128 characters"
- "Token is required"

---

##### 4. Token Already Used (409 Conflict)

**Status Code**: `409`  
**Content-Type**: `application/json`

**Response Body**:
```json
{
  "success": false,
  "message": "Reset token has already been used"
}
```

**Frontend Action**:
- Display error message: "This reset link has already been used. Please request a new one if you need to reset your password again."
- Show button: "Request New Reset Link" → redirect to `/forgot-password`

---

##### 5. Server Error (500 Internal Server Error)

**Status Code**: `500`  
**Content-Type**: `application/json`

**Response Body**:
```json
{
  "success": false,
  "message": "An error occurred while processing your request"
}
```

**Frontend Action**:
- Display generic error message: "Something went wrong. Please try again later."
- Log error details for debugging
- Optionally show retry button

---

##### 6. Network Error (No Response)

**Status Code**: N/A (network failure)

**Frontend Action**:
- Display error message: "Unable to connect. Please check your internet connection and try again."
- Show retry button
- Implement automatic retry with exponential backoff (React Query handles this)

---

## Request/Response Flow

```
┌─────────────┐                    ┌─────────────┐
│   Frontend  │                    │   Backend   │
│  (Next.js)  │                    │  (External  │
│             │                    │     API)    │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  POST /api/auth/reset-password  │
       │  { token, newPassword }         │
       │─────────────────────────────────>│
       │                                  │
       │                                  │ Validate token
       │                                  │ Check expiration
       │                                  │ Hash password
       │                                  │ Update database
       │                                  │
       │  200 OK                          │
       │  { success: true, message }     │
       │<─────────────────────────────────│
       │                                  │
       │  Display success message         │
       │  Redirect to /login              │
       │                                  │
```

---

## Security Considerations

### Token Security
- **One-time use**: Token MUST be invalidated after successful password reset
- **Expiration**: Token SHOULD expire after 15-60 minutes
- **HTTPS only**: All requests MUST use HTTPS in production
- **No token logging**: Token MUST NOT be logged by backend or frontend

### Password Security
- **Server-side validation**: Backend MUST validate password strength (don't trust client)
- **Hashing**: Backend MUST hash password before storing (bcrypt, argon2, etc.)
- **No plaintext**: Password MUST NEVER be logged or stored in plaintext
- **Rate limiting**: Backend SHOULD implement rate limiting to prevent brute force

### Request Security
- **CORS**: Backend MUST configure CORS to allow frontend origin
- **Content-Type validation**: Backend MUST validate Content-Type header
- **Request size limit**: Backend SHOULD limit request body size (< 1KB)

---

## Error Handling Matrix

| HTTP Status | Error Code       | User Message                                    | User Action                  |
|-------------|------------------|-------------------------------------------------|------------------------------|
| 200         | N/A              | "Password reset successful"                     | Auto-redirect to login       |
| 400         | VALIDATION_ERROR | "Password must be at least 4 characters"        | Correct input and resubmit   |
| 401         | TOKEN_EXPIRED    | "This reset link has expired"                   | Request new reset link       |
| 401         | TOKEN_INVALID    | "This reset link is invalid"                    | Request new reset link       |
| 409         | TOKEN_USED       | "This reset link has already been used"         | Request new reset link       |
| 500         | SERVER_ERROR     | "Something went wrong. Please try again later." | Retry or contact support     |
| N/A         | NETWORK_ERROR    | "Unable to connect. Check your connection."     | Retry when online            |

---

## Frontend Implementation Notes

### Repository Interface

```typescript
interface IResetPasswordRepository {
  resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse>;
}
```

### API Repository Implementation

```typescript
class ApiResetPasswordRepository implements IResetPasswordRepository {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL!) {
    this.baseUrl = baseUrl;
  }

  async resetPassword(
    request: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ResetPasswordError(
        this.mapStatusToErrorCode(response.status),
        errorData.message,
        response.status
      );
    }

    const data = await response.json();
    return ResetPasswordResponseSchema.parse(data); // Validate response
  }

  private mapStatusToErrorCode(status: number): ResetPasswordErrorCode {
    switch (status) {
      case 400: return ResetPasswordErrorCode.VALIDATION_ERROR;
      case 401: return ResetPasswordErrorCode.TOKEN_INVALID;
      case 409: return ResetPasswordErrorCode.TOKEN_USED;
      case 500: return ResetPasswordErrorCode.SERVER_ERROR;
      default: return ResetPasswordErrorCode.SERVER_ERROR;
    }
  }
}
```

### React Query Integration

```typescript
const resetPasswordMutation = useMutation({
  mutationFn: (data: ResetPasswordRequest) => 
    repository.resetPassword(data),
  retry: (failureCount, error) => {
    // Retry on network errors only, not auth/validation errors
    if (error instanceof ResetPasswordError) {
      return error.code === ResetPasswordErrorCode.NETWORK_ERROR && failureCount < 3;
    }
    return false;
  },
  onSuccess: (response) => {
    setSuccessMessage(response.message);
    setTimeout(() => router.push('/login'), 2000);
  },
  onError: (error: ResetPasswordError) => {
    setErrorMessage(mapApiErrorToUserMessage(error));
  }
});
```

---

## Testing

### Mock Responses for MSW (Mock Service Worker)

```typescript
// Success
rest.post('/api/auth/reset-password', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      success: true,
      message: "Password reset successful"
    })
  );
});

// Token expired
rest.post('/api/auth/reset-password', (req, res, ctx) => {
  return res(
    ctx.status(401),
    ctx.json({
      success: false,
      message: "Reset token has expired"
    })
  );
});

// Validation error
rest.post('/api/auth/reset-password', (req, res, ctx) => {
  return res(
    ctx.status(400),
    ctx.json({
      success: false,
      message: "Password must be at least 4 characters"
    })
  );
});
```

---

## OpenAPI Specification (Optional)

```yaml
openapi: 3.0.0
info:
  title: Password Reset API
  version: 1.0.0
  description: API for resetting user passwords via token

paths:
  /api/auth/reset-password:
    post:
      summary: Reset user password
      description: Resets a user's password using a valid reset token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - token
                - newPassword
              properties:
                token:
                  type: string
                  description: Password reset token from email
                newPassword:
                  type: string
                  minLength: 4
                  maxLength: 128
                  description: New password
      responses:
        '200':
          description: Password reset successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: "Password reset successful"
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Invalid or expired token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '409':
          description: Token already used
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: Server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  schemas:
    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        message:
          type: string
          example: "Reset token has expired"
```

---

## Change Log

| Version | Date       | Changes                          |
|---------|------------|----------------------------------|
| 1.0.0   | 2025-10-11 | Initial API contract definition  |

---

## Summary

This API contract defines a simple, RESTful password reset endpoint with comprehensive error handling. The frontend consumes this API through a Repository pattern implementation, ensuring Clean Architecture principles and testability.
