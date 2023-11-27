import { Injectable } from "@angular/core";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ResourceID } from "./constant";
import * as _ from "lodash";
import { SettlementStatusId } from "../../../shared/constants";

@Injectable()
export class BetStatusService {
  createBetStatusRefund(selectedResults: ResultDetail[], finalResult: ResultDetail) {
    const firstHalfResult = selectedResults.find(x => x.resourceId === ResourceID.FirstHalf);
    const finalSelectedResult = selectedResults.find(x => x.resourceId === ResourceID.Final);

    if(!_.isNil(finalSelectedResult)) {
      return 'Refund;'
    }

    if(!_.isNil(firstHalfResult)) {
      return finalResult.settlementStatusId === SettlementStatusId.Refund ? 'Refund;' : 'Refund HT;';
    }

    return '';
  }

  createBetStatusCalc(selectedResults: ResultDetail[],firstHalfResult : ResultDetail, finalResult: ResultDetail) {
    const firstSelectHalfResult = selectedResults.find(x => x.resourceId === ResourceID.FirstHalf);
    const finalSelectedResult = selectedResults.find(x => x.resourceId === ResourceID.Final);
    
    if(!_.isNil(firstSelectHalfResult) && _.isNil(finalSelectedResult)) {
      return finalResult.settlementStatusId === SettlementStatusId.Refund ? 'Refund;' : ''
    }

    if(!_.isNil(finalSelectedResult) && _.isNil(firstSelectHalfResult)) {
      return firstHalfResult.settlementStatusId === SettlementStatusId.Refund ? 'Refund HT;' : '';
    }

    return ''
  }
}