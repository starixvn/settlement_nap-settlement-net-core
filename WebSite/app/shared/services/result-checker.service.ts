import { Injectable } from "@angular/core";
import { ResultDetail } from "../models/sportsbook-sop";

@Injectable({ providedIn: 'root'})
export class ResultCheckerService {
  public isResultsConfirmRefund(resultDetails: ResultDetail[]): boolean  {
    return resultDetails.every((item: ResultDetail) => item.resultSettingData.isConfirmedRefund);
  };


}