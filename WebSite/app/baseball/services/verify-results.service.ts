import { Injectable } from "@angular/core";
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { ResourceIds, ScoreSourceType } from "../../shared/constants";
import { ResultDetail } from "../../shared/models/sportsbook-sop/result-detail.model";
import * as _ from "lodash";

@Injectable({ providedIn: "root" })
export class VerificationResultsService extends VerificationBaseService {
  public allMapHaveScreenshotSource(selectedResult: ResultDetail[]): boolean {
    let result = true;
    _.forEach(selectedResult, (map) => {
      if (
        !this.isExistScreenshotSource(map) &&
        !this.isExistExtraSources(map, ResourceIds.extraInning)
      ) {
        result = false;
      }
    });

    return result;
  }

  public allMapHaveScoreSources(selectedResult: ResultDetail[]): boolean {
    let result = true;
    _.forEach(selectedResult, (map) => {
        if (!this.isExistScoreSources(map) && !this.isExistExtraSources(map, ResourceIds.extraInning)) {
            result = false;
        }
    });

    return result;
  }

  private isExistExtraSources(map: ResultDetail, extraResourceId: string) {
    if (_.isEqual(map.resourceId, extraResourceId)) {
      const providerScore = this.findExistedProvider(map);
      const outsideScore = this.findExistedOutside(map);
      return _.isNil(providerScore) === _.isNil(outsideScore);
    }

    return false;
  }

  private findExistedProvider(map: ResultDetail) {
    return _.find(
      map.externalScores,
      (source) =>
        source.sourceId < ScoreSourceType.screenshot &&
        this.isExistedHomeAwayScore(source.homeValue, source.awayValue)
    );
  }

  private findExistedOutside(map: ResultDetail) {
    return _.find(
      map.externalScores,
      (source) =>
        source.sourceId >= ScoreSourceType.screenshot &&
        this.isExistedHomeAwayScore(source.homeValue, source.awayValue)
    );
  }
}
