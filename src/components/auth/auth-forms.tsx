"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  emailSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validation/auth";
import { messages } from "@/messages/en";
import { useToast } from "@/providers/toast-provider";

function fieldErrors(errors: readonly unknown[]): string[] {
  return errors.flatMap((error) => {
    if (typeof error === "string") return [error];
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) return [error.message];
    return [];
  });
}

function errorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
}

function errorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) return undefined;
  return typeof error.status === "number" ? error.status : undefined;
}

function authErrorMessage(error: unknown, fallback: string): string {
  if (errorStatus(error) === 429) return messages.auth.tooManyAttempts;
  if (error instanceof TypeError || errorStatus(error) === 0) return messages.auth.signInNetworkError;
  if (errorCode(error) === "INVALID_EMAIL_OR_PASSWORD") return messages.auth.invalidCredentials;
  if (errorCode(error) === "USER_ALREADY_EXISTS") return messages.auth.accountExists;
  return fallback;
}

function focusFirstInvalid() {
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>(".auth-form [aria-invalid='true']")?.focus();
  });
}

function submitForm(event: FormEvent<HTMLFormElement>, handleSubmit: () => Promise<void>) {
  event.preventDefault();
  event.stopPropagation();
  void handleSubmit();
}

function AuthFrame({ children }: { children: ReactNode }) {
  return <Card className="auth-card">{children}</Card>;
}

