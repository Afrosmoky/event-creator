/// <reference types="vite/client" />

export {};

declare global {
    interface Window {
        __APP_CONTEXT__?: {
            ballroomId?: string;
            eventUid?: string;
        };
    }
}