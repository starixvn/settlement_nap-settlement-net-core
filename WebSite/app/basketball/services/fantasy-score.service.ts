import { Injectable } from "@angular/core";
import { FantasyRelatedMatch } from "../models/fantasy.model";
import * as _ from "lodash";
import { ResourcesIds } from "../constants/resource-ids.native";

type ResultTemp = {resourceId: string, value: number}

@Injectable()
export class FantasyScoreService {
  private readonly resourcesIds = [
    ResourcesIds.quarter1,
    ResourcesIds.quarter2,
    ResourcesIds.quarter3,
    ResourcesIds.quarter4,
    ResourcesIds.ot,
    ResourcesIds.htScore,
    ResourcesIds.finalScore,
  ];


  public sumScore(relatedMatches: FantasyRelatedMatch[], teamIds: string[]) {
    const resultsOfHome = _.chain(relatedMatches)
      .filter(x => teamIds.includes(x.homeId.toString()))
      .flatMap(x => x.results)
      .groupBy(x => x.resourceId)
      .map((group, key) => ({
        resourceId: key,
        value: _.sumBy(group, result => parseInt(result.homeValue) || 0)
      }))
      .value();

    const resultsOfAway = _.chain(relatedMatches)
      .filter(x => teamIds.includes(x.awayId.toString()))
      .map(x => x.results)
      .flatten()
      .groupBy(x => x.resourceId)
      .map((group, key) => ({
        resourceId: key,
        value: _.sumBy(group, result => parseInt(result.awayValue) || 0)
      }))
      .value();

      const results = _.chain(resultsOfHome)
        .concat(resultsOfAway)
        .groupBy(x => x.resourceId)
        .map((group, key) => ({
            resourceId: key,
            value: _.sumBy(group, x => x.value)
        }))
        .value();

    return results;
  }

  public combineResult(homeValueResults: ResultTemp[], awayValueResults: ResultTemp[]) {
    const commonResourceIds = _.intersectionBy(homeValueResults, awayValueResults, x => x.resourceId);

    return _.map(commonResourceIds, commonResult => {
        const homeResult = homeValueResults.find(x => x.resourceId === commonResult.resourceId);
        const awayResult = awayValueResults.find(x => x.resourceId === commonResult.resourceId);

        return {
            resourceId: commonResult.resourceId,
            homeValue: `${homeResult?.value || 0}`,
            awayValue: `${awayResult?.value || 0}`
        };
    });
}
}
