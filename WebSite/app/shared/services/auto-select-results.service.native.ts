import { Injectable } from '@angular/core';
import { ResultDetail } from '../models/sportsbook-sop';
import { OverStatus } from '../constants/over-status.native';
import { ResultStatusId } from '../constants/result-status-id.native';
import { SettlementStatusId, TicketStatusText } from '../constants';
@Injectable({
  providedIn: 'root'
})
export class AutoSelectResultsService {
  private readonly settledResultStatusIds = [ResultStatusId.ManualCompleted, ResultStatusId.AutoCompleted];   
  
  public selectByOverStatus(resultDetails: ResultDetail[], finalResult: ResultDetail, overStatus: string) { 
    const overStatuses = overStatus.split(',');

    if (!finalResult || !overStatuses.length || overStatuses.length > 1) {
      return;
    }

    resultDetails.forEach(item => {
      item.checked = item.checked || this.shouldCheckResult(item, overStatuses);
    });


  }

  private shouldCheckResult(resultDetail: ResultDetail, overStatuses: string[]): boolean {
    return overStatuses.some(status => {
      switch (status) {
        case OverStatus.MainOver:
          return this.isMainOverMet(resultDetail)
        case OverStatus.Over:
          return this.isOverMet(resultDetail);
        case OverStatus.SettledWithRunningTicket:
          return this.isSettledWithRunningTicketMet(resultDetail);
        default:
          return false;
      }
    });
  }

  private isMainOverMet(resultDetail: ResultDetail): boolean {
    console.log(resultDetail);
    return resultDetail.resultStatusId === ResultStatusId.TraderConfirm;
  }

  private isOverMet(resultDetail: ResultDetail): boolean {
    return !this.settledResultStatusIds.includes(resultDetail.resultStatusId);
  } 
  
  private isSettledWithRunningTicketMet(resultDetail: ResultDetail): boolean {
    return resultDetail.settlementStatusId === SettlementStatusId.Calculated 
      && resultDetail.ticketStatus === TicketStatusText.running;
  }
} 
