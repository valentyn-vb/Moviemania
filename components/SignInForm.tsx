"use client";

import Link from "next/link";
import { useActionState } from "react";
import { logIn } from "@/lib/auth/loginAction";
import type { AuthFormState } from "@/lib/auth/schema";

const initialState: AuthFormState = {};

const inputClass =
  "w-full rounded-md bg-page px-4 py-3 text-light outline-none ring-1 ring-transparent focus:ring-accent";
const labelClass = "flex flex-col gap-1.5 text-s text-light";
const buttonClass =
  "w-full rounded-md bg-accent py-3 text-page transition-opacity hover:opacity-90 disabled:opacity-50";

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(logIn, initialState);

  return (
    <form
      action={formAction}
      className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-5 rounded-lg bg-secondary p-8"
    >
      <div>
        <h1 className="font-heading text-l text-accent">Sign in</h1>
        <p className="mt-1 text-s text-muted">
          Enter your email and password to sign in.
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
      </label>

      <label className={labelClass}>
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>

      <button type="submit" disabled={isPending} className={buttonClass}>
        {isPending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-s text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-accent">
          Sign up
        </Link>
      </p>
    </form>
  );
}
