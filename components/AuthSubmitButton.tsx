"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

type AuthSubmitButtonProps = {
  children: ReactNode;
  pendingLabel: string;
  className: string;
};

export default function AuthSubmitButton({
  children,
  pendingLabel,
  className,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
