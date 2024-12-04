import * as _ from "lodash";
import { inject, Injectable, signal } from "@angular/core";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { UrlHelper } from "../../../helper";
import { Match } from "../../models/match.model";
import { AioService } from "../../../shared/services";
import { ResourceNamePipe } from "../../pipes/resource-name.pipe";
import { ResultDetail, ExternalResultDetail } from "../../../shared/models/sportsbook-sop";
import { IntervalBackgroundPipe } from "../../../shared/pipes/interval-background.pipe";
import { isEqual, isEmpty } from "lodash";
import { SettlementStatusId, ResourceIds } from "../../../shared/constants";
import { Storage } from "../storage.service";
import { ResultDetailBaseBall } from "../../models";

export interface IRefundStorage extends Storage  {
  isMercy() : boolean;
  isSdtSettle() : boolean;
  isAwayEnded() : boolean;
  isGetSettleSdt() : boolean;
  isSelectedMatch() : boolean;

  setSettleDetermine(value: boolean): void;
  setAwayEnded(value: boolean): void;
  setMercy(value: boolean): void;
  getExternalResults() : ExternalResultDetail[];
  addExtraInning(): void;
}

@Injectable()

export class RefundStorage implements IRefundStorage {
  private readonly aioService = inject(AioService);
  private readonly resultPipe = inject(ResourceNamePipe);
  private readonly intervalBackgroundPipe = inject(IntervalBackgroundPipe);
  #match = signal<Match>(null);
  #isSdtSettle = signal<boolean>(false);
  #isMercy = signal<boolean>(false);
  #isAwayEnded = signal<boolean>(false);
  #isApplyHedgeMatch = signal<boolean>(false);

  match = this.#match.asReadonly();
  isSdtSettle = this.#isSdtSettle.asReadonly();
  isMercy = this.#isMercy.asReadonly();
  isAwayEnded = this.#isAwayEnded.asReadonly();

  async fetchMatch(matchId: number) {
    const sportType = Number(UrlHelper.getUrlParameter('sportType'));
    const matchQuery = {
      matchId,
      apikey: BaseballApiKeys.NormalMatchRefund,
      sportType,
      settleType: "MNL"
    };
    const matchFetched = (await this.aioService.getMatch(matchQuery)) as Match;
    matchFetched.resultDetails.forEach(result => {
      result.resourceName = this.resultPipe.transform(result.resourceId, false,matchFetched.matchDetail.sessionTime);
      result.className = this.getClass(result);
      result.isDisplayedForMember = matchFetched.permission.isLeader || Number(result.settlementStatusId) !== SettlementStatusId.Running;
    });
    this.#match.set(matchFetched);
  }

  getActionSubmit = () => "";

  isReSettledTickets = () => false;
  
  setReSettledTickets = () => {};

  isScoreDirect = () => false;
  
  isSelectedMatch = () => this.#match().resultDetails.some(item => item.resourceId === ResourceIds.fullTime && item.checked);

  getResultChecked = () => this.#match().resultDetails.filter(x => x.checked);

  getResultDetails = () => this.#match().resultDetails;

  getMatch = () => this.#match();

  getExternalResults = () => this.#match().externalResults.length > 0 ? this.#match().externalResults[0].resultDetails : [];

  getApplyingHedgeMatch = () => this.#isApplyHedgeMatch();

  getMatchDetail = () => this.#match().matchDetail;

  getClass(resultDetail: ResultDetail) {
    let className = '';

    if (isEqual(resultDetail.resourceId, "00")) {
      className += 'final-score ';
    } else if (isEqual(resultDetail.resourceId, "01")) {
      className += 'ht-score ';
    }

    return className + this.intervalBackgroundPipe.transform(resultDetail.settlementStatusId);
  }
  setSettleDetermine = (value: boolean) => {
    this.#isSdtSettle.set(value);
  };

  setAwayEnded = (value: boolean) => {
    this.#isAwayEnded.set(value);
  };

  setMercy = (value: boolean) => {
    this.#isMercy.set(value);
  };

  getOriginalResultDetails = () => [];

  isLeader = () => this.#match().permission.isLeader;

  isOtherInfoContain = (otherInfo: string) => this.#match().resultDetails.some((item) => !isEmpty(item.otherInfo) && isEqual(item.otherInfo.toLowerCase(), otherInfo));

  isGetMercy = () =>  this.isLeader() && this.#match().resultDetails.some((item) => this.isCheckedMercy(item));

  isCheckedMercy = (item: ResultDetailBaseBall) => item.resultSettingData.isConfirmedRefundMercy || (!isEmpty(item.otherInfo) && isEqual(item.otherInfo.toLowerCase(), ResourceIds.mercy.toLowerCase()));

  isGetAwayEnded = () => this.isLeader() && !this.isOtherInfoContain("a");

  isGetSettleSdt () {
    if(!this.isLeader()) {
      return false;
    }

    const resultDetails = this.#match().resultDetails;
    const existResultConfirmedSDT = resultDetails.some(item => item.resultSettingData.isConfirmedRefundSdt);
    if (existResultConfirmedSDT) {
        return true;
    }

    const resultConfirmNormal = resultDetails.some(item => item.resultSettingData.isConfirmedRefund);

    if (resultConfirmNormal) {
        return false;
    }

    return resultDetails.some(item => item.settlementStatusId === SettlementStatusId.Calculated);
  } 

  addExtraInning () {
    if(this.isSelectedMatch()) {
      _.forEach(this.getResultDetails(), (item) => {
        if(item.resourceId === ResourceIds.extraInning) {
          item.checked = true;
        }
      });
    }
  }
}