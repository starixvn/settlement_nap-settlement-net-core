import { Pipe, PipeTransform } from "@angular/core";
import { ResultDetail } from "../models/result-detail.model";

@Pipe({
    name: 'filterResultType'
})
export class FilterResultTypePipe implements PipeTransform {
    transform(resultDetails: ResultDetail[], args: string): ResultDetail[] {

        return resultDetails.filter(item => {
            const hasResultType = !args?.length || args.includes(`${item.map}`); 
            return this.isExistedItem(hasResultType, item);
        });
    }

    private isExistedItem(hasResultType: boolean, item: ResultDetail) {
        if (hasResultType) {
            item.isShow = true;
            return true;
        } else {
            item.isShow = false;
            return false;
        }
    }
}

