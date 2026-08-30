"use client";
import { useEffect, useState } from "react";
import {
    Button,
    Field,
    Input,
    Tag,
    Textarea,
    Toggle,
    LoadingIcon,
    LoadingScreen,
    ServerError
} from "~/components/shared";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";
import Link from "next/link";
import z from "zod";

export default function BrandingSection() {
    const { showMessage } = useStatusMessage();
    const utils = api.useUtils();

    const { data: brandingData, isLoading, error } = api.settings.getBranding.useQuery();

    const isProPlan = brandingData?.plan === "PRO";

    const [form, setForm] = useState({
        accentColour: "",
        logo: "",
        welcomeMessage: "",
        hideBranding: false,
    });

    useEffect(() => {
        if (brandingData) {
            setForm({
                accentColour: brandingData.accentColour,
                logo: brandingData.logo,
                welcomeMessage: brandingData.welcomeMessage,
                hideBranding: brandingData.hideBranding,
            });
        }
    }, [brandingData]);

    const mutation = api.settings.updateBranding.useMutation({
        onSuccess: () => {
            showMessage("Branding saved", true);
        },

        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.invalidate();
        }
    });

    const brandingZodSchema = z.object({
        accentColour: z
            .string()
            .trim()
            .regex(
                /^#[0-9A-Fa-f]{6}$/,
                "Accent colour must be a hex value like #4F46E5",
            ),
        logo: z
            .string()
            .trim()
            .min(1, "Logo is required")
            .max(255, "Logo must be at most 255 characters")
            .optional()
            .or(z.literal("")),
        welcomeMessage: z
            .string()
            .trim()
            .min(1, "Welcome message is required")
            .max(255, "Welcome message must be at most 255 characters"),
        hideBranding: z.boolean(),
    })

    const handleSave = () => {
        const result = brandingZodSchema.safeParse(form);

        if (!result.success) {
            showMessage(result.error.issues[0]?.message ?? "", false);
            return;
        }

        mutation.mutate(result.data);
    };

    const opacity = isProPlan ? 1 : 0.45;

    if (isLoading) return <LoadingScreen />

    if (error || !brandingData) return <ServerError />

    return (
        <div className="flex flex-col gap-[16px]">

            <div className="flex items-start gap-[12px]">
                <div className="flex-1">
                    <h4 className="font-heading m-[0_0_3px] text-[20px] leading-[1.12] font-semibold tracking-[-0.015em]">
                        Portal branding
                    </h4>
                    <div className="text-text/55 text-[12.5px]">
                        How the client&apos;s portal looks and who it appears to come from.
                    </div>
                </div>

                {!isProPlan ? <Tag status="sent">Pro</Tag> : null}
            </div>

            {!isProPlan ? (
                <div className="bg-accent/8 border-accent-400 flex flex-col items-start gap-3 rounded-[5px] border p-4">
                    <div className="max-w-[560px] text-[12.5px] leading-[1.55]">
                        <span className="font-medium">Branding is a Pro feature.</span>{" "}
                        On Free, the portal carries a small &ldquo;Powered by EZLane&rdquo; line
                        and your accent colour stays default.
                    </div>

                    <div className="w-full flex items-center justify-end">
                        <Link href="/plans">
                            <Button variant="primary">Upgrade to Pro</Button>
                        </Link>
                    </div>
                </div>
            ) : null}

            <Field label="Accent colour">
                <div className="flex items-center gap-[9px]">
                    <Input
                        className="w-[120px]! font-mono disabled:cursor-not-allowed"
                        value={form.accentColour}
                        onChange={(e) => setForm({
                            ...form,
                            accentColour: e.target.value
                        })}
                        disabled={!isProPlan}
                        maxLength={7}
                    />
                    <svg
                        className="border-divider h-8 w-8 rounded border"
                        aria-label="Accent colour preview"
                    >
                        <rect
                            width="100%"
                            height="100%"
                            fill={
                                /^#[0-9A-Fa-f]{6}$/.test(form.accentColour)
                                    ? form.accentColour
                                    : "#5b93ff"
                            }
                        />
                    </svg>
                </div>

                <Field label="Logo" className="mt-4">
                    <input
                        type="file"
                        disabled={!isProPlan}
                        className={`text-text font-inherit w-full max-w-md text-sm leading-[1.55] file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-divider file:bg-transparent file:px-3 file:py-2 file:font-heading file:text-sm file:font-semibold file:leading-[1.2] file:text-text hover:file:bg-text/7 disabled:cursor-not-allowed ${opacity === 1 ? "opacity-100" : "opacity-45"}`}
                        onChange={(e) => {
                            setForm({
                                ...form,
                                logo: e.target.value
                            })
                        }}
                    />

                    <div className="text-text/45 mt-[6px] text-[11.5px]">
                        {form.logo || "No logo uploaded — the portal shows your name instead."}
                    </div>
                </Field>

                <Field label="Welcome message" className="mt-6">
                    <Textarea
                        className="min-h-[74px]! disabled:cursor-not-allowed"
                        rows={2}
                        value={form.welcomeMessage}
                        onChange={(e) => setForm({
                            ...form,
                            welcomeMessage: e.target.value
                        })}
                        disabled={!isProPlan}
                        maxLength={255}
                    />

                    <div className="mt-[4px] flex justify-end">
                        <span
                            className={`text-[11px] ${form.welcomeMessage.length > 255 ? "text-red-500" : "text-text/45"}`}
                        >
                            {form.welcomeMessage.length} / 255
                        </span>
                    </div>
                </Field>

                <Field label="Portal footer">
                    <Toggle
                        on={form.hideBranding}
                        onClick={() => isProPlan && setForm({
                            ...form,
                            hideBranding: !form.hideBranding
                        })}
                        disabled={!isProPlan}
                        className="self-start disabled:cursor-not-allowed"
                    >
                        Remove &ldquo;Powered by EZLane&rdquo; from the portal
                    </Toggle>
                </Field>

                <Button
                    variant="primary"
                    className="mt-4 self-start disabled:cursor-not-allowed"
                    disabled={mutation.isPending}
                    onClick={handleSave}
                >
                    {mutation.isPending ? (
                        <div className="flex items-center gap-2">
                            <LoadingIcon />
                            Saving...
                        </div>
                    ) : "Save changes"}
                </Button>
            </Field>
        </div>
    );
}
