"use client";
import { useContext } from "react";
import {
    StatusMessageContext,
} from "~/context/statusMessage";
import type { StatusMessageApi } from "~/type/statusMessage";

export default function useStatusMessage(): StatusMessageApi {
    const context = useContext(StatusMessageContext);

    if (!context)
        throw new Error(
            "useStatusMessage must be used within StatusMessageProvider",
        );

    return context;
}
