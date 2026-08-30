"use client"
import { createContext } from "react";
import type { AddClientModal } from "~/type/addClientModal";

export const AddClientModalContext = createContext<AddClientModal | null>(null);