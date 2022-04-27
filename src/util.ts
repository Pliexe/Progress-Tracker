import { FeatureStatus } from "./types";

export const delay = (timeout: number) => new Promise<void>((res, rej) => setTimeout(() => {
    res();
}, timeout));

export const getStatusEmote = (status: FeatureStatus) => {
    switch(status) {
        case FeatureStatus.Open:
            return "❌";
        case FeatureStatus.InProgress:
            return "🕐";
        case FeatureStatus.Done:
            return "✅";
    }
}

export const getStatusString = (status: FeatureStatus) => {
    switch(status) {
        case FeatureStatus.Open:
            return "Open";
        case FeatureStatus.InProgress:
            return "In Progress";
        case FeatureStatus.Done:
            return "Done";
    }
}