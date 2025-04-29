// create pipe filter ticket status
import { Pipe, PipeTransform } from '@angular/core';
import { ResultDetail } from '../models/result-detail.model';
@Pipe({
  name: 'filterTicketStatus'
})
export class FilterTicketStatusPipe implements PipeTransform {
  transform(resultDetails: ResultDetail[], args: string): ResultDetail[] {
    if(!args?.length) {
      return resultDetails;
    }

    
    return resultDetails.filter(item => args.includes(item.ticketStatus));
  }
}

