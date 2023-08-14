import { Injectable } from "@angular/core";
import {
  FantasyRelatedMatch,
  RelatedMatchResult,
} from "../models/fantasy.model";
import { flatMap, sum } from "lodash";
import { ResourcesIds } from "../constants/resource-ids.native";

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

  public sumScore(homes: FantasyRelatedMatch[], aways: FantasyRelatedMatch[]) {
    const resutls = this.combineResults(
      this.getResultsHome(homes),
      this.getResultsAway(aways)
    );
    return resutls;
  }

  private combineResults(
    homesResults: { resourceId: string; homeValue: number }[],
    awayResults: { resourceId: string; awayValue: number }[]
  ) {
    const results = awayResults.map((awayResult) => {
      const matchingItem = homesResults.find(
        (homeResult) => homeResult.resourceId === awayResult.resourceId
      );
      if (matchingItem) {
        return { ...awayResult, homeValue: matchingItem.homeValue };
      } else {
        return awayResult;
      }
    });

    return results;
  }

  private getResultsAway(aways: FantasyRelatedMatch[]) {
    const resultsAway = flatMap(aways, (x) => x.results);
    return this.sumResultsScore(resultsAway,false)

  }

  private getResultsHome(homes: FantasyRelatedMatch[]) {
    const resultsHome = flatMap(homes, (x) => x.results);
    return this.sumResultsScore(resultsHome)
  }

  private sumResultsScore(results: RelatedMatchResult[], home: boolean = true) {
    const result = [];  
    this.resourcesIds.forEach((resourceId) => {
      const resourceResults = results.filter(
        (x) =>
          x.resourceId === resourceId &&
          (x.homeValue !== null ||
          x.awayValue !== null)
      );

      if (resourceResults.length > 1) {
        const item = home
          ? {
              resourceId,
              homeValue: sum(resourceResults.map((x) => +x.homeValue)),
            }
          : {
              resourceId,
              awayValue: sum(resourceResults.map((x) => +x.awayValue)),
            };
        result.push(item);
      }
    });
    return result;
  }
}
