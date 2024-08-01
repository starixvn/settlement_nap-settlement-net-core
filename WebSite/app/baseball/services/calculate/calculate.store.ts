import { inject, Injectable, signal } from "@angular/core";
import { Match } from "../../models/match.model";
import { UrlHelper } from "../../../helper";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { AioService } from "../../../shared/services";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { CalculateAction, ResourceIds, ResultStatusId, SettlementStatusId } from "../../../shared/constants";
import { ResultDetailBaseBall } from "../../models/result-detail.model";
import { cloneDeep } from "lodash";
import { Store } from "../store.service";

@Injectable(
  {
    providedIn: 'root'
  }
)

export class CalculateStore implements Store{
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
    this.#verificationBaseService.generateExternalScores(matchFetched, matchFetched.resultDetails, matchFetched.matchDetail.sportType, matchFetched.matchDetail.providerCount > 2 ? 3 : 2);
    this.#match.set(matchFetched);
    this.maxProviderCol = matchFetched.matchDetail.providerCount > 2 ? 3 : 2;
    this.fulltimeResult = this.getFullTime();
    this.#originalResultDetails = cloneDeep(matchFetched.resultDetails);
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

  setReSettledTickets = (isReSettledTickets: boolean) => this.#isReSettledTickets.set(isReSettledTickets);

  setIsApplyHedgeMatch = (isApplyHedgeMatch: boolean) => this.#isApplyHedgeMatch.set(isApplyHedgeMatch);

  getMatch = () => this.#match();
  
  getApplyingHedgeMatch = () => this.#isApplyHedgeMatch();

  onSubmitCalculate () {
    this.#isClickOnCalculate = true;
    this.#actionSubmit = CalculateAction.calculate;
  }

  onSubmitUncalculate () {
    this.#isClickOnCalculate = false;
    this.#actionSubmit = CalculateAction.unCalculate;
  }

  getActionSubmit = () => this.#actionSubmit;

  getIsClickOnCalculate = () => this.#isClickOnCalculate;
}

