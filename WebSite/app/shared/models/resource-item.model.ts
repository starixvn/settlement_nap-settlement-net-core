export class ResourceItem {
    resourceId: string;
    homeValue: string;
    awayValue: string;
    resourceName: string;
    constructor(resourceId: string, resourceName: string, homeValue: string, awayValue: string) {
        this.resourceId = resourceId;
        this.homeValue = homeValue;
        this.awayValue = awayValue;
        this.resourceName = resourceName;
    }
}