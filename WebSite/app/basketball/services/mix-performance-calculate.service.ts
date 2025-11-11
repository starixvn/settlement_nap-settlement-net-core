import { inject, Injectable } from "@angular/core";
import { OddFlexModel, ResultDetail } from "../../shared/models/sportsbook-sop";
import { PlayerBetTypes, PlayerTypes, ResourcesIds } from "../constants";
import { MixCoreService } from "./mix-core.service";
import { ResultStatusId, SettlementStatusId } from "../../shared/constants";

@Injectable()
export class MixPerformanceCalculateService {
  readonly #mixCoreService = inject(MixCoreService);

  autoFillMixPerformance(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!PlayerTypes.performance.includes(changedResultDetail.betType)) {
      return;
    }
   if(changedResultDetail.betType === PlayerBetTypes.performance && (changedResultDetail.resourceId === "6750101")) {
    this.calculatePerformanceValue(resultDetails, changedResultDetail);
   } 
  //  else if(changedResultDetail.betType === PlayerBetTypes.performanceDouble) {
  //   this.calculatePerformanceDoubleValue(resultDetails, changedResultDetail);
  //  } else if(changedResultDetail.betType === PlayerBetTypes.performanceTriple) {
  //   this.calculatePerformanceTripleValue(resultDetails, changedResultDetail);
  //  }
  }

  private calculatePerformanceValue(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if(!changedResultDetail.oddFlex.length) {
        return;        
    }
    const oddFlex = changedResultDetail.oddFlex[0];
    const relatedCalResourceIds = changedResultDetail.relatedCalResources.split(',').map(id => id.trim());
    const relatedResults = resultDetails.filter(result => relatedCalResourceIds.includes(result.resourceId));
    const finalResult = resultDetails.find(result => result.resourceId === ResourcesIds.finalScore);
    const isValidFinalResults = this.validateFinalResult(oddFlex, finalResult);
    const isValidStatisticResults = this.validateStatisticResult(oddFlex, relatedResults);
    const haveCheckedFinalResult = this.haveCheckedFinalResult(oddFlex);

    const canHaveYesValue = this.canHaveYesValue(relatedResults);
    if(canHaveYesValue && !haveCheckedFinalResult  && isValidStatisticResults) {
      return 'Y';
    }

    const canHaveNoValue = this.canHaveNoValue(relatedResults);
    if(canHaveNoValue && !haveCheckedFinalResult && !isValidStatisticResults) {
      return 'N';
    }

    const canHaveNoneValue = this.canHaveNoneValue(relatedResults);
    if(canHaveNoneValue && !haveCheckedFinalResult && !isValidStatisticResults) {
      return 'None';
    }

    return '';
  }

  private canHaveYesValue(relatedResults: ResultDetail[]): boolean {
    const hasValueAndRunning = relatedResults.every(result => 
      result.homeValue && 
      result.resultStatusId !== ResultStatusId.AutoCompleted && 
      result.resultStatusId !== ResultStatusId.ManualCompleted
    );
  
    const allCalculated = relatedResults.every(result => 
      result.settlementStatusId === SettlementStatusId.Calculated
    );
  
    const allRefundWithDetermined = relatedResults.every(result => 
      result.resultStatusId === ResultStatusId.RefundWithDetermined
    );
  
    return hasValueAndRunning || allCalculated || allRefundWithDetermined;
  }

  private canHaveNoValue(relatedResults: ResultDetail[]): boolean {
    const hasValueAndRunning = relatedResults.every(result => 
      result.homeValue && 
      result.resultStatusId !== ResultStatusId.AutoCompleted && 
      result.resultStatusId !== ResultStatusId.ManualCompleted
    );
  
    const allCalculated = relatedResults.every(result => 
      result.settlementStatusId === SettlementStatusId.Calculated
    );
  
  
    return hasValueAndRunning || allCalculated;
  }

  


  private canHaveNoneValue(relatedResults: ResultDetail[]): boolean {
    const hasRefundWithDetermined = relatedResults.some(result => 
      result.resultStatusId === ResultStatusId.RefundWithDetermined
    );

    return hasRefundWithDetermined;
  }

  private haveCheckedFinalResult(oddFlex:OddFlexModel): boolean { 
    return oddFlex.info.results.length > 0
  }

  private validateFinalResult(oddFlex: OddFlexModel, finalResult: ResultDetail): boolean {
    if(!oddFlex.info.results.length) {
      return true;
    }

    if(finalResult?.settlementStatusId !== SettlementStatusId.Calculated) {
      return false;
    }

    const { isHome, teamId } = oddFlex.info;
    const homeValue = Number(finalResult.homeValue);
    const awayValue = Number(finalResult.awayValue);
    const totalScore = homeValue + awayValue;
  
    const validators: Record<string, (value: number) => boolean> = {
      winner: (teamIdValue) => {
        const isHomeTeam = teamIdValue === teamId && isHome;
        return isHomeTeam ? homeValue > awayValue : awayValue > homeValue;
      },
      over: (score) => totalScore > score,
      handicap: (handicap) => 
        isHome ? homeValue - handicap > awayValue : awayValue - handicap > homeValue
    };
  
    return oddFlex.info.results.every(result => {
      const validator = validators[result.type];
      return validator ? validator(parseInt(result.value, 10)) : false;
    });
  }

  private validateStatisticResult(oddFlex: OddFlexModel, relatedResults: ResultDetail[]): boolean {
    const statisticToResourceId: Record<string, string> = 
    {
        points: "653",
        rebounds: "659",
        assists: "656",
        steals: "667",
        blocks: "665",
        three_points: "662"
    };
    return oddFlex.info.statistics.every(statistic => {
      const statisticResourceId = statisticToResourceId[statistic.type];
      const relatedResult = relatedResults.find(result => result.resourceId === statisticResourceId);
      return relatedResult ? this.compareWithCondition(parseInt(relatedResult.homeValue), statistic.value) : false;
    });
   
  }

  private compareWithCondition(value: number, condition: string): boolean {
    
    const matched = condition.match(/^(\d+)([+-]?)$/);
    if (!matched) {
      return false;
    }
  
    const threshold = parseInt(matched[1], 10);
    const operator = matched[2];
  
    switch (operator) {
      case '+': return value >= threshold;
      case '-': return value < threshold;
      default: return value === threshold;
    }
  }
}