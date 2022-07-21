export class ProviderSource {
    public sourceId: number;
    public sourceName: string;
    public orderNo: number;

    constructor(sourceId: number, name: string) {
        this.sourceId = sourceId;
        this.sourceName = name;
    }
}