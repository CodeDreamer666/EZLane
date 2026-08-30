"use client"
import { createContext } from "react";
import type { StatusMessageApi } from "~/type/statusMessage";

export const StatusMessageContext = createContext<StatusMessageApi | null>(null);