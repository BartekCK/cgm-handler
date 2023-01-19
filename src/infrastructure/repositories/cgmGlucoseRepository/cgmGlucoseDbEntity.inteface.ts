export interface CgmGlucoseDbEntityInteface {
    id: string;
    value: number | null;
    valueDate: Date;
    trend: string;
    createdAt: Date;
    updatedAt: Date;
}
