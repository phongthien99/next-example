/**
 * Public API for Signup Feature
 *
 * Barrel export file that exposes the public interface
 * of the signup feature for use by other features.
 */

// Domain Models
export type { User } from './models/User';
export type { SignupSession } from './models/SignupSession';

// DTOs
export type { SignupInput, SignupOutput } from './dto/SignupTypes';
export { SignupInputSchema, SignupOutputSchema } from './dto/SignupTypes';

// Errors
export {
  SignupValidationError,
  DuplicateEmailError,
  SignupAPIError,
} from './dto/SignupTypes';

// Repository Interface
export type { ISignupRepository } from './repositories/ISignupRepository';

// Hooks (if needed by other features)
export { useSignup } from './hooks/UseSignup';
