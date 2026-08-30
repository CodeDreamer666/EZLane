import Link from "next/link";

import cn from "~/lib/cn";

import Button from "./Button";

interface ServerErrorProps {
  title?: string;
  message?: string;
  className?: string;
}

export default function ServerError({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  className,
}: ServerErrorProps) {
  return (
    <div className="bg-bg fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        role="alert"
        className={cn(
          "border-divider bg-surface flex w-full max-w-[440px] flex-col gap-5 rounded-lg border p-6 shadow-md",
          className,
        )}
      >
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-text text-2xl font-semibold tracking-[-0.015em]">
            {title}
          </h1>
          <p className="text-text/55 text-sm leading-[1.55]">{message}</p>
        </div>

        <div className="flex justify-end">
          <Link href="/">
            <Button variant="primary">Go back to home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
