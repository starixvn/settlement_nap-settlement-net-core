import { Pipe, PipeTransform } from "@angular/core";
import { ResourceType } from "../../../shared/constants/resource-type.native";

@Pipe({
    name: "resourceTypeName",
    standalone: true
})
export class ResourceTypeNamePipe implements PipeTransform {
    transform(value: ResourceType): string {
        if (value === ResourceType.Main) {
            return 'Main Results';
        }
        if (value === ResourceType.Early) {
            return 'Early Results';
        }
        return 'Main Results';
    }

}