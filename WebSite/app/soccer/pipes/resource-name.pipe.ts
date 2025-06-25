import { Pipe, PipeTransform } from "@angular/core";
import { ResourceIds } from "../constants/resourceIds.native";

@Pipe({
  name: 'resourceName',
  standalone: true
})
export class ResourceNamePipe implements PipeTransform {
  transform(value: string): string {
    if(value === ResourceIds.halfTime){
      return "First Half";
    }
    if(value === ResourceIds.fullTime){
      return "Full Time"; 
    }
    return "";
  }
}