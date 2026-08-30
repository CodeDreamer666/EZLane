"use client";
import { useEffect, useState } from "react";
import { Button, Field, Input, LoadingScreen, LoadingIcon, ServerError } from "~/components/shared";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";
import z from "zod";

export default function InvoiceSection() {
    const { showMessage } = useStatusMessage();
    const { data, isLoading, error } = api.settings.getInvoice.useQuery();

    const [invoiceDetails, setInvoiceDetails] = useState({
        invoiceDisplayName: "",
        invoiceContact: "",
        invoicePrefix: "",
    });

    const utils = api.useUtils();

    useEffect(() => {
        if (data) {
            setInvoiceDetails({
                invoiceDisplayName: data.invoiceDisplayName ?? "",
                invoiceContact: data.invoiceContact ?? "",
                invoicePrefix: data.invoicePrefix ?? "",
            });
        }
    }, [data]);

    const mutation = api.settings.updateInvoice.useMutation({
        onSuccess: () => {
            showMessage("Settings saved", true);
        },

        onError: (err) => {
            const msg = getFriendlyError(err);
            showMessage(msg, false);
        },

        onSettled: async () => {
            await utils.invalidate();
        }
    });

    const invoiceDetailsZodSchema = z.object({
        invoiceDisplayName: z
            .string()
            .trim()
            .min(1, "Invoice display name is required")
            .max(120, "Invoice display name must be at most 120 characters"),
        invoiceContact: z
            .string()
            .trim()
            .min(1, "Contact info is required")
            .max(120, "Contact info must be at most 120 characters"),
        invoicePrefix: z
            .string()
            .trim()
            .min(1, "Invoice prefix is required")
            .max(20, "Invoice prefix must be at most 20 characters")
            .regex(
                /^[A-Z0-9-]+$/,
                "Invoice prefix must be uppercase letters, numbers and hyphens only (e.g. MD-2026-)",
            ),
    });

    const handleSave = () => {
        const result = invoiceDetailsZodSchema.safeParse(invoiceDetails);

        if (!result.success) {
            showMessage(result.error.issues[0]?.message ?? "", false);
            return;
        }

        mutation.mutate(result.data);
    };

    if (isLoading) return <LoadingScreen />

    if (error || !data) return <ServerError />

    return (
        <div className="flex flex-col gap-[16px]">
            <div>
                <h4 className="font-heading m-[0_0_3px] text-[20px] leading-[1.12] font-semibold tracking-[-0.015em]">
                    Invoice details
                </h4>
                <div className="text-text/55 text-[12.5px]">
                    Used on the generated contract and on the two 50% invoices you send
                    outside EZLane.
                </div>
            </div>

            <Field label="Invoice display name">
                <Input
                    value={invoiceDetails.invoiceDisplayName}
                    onChange={(e) =>
                        setInvoiceDetails({
                            ...invoiceDetails,
                            invoiceDisplayName: e.target.value,
                        })
                    }
                    maxLength={120}
                />

                <div className="mt-[4px] flex justify-end">
                    <span
                        className={`text-[11px] ${invoiceDetails.invoiceDisplayName.length > 120 ? "text-red-500" : "text-text/45"}`}
                    >
                        {invoiceDetails.invoiceDisplayName.length} / 120
                    </span>
                </div>

                <Field label="Contact info">
                    <Input
                        value={invoiceDetails.invoiceContact}
                        onChange={(e) =>
                            setInvoiceDetails({
                                ...invoiceDetails,
                                invoiceContact: e.target.value,
                            })
                        }
                        maxLength={120}
                    />
                    <div className="mt-[4px] flex justify-end">
                        <span
                            className={`text-[11px] ${invoiceDetails.invoiceContact.length > 120 ? "text-red-500" : "text-text/45"}`}
                        >
                            {invoiceDetails.invoiceContact.length} / 120
                        </span>
                    </div>
                </Field>

                <Field label="Invoice prefix">
                    <Input
                        className="font-mono"
                        value={invoiceDetails.invoicePrefix}
                        onChange={(e) =>
                            setInvoiceDetails({
                                ...invoiceDetails,
                                invoicePrefix: e.target.value,
                            })
                        }
                        maxLength={20}
                    />
                    <div className="mt-[4px] flex justify-end">
                        <span
                            className={`text-[11px] ${invoiceDetails.invoicePrefix.length > 20 ? "text-red-500" : "text-text/45"}`}
                        >
                            {invoiceDetails.invoicePrefix.length} / 20
                        </span>
                    </div>
                </Field>


                <Button
                    variant="primary"
                    className="self-start disabled:cursor-not-allowed"
                    onClick={handleSave}
                    disabled={mutation.isPending}
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
