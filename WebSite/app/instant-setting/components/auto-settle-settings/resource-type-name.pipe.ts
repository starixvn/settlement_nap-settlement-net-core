import {Pipe, PipeTransform} from "@angular/core";
import {ResourceType} from "./types";

@Pipe({
    name: "resourceTypeName",
    standalone: true
})
export class ResourceTypeNamePipe implements PipeTransform {
    transform(value: ResourceType, ...args: any[]) : string {
        if(value === ResourceType.Main) {
            return 'Main Result';
        }
        if(value === ResourceType.Early) {
            return 'Early Result';
        }
        return  'Main Result';
    }

}