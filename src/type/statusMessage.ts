export interface StatusMessage {
    id: string;
    text: string;
    isSuccess: boolean;
    createdAt: number;
}

export interface StatusMessageApi {
    messages: StatusMessage[];
    showMessage: (message: string, isSuccess?: boolean) => void;
    dismissMessage: (id: string) => void;
}