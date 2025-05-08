// create pipe filter ticket status
import { Pipe, PipeTransform } from '@angular/core';
import { ResultDetail } from '../models/result-detail.model';
@Pipe({
  name: 'filterTicketStatus'
})
export class FilterTicketStatusPipe implements PipeTransform {
  transform(resultDetails: ResultDetail[], args: string): ResultDetail[] {
    
      return resultDetails.filter(item => {
        const hasTicketStatus = !args?.length || args.includes(item.ticketStatus);
        return this.isExistedItem(hasTicketStatus, item);
      });
  }

  private isExistedItem(hasTicketStatus: boolean, item: ResultDetail) {
    if (hasTicketStatus) {
      item.isShow = true;
      return true;
    } else {
      item.isShow = false;
      return false;
    }
  }
}
