/**
 * Forgot Password Feature - Public API
 *
 * This module provides a complete forgot password feature following Clean Architecture principles.
 *
 * ## Architecture Layers:
 * - **Presentation Layer**: React components (ForgotPasswordForm, ErrorBoundary)
 * - **Application Layer**: Business logic hooks (useForgotPassword)
 * - **Domain Layer**: Pure validation logic and models
 * - **Infrastructure Layer**: Repository implementations (API, LocalStorage)
 *
 * ## Quick Start:
 * ```tsx
 * import {
 *   ForgotPasswordForm,
 *   ForgotPasswordRepositoryProvider
 * } from '@/app/forgot-password';
 *
 * export default function ForgotPasswordPage() {
 *   return (
 *     <ForgotPasswordRepositoryProvider type="api">
 *       <ForgotPasswordForm />
 *     </ForgotPasswordRepositoryProvider>
 *   );
 * }
 * ```
 *
 * ## Custom Integration:
 * ```tsx
 * import { useForgotPassword } from '@/app/forgot-password';
 *
 * function MyCustomForm() {
 *   const { session, requestReset, updateEmail, validateEmail, reset } = useForgotPassword();
 *   // Build your custom UI using these primitives
 * }
 * ```
 */

// Components
export { ForgotPasswordForm } from "./components/ForgotPasswordForm";
export { ForgotPasswordErrorBoundary } from "./components/ForgotPasswordErrorBoundary";

// Hooks
export { useForgotPassword } from "./hooks/UseForgotPassword";

// Providers
export {
  ForgotPasswordRepositoryProvider,
  useForgotPasswordRepository,
} from "./providers/ForgotPasswordRepositoryProvider";

// DTOs and Types
export type {
  ForgotPasswordInput,
  ForgotPasswordResponse,
} from "./dto/ForgotPasswordTypes";

export {
  ForgotPasswordInputSchema,
  ForgotPasswordResponseSchema,
  ForgotPasswordValidationError,
  ForgotPasswordAPIError,
} from "./dto/ForgotPasswordTypes";

// Models
export type { ForgotPasswordSession } from "./models/ForgotPasswordSession";
export { initialForgotPasswordSession } from "./models/ForgotPasswordSession";

// Core Logic
export { validate } from "./core/ForgotPasswordLogic";

// Repositories
export type { IForgotPasswordRepository } from "./repositories/IForgotPasswordRepository";
export { ApiForgotPasswordRepository } from "./repositories/ApiForgotPasswordRepository";
export { LocalStorageForgotPasswordRepository } from "./repositories/LocalStorageForgotPasswordRepository";
export { ForgotPasswordRepositoryRegistry } from "./repositories/ForgotPasswordRepositoryRegistry";
