import { Pipe, PipeTransform } from "@angular/core";
import { ResultDetail } from "../models/result-detail.model";

@Pipe({
    name: 'filterResultType'
})
export class FilterResultTypePipe implements PipeTransform {
    transform(resultDetails: ResultDetail[], args: string): ResultDetail[] {
        if(!args?.length) {
          return resultDetails;
        }
        return resultDetails.filter(item => `${item.map}` === args);
    }
}

