"use client";
import { useEffect, useState } from "react";
import { Button, Field, Input, LoadingScreen, LoadingIcon, ServerError } from "~/components/shared";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";

export default function ProfileSection() {
    const { showMessage } = useStatusMessage();
    const { data, isLoading, error } = api.settings.getProfile.useQuery();
    const utils = api.useUtils();

    const [name, setName] = useState("");

    useEffect(() => {
        if (data?.name !== undefined) setName(data.name);
    }, [data]);

    const mutation = api.settings.updateProfile.useMutation({
        onSuccess: () => {
            showMessage("Username saved successfully", true);
        },

        onError: (err) => {
            const msg = getFriendlyError(err);
            showMessage(msg, false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const handleSave = () => {
        const trimmed = name.trim();

        if (trimmed.length < 1) {
            showMessage("Display name is required", false);
            return;
        }

        if (trimmed.length > 120) {
            showMessage("Display name must be at most 120 characters", false);
            return;
        }

        mutation.mutate({ name: trimmed });
    };

    if (isLoading) return <LoadingScreen />;

    if (error || !data) return <ServerError />;

    return (
        <div className="flex flex-col gap-[16px]">
            <div>
                <h4 className="font-heading m-[0_0_3px] text-[20px] leading-[1.12] font-semibold tracking-[-0.015em]">
                    Profile
                </h4>
                <div className="text-text/55 text-[12.5px]">
                    Shown to clients on proposals and in the portal.
                </div>
            </div>

            <Field label="Username">
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={120}
                />

                <div className="mt-[4px] flex justify-end">
                    <span
                        className={`text-[11px] ${name.length > 120 ? "text-red-500" : "text-text/45"}`}
                    >
                        {name.length} / 120
                    </span>
                </div>

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
