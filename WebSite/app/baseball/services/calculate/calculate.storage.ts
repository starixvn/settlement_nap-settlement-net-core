import { inject, Injectable, signal } from "@angular/core";
import { Match } from "../../models/match.model";
import { UrlHelper } from "../../../helper";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { AioService } from "../../../shared/services";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { CalculateAction, ResourceIds, ResultStatusId, SettlementStatusId } from "../../../shared/constants";
import { ResultDetailBaseBall } from "../../models/result-detail.model";
import { cloneDeep } from "lodash";
import { Storage } from "../storage.service";
import { ResultRowStateService } from "../result-row-state.service";
import { ResultState } from "../../models/result-state.model";


export interface ICalculateStorage extends Storage  {
  selectFinalResult?: () => void;
  selectResult?: (resourceId: string) => void;
}

@Injectable(
  {
    providedIn: 'root'
  }
)
export class CalculateStorage implements ICalculateStorage {

  #aioService = inject(AioService);
  #verificationBaseService = inject(VerificationBaseService);

  #match = signal<Match>(null);
  #isScoreDirect = signal<boolean>(false);
  #isReSettledTickets = signal<boolean>(false);
  #isApplyHedgeMatch = signal<boolean>(false);

  #originalResultDetails: ResultDetailBaseBall[];
  #isClickOnCalculate = false;
  #actionSubmit = '';

  isScoreDirect = this.#isScoreDirect.asReadonly();
  isReSettledTickets = this.#isReSettledTickets.asReadonly();

  fulltimeResult: ResultDetailBaseBall;
  maxProviderCol: number;

  async fetchMatch(matchId: number) {
    const sportType = Number(UrlHelper.getUrlParameter('sportType'));
    const matchQuery = {
      matchId,
      apikey: BaseballApiKeys.NormalMatch,
      sportType,
      settleType: "MNL"
    };
    const matchFetched = (await this.#aioService.getMatch(matchQuery)) as Match;
    matchFetched.resultDetails.forEach((map) => {
      if (map.settlementStatusId === SettlementStatusId.Calculated) {
        map.originalHomeValue = map.homeValue;
        map.originalAwayValue = map.awayValue;
      } else {
        map.originalHomeValue = '0';
        map.originalAwayValue = '0';
      }
    });
    this.#verificationBaseService.generateExternalScores(matchFetched, matchFetched.resultDetails, matchFetched.matchDetail.sportType, matchFetched.matchDetail.providerCount > 2 ? 3 : 2);
    this.#match.set(matchFetched);
    this.maxProviderCol = matchFetched.matchDetail.providerCount > 2 ? 3 : 2;
    this.fulltimeResult = this.getFullTime();
    this.#originalResultDetails = cloneDeep(matchFetched.resultDetails);
    this.setIsApplyHedgeMatch(!!matchFetched.hedgeMatchDetail);
  }

  mapTicketStatusExtraInning() {
    const extraInning = this.#match().resultDetails.find((item) => item.resourceId === ResourceIds.extraInning);
    if (extraInning) {
      extraInning.ticketStatus = this.fulltimeResult.ticketStatus;
    }
  }

  resetHomeAway() {
    this.#match().resultDetails.forEach((map) => {
      const hideScore = map.settlementStatusId === SettlementStatusId.Refund
        || (map.resultStatusId !== ResultStatusId.ManualCompleted && map.resultStatusId !== ResultStatusId.AutoCompleted);
      map.homeValue = hideScore ? "" : map.homeValue;
      map.awayValue = hideScore ? "" : map.awayValue;
    });
  }

  updateInputScoreDirect = (isScoreDirect: boolean) => this.#isScoreDirect.set(isScoreDirect);

  getMatchDetail = () => this.#match().matchDetail;

  getPermission = () => this.#match().permission;

  getResultDetails = () => this.#match().resultDetails;

  getResultChecked = () => this.#match().resultDetails.filter((item) => item.checked);

  getOriginalResultDetails = () => this.#originalResultDetails;

  isLeader = () => this.#match().permission.isLeader;

  getAllInnings = () => this.#match().resultDetails.filter((item) => item.resourceId !== ResourceIds.fullTime);

  getFullTime = () => this.#match().resultDetails.find((item) => item.resourceId === ResourceIds.fullTime);

  getExtraInning = () => this.#match().resultDetails.find((item) => item.resourceId === ResourceIds.extraInning);

  onChange = () => this.#isClickOnCalculate = false;

  setReSettledTickets = (isReSettledTickets: boolean) => {
    this.#isReSettledTickets.set(isReSettledTickets);
  };

  setIsApplyHedgeMatch = (isApplyHedgeMatch: boolean) => this.#isApplyHedgeMatch.set(isApplyHedgeMatch);

  getMatch = () => this.#match();

  getApplyingHedgeMatch = () => this.#isApplyHedgeMatch();

  onSubmitCalculate() {
    this.#isClickOnCalculate = true;
    this.#actionSubmit = CalculateAction.calculate;
  }

  onSubmitUncalculate() {
    this.#isClickOnCalculate = false;
    this.#actionSubmit = CalculateAction.unCalculate;
  }

  getActionSubmit = () => this.#actionSubmit;

  getIsClickOnCalculate = () => this.#isClickOnCalculate;

  getIsReSettledTickets = () => this.#isReSettledTickets;

  selectFinalResult = () => {
    this.#match().resultDetails.forEach((item) => {
      item.checked = item.resourceId === ResourceIds.fullTime || item.checked;
    });
  };

  selectResult = (resourceId: string) => {
    this.#match().resultDetails.forEach((item) => {
      item.checked = (resourceId && item.resourceId === resourceId) || item.checked;
    });
  };
  
  setResultState = (service: ResultRowStateService, inning: ResultDetailBaseBall) => { 
    inning.resultState = new ResultState(service, inning);
  }

  setResultsCheckedState = (service: ResultRowStateService) => {
    this.getResultChecked().forEach((inning) => {
      this.setResultState(service,inning);
    })
  }

  setAllInningsResultState = (service: ResultRowStateService) => {
    this.getAllInnings().forEach((inning) => {
      this.setResultState(service,inning);
    })
  }
}

