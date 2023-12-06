import * as _ from "lodash";
import { Pipe, PipeTransform } from "@angular/core";
import { ResourcesIds } from "../constants";

@Pipe({ name: "resourceName" })
export class ResourceNameByIdPipe implements PipeTransform {
  public transform(resourceId: string, sportType: number = 0) {
    if (sportType === 58) {
      switch (resourceId) {
        case "01":
          return "First half";
        case "0001":
          return "Full Time";
        case "ET":
          return "ET";
        case "PEN":
          return "PEN";
        case "00":
          return "Match";
        default:
          return "";
      }
    }
    if (_.isEqual(resourceId, ResourcesIds.totalSets)) {
      return "Total Sets";
    } else {
      const setNumber = resourceId.substr(3, 1);
      return `Set ${setNumber}`;
    }
  }
}
