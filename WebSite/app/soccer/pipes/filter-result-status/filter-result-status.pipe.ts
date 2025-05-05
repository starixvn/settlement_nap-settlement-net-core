// create pipe filter result status
import { Pipe, PipeTransform } from "@angular/core";
import { ResultDetail } from "../../models";
import * as _ from "lodash";

@Pipe({
  name: "filterResultStatus",
})
export class FilterResultStatusPipe implements PipeTransform {
  transform(resultDetails: ResultDetail[], args: string): ResultDetail[] {
 
    const argsArray = args.split(",");
    return resultDetails.filter(
      (item) => {
        const hasResultStatus = !args?.length || argsArray.includes(item.resultStatus) ||
        this.filterConfirmTrader(argsArray, item) ||
        this.filterConfirmRefundMatch(argsArray, item)

        return this.isExistedItem(hasResultStatus, item);
      }
        
    );
  }

  private filterConfirmRefundMatch(args: string[], resultDetail: ResultDetail) {
    if (args.includes("Confirmed")) {
      return resultDetail.resultSettingData.isConfirmedRefund 
      || resultDetail.resultSettingData.isConfirmedRefundSdt;
    }
    return false;
  }

  private filterConfirmTrader(args: string[], resultDetail: ResultDetail) {
    if (args.includes("3")) {
      console.log(resultDetail);
      return resultDetail.resultStatusId === 3;
    }
    return false;
  }

  private isExistedItem(hasResultStatus: boolean, item: ResultDetail) {
    if (hasResultStatus) {
      item.isShow = true;
      return true;
    } else {
      item.isShow = false;
      return false;
    }
  }
}
