import { Metadata } from "next";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";
import { ForgotPasswordRepositoryProvider } from "./providers/ForgotPasswordRepositoryProvider";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your password by entering your email address",
};

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordRepositoryProvider type="api">
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </ForgotPasswordRepositoryProvider>
  );
}
