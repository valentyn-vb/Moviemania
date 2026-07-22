"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerUser } from "@/lib/auth/registerAction";
import type { AuthFormState } from "@/lib/auth/schema";

const initialState: AuthFormState = {};

const inputClass =
  "w-full rounded-md bg-page px-4 py-3 text-light outline-none ring-1 ring-transparent focus:ring-accent";
const labelClass = "flex flex-col gap-1.5 text-s text-light";
const buttonClass =
  "w-full rounded-md bg-accent py-3 text-page transition-opacity hover:opacity-90 disabled:opacity-50";
const fieldErrorClass = "text-s text-red-400";

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-5 rounded-lg bg-secondary p-8"
    >
      <div>
        <h1 className="font-heading text-l text-accent">Create account</h1>
        <p className="mt-1 text-s text-muted">
          Enter your email and password to register.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-page px-4 py-2 text-s text-red-400">
          {state.error}
        </p>
      )}

      <label className={labelClass}>
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
        {fieldErrors.email?.[0] && <span className={fieldErrorClass}>{fieldErrors.email[0]}</span>}
      </label>

      <label className={labelClass}>
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
        {fieldErrors.password?.[0] && (
          <span className={fieldErrorClass}>{fieldErrors.password[0]}</span>
        )}
      </label>

      <label className={labelClass}>
        Repeat password
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
        {fieldErrors.confirmPassword?.[0] && (
          <span className={fieldErrorClass}>{fieldErrors.confirmPassword[0]}</span>
        )}
      </label>

      <button type="submit" disabled={isPending} className={buttonClass}>
        {isPending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-s text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-accent">
          Sign in
        </Link>
      </p>
    </form>
  );
}
