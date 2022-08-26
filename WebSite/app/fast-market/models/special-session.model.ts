export class SpecialSession {
    public resourceId: string;
    public startMinute: number;
    public startSecond: number;
    public endMinute: number;
    public endSecond: number;
    public color: string;
    public apply: boolean;
    public isSaveButtonPressed: boolean;
    public resultStatusId: number;

    constructor(resourceId: string) {
        this.resourceId = resourceId;
    }
}