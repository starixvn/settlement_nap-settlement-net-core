// create pipe filter result status
import { Pipe, PipeTransform } from "@angular/core";
import { ResultDetail } from "../../models";
import * as _ from "lodash";

@Pipe({
  name: "filterResultStatus",
})
export class FilterResultStatusPipe implements PipeTransform {
  transform(resultDetails: ResultDetail[], args: string): ResultDetail[] {
    if (!args?.length) {
      return resultDetails;
    }

    const argsArray = args.split(",");
    return resultDetails.filter(
      (item) =>
        argsArray.includes(item.resultStatus) ||
        this.filterConfirmTrader(argsArray, item) ||
        this.filterConfirmRefundMatch(argsArray, item)
    );
  }

  private filterConfirmRefundMatch(args: string[], resultDetail: ResultDetail) {
    if (args.includes("Confirmed")) {
      return resultDetail.resultSettingData.isConfirmedRefund;
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
}
