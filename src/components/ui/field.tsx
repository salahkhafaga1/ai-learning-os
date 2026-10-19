import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "./cn";

const controlBase =
  "w-full rounded-lg border border-edge bg-surface-2 px-3 text-sm text-ink placeholder:text-muted transition-colors focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

export function Label({
  className,
  children,
  ...rest
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1 block text-xs font-medium text-ink-2", className)}
      {...rest}
    >
      {children}
    </label>
  );
}

export function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, "h-10", className)} {...rest} />;
}

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(controlBase, "min-h-24 py-2", className)} {...rest} />
  );
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlBase, "h-10 pe-8", className)} {...rest}>
      {children}
    </select>
  );
}

export function HelpText({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p className={cn("mt-1 text-xs text-muted", className)}>{children}</p>
  );
}
