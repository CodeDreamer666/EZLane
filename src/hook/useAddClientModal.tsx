import { useContext } from "react";
import type { AddClientModal } from "~/type/addClientModal";
import { AddClientModalContext } from "~/context/addClientModalContext";

export default function useAddClientModal(): AddClientModal {
    const context = useContext(AddClientModalContext);

    if (!context)
        throw new Error(
            "useAddClientModal must be used within AddClientModalProvider",
        );

    return context;
}
