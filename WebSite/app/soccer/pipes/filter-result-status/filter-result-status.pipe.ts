// create pipe filter result status
import { Pipe, PipeTransform } from '@angular/core';
import { ResultDetail } from '../../models';

@Pipe({
  name: 'filterResultStatus'
})
export class FilterResultStatusPipe implements PipeTransform {
  transform(resultDetails: ResultDetail[], args: string): ResultDetail[] {
    if(!args?.length) {
      return resultDetails;
    }
    return resultDetails.filter(item => args.includes(item.resultStatus));
  }
}


