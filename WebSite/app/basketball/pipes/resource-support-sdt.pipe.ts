import { Pipe, PipeTransform } from "@angular/core";
import { Resources } from "../constants";
import { ResultDetail } from "../../shared/models/sportsbook-sop";

@Pipe({
  name: 'resourceSupportSDT',
  standalone: true
})
export class ResourceSupportSDTPipe implements PipeTransform {
  transform(resultDetails: ResultDetail[], isSDT: boolean) {
    return resultDetails.filter(result => {
      result.isShow = isSDT ? Resources.supportSDT.includes(result.betType) : true;
      result.checked = result.isShow ? result.checked : false;
      return result.isShow;
    });
  }
}