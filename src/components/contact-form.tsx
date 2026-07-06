"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { sendMessage } from "@/app/actions/send-message";
import { cn } from "@/lib/utils";

const inputClasses =
  "w-full rounded-button border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted focus:border-accent focus:outline-none";

export function ContactForm() {
  const [status, setStatus] = useState<
    { type: "idle" } | { type: "sent" } | { type: "error"; message: string }
  >({ type: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    setStatus({ type: "idle" });
    const result = await sendMessage(data);
    if (result.ok) {
      reset();
      setStatus({ type: "sent" });
    } else {
      setStatus({ type: "error", message: result.error });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!errors.name}
            className={cn(inputClasses, errors.name && "border-red-500")}
            {...register("name")}
          />
          {errors.name && (
            <p role="alert" className="mt-1.5 text-xs text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            className={cn(inputClasses, errors.email && "border-red-500")}
            {...register("email")}
          />
          {errors.email && (
            <p role="alert" className="mt-1.5 text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Tell me a little about your project…"
          aria-invalid={!!errors.message}
          className={cn(
            inputClasses,
            "resize-y",
            errors.message && "border-red-500",
          )}
          {...register("message")}
        />
        {errors.message && (
          <p role="alert" className="mt-1.5 text-xs text-red-500">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Honeypot — visually hidden, real users never fill this */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("company")}
        />
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex shrink-0 items-center gap-2 rounded-button bg-accent-strong px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting && (
            <LoaderCircle
              className="size-4 animate-spin"
              aria-hidden="true"
            />
          )}
          {isSubmitting ? "Sending…" : "Send message"}
        </button>
        <div aria-live="polite" className="min-w-0">
          {status.type === "sent" && (
            <p className="text-sm text-emerald-500">
              Thanks — your message is on its way. I&rsquo;ll reply soon.
            </p>
          )}
          {status.type === "error" && (
            <p className="text-sm text-red-500">{status.message}</p>
          )}
        </div>
      </div>
    </form>
  );
}