function PasswordToggle({
  visible,
  onToggle,
  label,
}: {
  visible: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      className="auth-password-toggle"
      type="button"
      aria-pressed={visible}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const form = useForm({
    defaultValues: { email: "" },
    validators: { onBlur: emailSchema, onSubmit: emailSchema },
    onSubmitInvalid: focusFirstInvalid,
    onSubmit: async ({ value }) => {
      setNotice("");
      setErrorMessage("");
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const redirectTo = new URL("/reset-password", siteUrl).toString();

      try {
        const result = await authClient.requestPasswordReset({
          email: value.email,
          redirectTo,
        });
        if (result.error?.status === 429) {
          setErrorMessage(messages.auth.rateLimited);
        } else {
          setNotice(messages.auth.resetRequestSent);
        }
      } catch (error) {
        if (errorStatus(error) === 429) {
          setErrorMessage(messages.auth.rateLimited);
        } else if (error instanceof TypeError || errorStatus(error) === 0) {
          setErrorMessage(messages.auth.networkError);
        } else {
          setNotice(messages.auth.resetRequestSent);
        }
      }
    },
  });

  return (
    <AuthFrame>
      <header className="auth-heading">
        <p className="auth-eyebrow">{messages.auth.eyebrow}</p>
        <h1>{messages.auth.forgotTitle}</h1>
        <p>{messages.auth.forgotDescription}</p>
      </header>
      <form className="auth-form" noValidate onSubmit={(event) => submitForm(event, form.handleSubmit)}>
        <form.Field name="email">
          {(field) => {
            const errors = fieldErrors(field.state.meta.errors);
            return (
              <div className="auth-field">
                <Label htmlFor="forgot-email">{messages.auth.emailLabel}</Label>
                <Input
                  className="auth-input"
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  value={field.state.value}
                  aria-invalid={errors.length > 0}
                  aria-describedby={errors.length > 0 ? "forgot-email-error" : undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                />
                {errors.length > 0 && (
                  <span className="auth-field-error" id="forgot-email-error">{errors.join(" ")}</span>
                )}
              </div>
            );
          }}
        </form.Field>
        {notice && <p className="auth-notice" role="status">{notice}</p>}
        {errorMessage && <p className="auth-notice auth-notice-error" role="alert">{errorMessage}</p>}
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button className="button button-primary auth-submit" variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? messages.auth.sendingResetLink : messages.auth.sendResetLink}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <Link className="auth-text-link auth-back-link" href="/login">{messages.auth.backToLogin}</Link>
    </AuthFrame>
  );
}

export function ResetPasswordForm({
  token,
  hasError,
}: {
  token: string;
  hasError: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [complete, setComplete] = useState(false);
  const [invalidToken, setInvalidToken] = useState(hasError || !token);
  const [errorMessage, setErrorMessage] = useState("");
  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    validators: { onBlur: resetPasswordSchema, onSubmit: resetPasswordSchema },
    onSubmitInvalid: focusFirstInvalid,
    onSubmit: async ({ value }) => {
      setErrorMessage("");
      try {
        const result = await authClient.resetPassword({ newPassword: value.password, token });
        if (result.error) {
          if (result.error.status === 429) {
            setErrorMessage(messages.auth.rateLimited);
          } else {
            setInvalidToken(true);
          }
          return;
        }
        setComplete(true);
      } catch (error) {
        if (errorStatus(error) === 429) {
          setErrorMessage(messages.auth.rateLimited);
        } else {
          setErrorMessage(
            error instanceof TypeError || errorStatus(error) === 0
              ? messages.auth.networkError
              : messages.auth.resetFailed,
          );
        }
      }
    },
  });

  if (invalidToken) {
    return (
      <AuthFrame>
        <header className="auth-heading">
          <p className="auth-eyebrow">{messages.auth.eyebrow}</p>
          <h1>{messages.auth.invalidLinkTitle}</h1>
          <p role="alert">{messages.auth.invalidLinkDescription}</p>
        </header>
        <Link className="button button-primary auth-submit" href="/forgot-password">
          {messages.auth.requestAnotherLink}
        </Link>
      </AuthFrame>
    );
  }

  if (complete) {
    return (
      <AuthFrame>
        <header className="auth-heading">
          <p className="auth-eyebrow">{messages.auth.eyebrow}</p>
          <h1>{messages.auth.resetSuccessTitle}</h1>
          <p role="status">{messages.auth.resetSuccessDescription}</p>
        </header>
        <Link className="button button-primary auth-submit" href="/login">{messages.auth.logIn}</Link>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame>
      <header className="auth-heading">
        <p className="auth-eyebrow">{messages.auth.eyebrow}</p>
        <h1>{messages.auth.resetTitle}</h1>
        <p>{messages.auth.resetDescription}</p>
      </header>
      <form className="auth-form" noValidate onSubmit={(event) => submitForm(event, form.handleSubmit)}>
        <form.Field name="password">
          {(field) => {
            const errors = fieldErrors(field.state.meta.errors);
            return (
              <div className="auth-field">
                <Label htmlFor="reset-password">{messages.auth.newPasswordLabel}</Label>
                <div className="auth-password-control">
                  <Input
                    className="auth-input"
                    id="reset-password"
                    type={visible ? "text" : "password"}
                    autoComplete="new-password"
                    value={field.state.value}
                    aria-invalid={errors.length > 0}
                    aria-describedby={errors.length > 0 ? "reset-password-error" : undefined}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  />
                  <PasswordToggle
                    visible={visible}
                    onToggle={() => setVisible((current) => !current)}
                    label={visible ? messages.auth.hidePassword : messages.auth.showPassword}
                  />
                </div>
                {errors.length > 0 && (
                  <span className="auth-field-error" id="reset-password-error">{errors.join(" ")}</span>
                )}
              </div>
            );
          }}
        </form.Field>
        <form.Field name="confirmPassword">
          {(field) => {
            const errors = fieldErrors(field.state.meta.errors);
            return (
              <div className="auth-field">
                <Label htmlFor="confirm-password">{messages.auth.confirmPasswordLabel}</Label>
                <Input
                  className="auth-input"
                  id="confirm-password"
                  type={visible ? "text" : "password"}
                  autoComplete="new-password"
                  value={field.state.value}
                  aria-invalid={errors.length > 0}
                  aria-describedby={errors.length > 0 ? "confirm-password-error" : undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                />
                {errors.length > 0 && (
                  <span className="auth-field-error" id="confirm-password-error">{errors.join(" ")}</span>
                )}
              </div>
            );
          }}
        </form.Field>
        {errorMessage && <p className="auth-notice auth-notice-error" role="alert">{errorMessage}</p>}
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button className="button button-primary auth-submit" variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? messages.auth.resettingPassword : messages.auth.resetPassword}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <Link className="auth-text-link auth-back-link" href="/forgot-password">
        {messages.auth.requestAnotherLink}
      </Link>
    </AuthFrame>
  );
}

export function LoginForm({ safeNext }: { safeNext: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [visible, setVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onBlur: loginSchema, onSubmit: loginSchema },
    onSubmitInvalid: focusFirstInvalid,
    onSubmit: async ({ value }) => {
      setErrorMessage("");
      try {
        const result = await authClient.signIn.email({ email: value.email, password: value.password });
        if (result.error) {
          setErrorMessage(authErrorMessage(result.error, messages.auth.genericError));
          return;
        }
        queryClient.clear();
        const welcomeName = result.data?.user?.name?.trim().split(/\s+/)[0];
        showToast(messages.auth.welcome(welcomeName || value.email.split("@")[0]));
        router.replace(safeNext);
        router.refresh();
      } catch (error) {
        setErrorMessage(authErrorMessage(error, messages.auth.genericError));
      }
    },
  });

  return (
    <AuthFrame>
      <header className="auth-heading">
        <p className="auth-eyebrow">{messages.auth.eyebrow}</p>
        <h1>{messages.auth.loginTitle}</h1>
        <p>{messages.auth.loginDescription}</p>
      </header>
      <form className="auth-form" noValidate onSubmit={(event) => submitForm(event, form.handleSubmit)}>
        <form.Field name="email">
          {(field) => {
            const errors = fieldErrors(field.state.meta.errors);
            return (
              <div className="auth-field">
                <Label htmlFor="login-email">{messages.auth.emailLabel}</Label>
                <Input
                  className="auth-input"
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  value={field.state.value}
                  aria-invalid={errors.length > 0}
                  aria-describedby={errors.length > 0 ? "login-email-error" : undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                />
                {errors.length > 0 && (
                  <span className="auth-field-error" id="login-email-error">{errors.join(" ")}</span>
                )}
              </div>
            );
          }}
        </form.Field>
        <form.Field name="password">
          {(field) => {
            const errors = fieldErrors(field.state.meta.errors);
            return (
              <div className="auth-field">
                <Label htmlFor="login-password">{messages.auth.passwordLabel}</Label>
                <div className="auth-password-control">
                  <Input
                    className="auth-input"
                    id="login-password"
                    type={visible ? "text" : "password"}
                    autoComplete="current-password"
                    value={field.state.value}
                    aria-invalid={errors.length > 0}
                    aria-describedby={errors.length > 0 ? "login-password-error" : undefined}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                  />
                  <PasswordToggle
                    visible={visible}
                    onToggle={() => setVisible((current) => !current)}
                    label={visible ? messages.auth.hidePassword : messages.auth.showPassword}
                  />
                </div>
                {errors.length > 0 && (
                  <span className="auth-field-error" id="login-password-error">{errors.join(" ")}</span>
                )}
              </div>
            );
          }}
        </form.Field>
        <Link className="auth-text-link auth-forgot-link" href="/forgot-password">
          {messages.auth.forgotLink}
        </Link>
        {errorMessage && <p className="auth-notice auth-notice-error" role="alert">{errorMessage}</p>}
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button className="button button-primary auth-submit" variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? messages.auth.loggingIn : messages.auth.logIn}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <Link className="auth-text-link auth-back-link" href={`/signup?next=${encodeURIComponent(safeNext)}`}>
        {messages.auth.newHere}
      </Link>
    </AuthFrame>
  );
}

