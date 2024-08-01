import * as _ from "lodash";
import { Pipe, PipeTransform } from "@angular/core";
import { ResourcesIds } from "../constants";
import { SportType } from "../../shared/constants";

@Pipe({ name: "resourceName" })
export class ResourceNameByIdPipe implements PipeTransform {
  public transform(resourceId: string, sportType = 0) {
    if (sportType === SportType.bandy) {
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
      const setNumber = resourceId.substring(3, 4);
      return `Set ${setNumber}`;
    }
  }
}
