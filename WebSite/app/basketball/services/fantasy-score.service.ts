import { Injectable } from "@angular/core";
import {
  FantasyRelatedMatch,
  RelatedMatchResult,
} from "../models/fantasy.model";
import { flatMap, isEmpty, sum } from "lodash";
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

  public sumScore(
    homeTeams: string[],
    homes: FantasyRelatedMatch[],
    awayTeams: string[],
    aways: FantasyRelatedMatch[]
  ) {
    const resutls = this.combineResults(
      this.getResultsHome(homeTeams, homes),
      this.getResultsAway(awayTeams, aways)
    );
    return resutls;
  }

  private combineResults(
    homesResults: { resourceId: string; homeValue: number }[],
    awayResults: { resourceId: string; awayValue: number }[]
  ) {
    const results = [];

    this.resourcesIds.forEach((resourceId) => {
      const resultHomeItem = homesResults.find(
        (homeResult) => homeResult.resourceId === resourceId
      );
      const resultAwayItem = awayResults.find(
        (awayResult) => awayResult.resourceId === resourceId
      );

      if(resultAwayItem && resultHomeItem) {
        results.push({
          resourceId,
          homeValue: resultHomeItem?.homeValue,
          awayValue:resultAwayItem?.awayValue
        })
      }

      if(resourceId == ResourcesIds.ot && (resultHomeItem || resultAwayItem)) {
        results.push({
          resourceId,
          homeValue: resultHomeItem?.homeValue,
          awayValue:resultAwayItem?.awayValue
        })
      }
    })

    return results;
  }

  private getResultsAway(awayTeams: string[], aways: FantasyRelatedMatch[]) {
    const newAways = this.changeMatchesByFantasyTeam(awayTeams, aways);
    const results = this.sumResultsScore(
      flatMap(newAways, (x) => x.results),
      false
    );

    return results;
  }

  private getResultsHome(homeTeams: string[], homes: FantasyRelatedMatch[]) {
    const newHomes = this.changeMatchesByFantasyTeam(homeTeams, homes);
    const results = this.sumResultsScore(flatMap(newHomes, (x) => x.results));

    return results;
  }

  private changeMatchesByFantasyTeam(
    teams: string[],
    matches: FantasyRelatedMatch[]
  ) {
    const newHomes = matches.map((home) => {
      const isHome = teams.includes(`${home.homeId}`);

      const updatedResults = home.results.map((result) => ({
        ...result,
        isHome: isHome,
      }));

      return {
        ...home,
        results: updatedResults,
      };
    });

    return newHomes;
  }

  private getCorrectResults(results: RelatedMatchResult[], resourceId: string) {
    const resourceResults = results.filter((x) => x.resourceId === resourceId);

    if (resourceId === ResourcesIds.ot) {
      return resourceResults;
    }

    const existsNullScore = resourceResults.some(
      (x) => isEmpty(x.homeValue) || isEmpty(x.awayValue)
    );
    if (existsNullScore) {
      return [];
    }

    return resourceResults;
  }

  private sumResultsScore(results: RelatedMatchResult[], home: boolean = true) {
    const result = [];

    this.resourcesIds.forEach((resourceId) => {
      const resourceResults = this.getCorrectResults(results, resourceId);

      if (resourceResults && resourceResults.length) {
        const score = sum(
          resourceResults.map((x) => (x.isHome ? +x.homeValue : +x.awayValue))
        );
        const item = home
          ? {
              resourceId,
              homeValue: score,
            }
          : {
              resourceId,
              awayValue: score,
            };
        result.push(item);
      }
    });
    return result;
  }
}
