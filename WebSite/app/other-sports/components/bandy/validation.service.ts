import { Injectable } from "@angular/core";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";

import * as _ from "lodash";
import { ResourceID } from "./constant";

@Injectable()
export class ValidationService  extends VerificationBaseService {

  public inValidFirstHalf(resultDetails: ResultDetail[]) {
    const fh = resultDetails.find(x => x.resourceId === ResourceID.HT);
    const ft = resultDetails.find(x => x.resourceId === ResourceID.FT);

    return this.hasScore(fh) 
      && this.hasScore(ft) 
      && (Number(fh.homeValue) > Number(ft.homeValue) 
        || Number(fh.awayValue) > Number(ft.awayValue));
  }

  public missScore() {
    
  }
}