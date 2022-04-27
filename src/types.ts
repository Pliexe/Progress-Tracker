export enum FeatureStatus {
    Open,
    InProgress,
    Done,
}

export interface IFeature {
    name: string;
    description: string;
    status: FeatureStatus;
    startDate?: number;
    endDate?: number;
}