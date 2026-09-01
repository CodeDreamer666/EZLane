"use client";

import { Button, LoadingIcon } from "~/components/shared";

export default function GateScreen({
  value,
  onChange,
  onSubmit,
  error,
  pending,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error: string;
  pending: boolean;
}) {
  return (
    <div className="grid min-h-screen place-items-center p-[30px]">
      <div className="bg-bg border-divider w-[min(392px,_100%)] rounded-[6px] border p-[30px] shadow-[var(--elev-lg)]">
        <div className="flex items-center gap-[9px]">
          <div className="border-accent grid h-[18px] w-[18px] place-items-center rounded-[3px] border">
            <div className="bg-accent h-[6px] w-[6px]" />
          </div>
          <span className="font-heading text-[16px] font-semibold">EZLane</span>
        </div>
        <h3 className="font-heading m-[20px_0_6px] text-[23px] leading-[1.12] font-semibold tracking-[-0.015em]">
          Your project workspace
        </h3>
        <p className="text-text/58 m-[0_0_18px] text-[13px] leading-[1.6]">
          This workspace is password-protected. Use the password from your
          freelancer — there is no account to create.
        </p>
        <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
          <label>Password</label>
          <input
            className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
            type="password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
          />
        </div>
        {error ? (
          <div className="text-accent-700 mt-[8px] text-[12px]">{error}</div>
        ) : null}
        <Button
          variant="primary"
          block
          className="mt-[16px]"
          disabled={pending}
          onClick={onSubmit}
        >
          {pending ? (
            <div className="flex items-center gap-2">
              <LoadingIcon />
              Opening...
            </div>
          ) : (
            "Open the workspace"
          )}
        </Button>
        <div className="text-text/38 mt-[16px] text-[11.5px] leading-[1.6]">
          Password protected. Nothing you do here creates an account.
        </div>
      </div>
    </div>
  );
}
