export enum FeatureStatus {
    Open,
    InProgress,
    Done
}

export interface IFeature {
    id: number;
    name: string;
    description: string;
    status: FeatureStatus;
    startDate?: number;
    endDate?: number;
}