export function SignupForm({ safeNext }: { safeNext: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    validators: { onBlur: signupSchema, onSubmit: signupSchema },
    onSubmitInvalid: focusFirstInvalid,
    onSubmit: async ({ value }) => {
      setErrorMessage("");
      try {
        const result = await authClient.signUp.email({
          name: value.name,
          email: value.email,
          password: value.password,
        });
        if (result.error) {
          setErrorMessage(authErrorMessage(result.error, messages.auth.signupFailed));
          return;
        }
        queryClient.clear();
        showToast(messages.auth.welcome(value.name.trim().split(/\s+/)[0]));
        router.replace(safeNext);
        router.refresh();
      } catch (error) {
        setErrorMessage(authErrorMessage(error, messages.auth.signupFailed));
      }
    },
  });

  return (
    <AuthFrame>
      <header className="auth-heading">
        <p className="auth-eyebrow">{messages.auth.eyebrow}</p>
        <h1>{messages.auth.createAccountTitle}</h1>
        <p>{messages.auth.createAccountDescription}</p>
      </header>
      <form className="auth-form" noValidate onSubmit={(event) => submitForm(event, form.handleSubmit)}>
        <form.Field name="name">
          {(field) => {
            const errors = fieldErrors(field.state.meta.errors);
            return (
              <div className="auth-field">
                <Label htmlFor="signup-name">{messages.auth.nameLabel}</Label>
                <Input
                  className="auth-input"
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={field.state.value}
                  aria-invalid={errors.length > 0}
                  aria-describedby={errors.length > 0 ? "signup-name-error" : undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                />
                {errors.length > 0 && (
                  <span className="auth-field-error" id="signup-name-error">{errors.join(" ")}</span>
                )}
              </div>
            );
          }}
        </form.Field>
        <form.Field name="email">
          {(field) => {
            const errors = fieldErrors(field.state.meta.errors);
            return (
              <div className="auth-field">
                <Label htmlFor="signup-email">{messages.auth.emailLabel}</Label>
                <Input
                  className="auth-input"
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  value={field.state.value}
                  aria-invalid={errors.length > 0}
                  aria-describedby={errors.length > 0 ? "signup-email-error" : undefined}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                />
                {errors.length > 0 && (
                  <span className="auth-field-error" id="signup-email-error">{errors.join(" ")}</span>
                )}
              </div>
            );
          }}
        </form.Field>
        <form.Field name="password">
          {(field) => {
            const errors = fieldErrors(field.state.meta.errors);
            return (
              <div className="auth-field">
                <Label htmlFor="signup-password">{messages.auth.passwordLabel}</Label>
                <Input
                  className="auth-input"
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  aria-describedby={errors.length > 0 ? "signup-password-error" : "signup-password-hint"}
                  aria-invalid={errors.length > 0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                />
                {errors.length > 0 ? (
                  <span className="auth-field-error" id="signup-password-error">{errors.join(" ")}</span>
                ) : (
                  <span className="auth-field-hint" id="signup-password-hint">{messages.auth.passwordHint}</span>
                )}
              </div>
            );
          }}
        </form.Field>
        {errorMessage && <p className="auth-notice auth-notice-error" role="alert">{errorMessage}</p>}
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button className="button button-primary auth-submit" variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? messages.auth.creatingAccount : messages.auth.createAccount}
            </Button>
          )}
        </form.Subscribe>
        <p className="auth-legal-note">
          {messages.auth.legalNotice}{" "}
          <Link href="/terms">{messages.auth.terms}</Link> {messages.auth.and}{" "}
          <Link href="/privacy">{messages.auth.privacy}</Link>
        </p>
      </form>
      <Link className="auth-text-link auth-back-link" href={`/login?next=${encodeURIComponent(safeNext)}`}>
        {messages.auth.alreadyAccount}
      </Link>
    </AuthFrame>
  );
}
