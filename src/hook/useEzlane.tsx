"use client";
import { useContext } from "react";
import { EzlaneContext, type EzlaneApi } from "~/components/provider/EzlaneProvider";

export default function useEzlane(): EzlaneApi {
  const context = useContext(EzlaneContext);

  if (!context) throw new Error("useEzlane must be used within EzlaneProvider");

  return context;
}
