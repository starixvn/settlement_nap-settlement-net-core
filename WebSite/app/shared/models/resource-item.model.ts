export class ResourceItem {
    resourceId: string;
    homeValue: string;
    awayValue: string;
    resourceName: string;
    otherInfo: string;
    constructor(resourceId: string, resourceName: string, homeValue: string, awayValue: string, otherInfo = "") {
        this.resourceId = resourceId;
        this.homeValue = homeValue;
        this.awayValue = awayValue;
        this.resourceName = resourceName;
        this.otherInfo = otherInfo;
    }
}