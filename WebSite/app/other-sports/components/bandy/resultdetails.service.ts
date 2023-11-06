import { Inject, Injectable } from "@angular/core";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ResourceID, ResourceIDs } from "./constant";
import * as _ from "lodash";

@Injectable()
export class ResultDetailsService {
  public generateFullResultDetails(
    resultDetails: ResultDetail[],
    sportType: number
  ): ResultDetail[] {
    const resourcesTemp = this.getTempResourceIDs(sportType);

    return resourcesTemp.map((resourceId) => {
      const result = resultDetails.find((x) => resourceId === x.resourceId);
      if (result) {
        return result;
      }
      const newResult = new ResultDetail();
      newResult.resourceId = resourceId;
      return newResult;
    });
  }

  public generateByMenber(resultDetails: ResultDetail[], isLeader: boolean) {
    return resultDetails.map((x) =>
      isLeader ? x : { ...x, homeValue: "", awayValue: "" }
    );
  }

  public calcMatchResultDetails(resultDetails: ResultDetail[]): ResultDetail[] {
    const gameResults = resultDetails.filter((r) =>
      [ResourceID.FT, ResourceID.ET, ResourceID.PEN].includes(r.resourceId)
    );

    if(gameResults.some(x => _.isEmpty(x.homeValue) || _.isEmpty(x.awayValue))) {
      return resultDetails;
    }

    const homeValue = _.sumBy(gameResults, (x) => Number(x.homeValue));
    const awayValue = _.sumBy(gameResults, (x) => Number(x.awayValue));

  

    return resultDetails.map((result) =>
      result.resourceId === ResourceID.MATCH
        ? {
            ...result,
            homeValue: homeValue.toString(),
            awayValue: awayValue.toString(),
          }
        : result
    );
  }

  private getTempResourceIDs(sportType: number) {
    return ResourceIDs;
  }
}
