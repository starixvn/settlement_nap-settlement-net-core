export class ResourceItem {
    resourceId: string;
    homeValue: string; 
    awayValue: string;
    constructor(resourceId: string, homeValue: string, awayValue: string) {
        this.resourceId = resourceId;
        this.homeValue = homeValue;
        this.awayValue = awayValue;
    }
}