import { inject, Injectable, signal } from "@angular/core";
import { UrlHelper } from "../../../helper";
import { AioService } from "../../../shared/services";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { Match } from "../../models/match.model";
import { ResourceNamePipe } from "../../pipes/resource-name.pipe";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { cloneDeep, isEqual, isNil, uniqBy } from "lodash";
import { GroupMap, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ItemsSelect, ResultSettingModel } from "../../../shared/models";
import { BackgroundColor, SettlementStatusId, TicketStatusText } from '../../../shared/constants';
import { Storage } from '../storage.service';
import { IntervalBackgroundPipe } from "../../../shared/pipes/interval-background.pipe";
import { KickOffTime } from "../../constants/kick-off-time.constant";

@Injectable()
export class EarlySettlementStorage implements Storage {
  readonly #aioService = inject(AioService);
  readonly #resultPipe = inject(ResourceNamePipe);
  readonly #verificationService = inject(VerificationBaseService);
  readonly #intervalBackgroundPipe = inject(IntervalBackgroundPipe);

  readonly #match = signal<Match>(null);
  readonly #disableAction = signal<boolean>(true);
  #mainResults: ResultDetail[];
  #earlyResults: ResultDetail[];
  #earlyOriginalResults: ResultDetail[];
  #groupResultDetail: GroupMap[];
  #actionSubmit = '';
  readonly #resultType = signal<string>("");
  readonly #isReSettledTickets = signal<boolean>(false);
  readonly #ticketStatus = signal<string>("");
  readonly #resultStatus = signal<string>("");

  match = this.#match.asReadonly();
  readonly resultType = this.#resultType.asReadonly();
  readonly ticketStatus = this.#ticketStatus.asReadonly();
  readonly resultStatus = this.#resultStatus.asReadonly();
  readonly disableAction = this.#disableAction.asReadonly();
  isReSettledTickets = this.#isReSettledTickets.asReadonly();

  async fetchMatch(matchId: number) {
    const sportType = Number(UrlHelper.getUrlParameter('sportType'));
    const matchQuery = {
      matchId,
      apikey: BaseballApiKeys.NormalMatch,
      sportType,
      settleType: "EAR"
    };
    const matchFetched = (await this.#aioService.getMatch(matchQuery)) as Match;
    this.#verificationService.generateExternalScores(matchFetched, matchFetched.resultDetails, matchFetched.matchDetail.sportType, matchFetched.matchDetail.providerCount > 2 ? 3 : 2);
    const mainResults = matchFetched.resultDetails.filter(x => x.resourceId.length < 5 && !x.resourceId.startsWith('88') && isNil(x.betTypeName));
    this.#mainResults = cloneDeep(mainResults);
   
    this.#earlyResults = matchFetched.resultDetails.filter(x => x.resourceId.startsWith('88') && !isNil(x.betTypeName));
    this.#match.set(matchFetched);
    this.GetInitStatus();
    this.#earlyOriginalResults = cloneDeep(this.#earlyResults);
  }

  private GetInitStatus() {
    this.#mainResults.forEach(x => {
      x.resourceName = this.#resultPipe.transform(x.resourceId, true, this.#match().matchDetail.sessionTime);
      x.className = this.getClass(x);
      x.isDisplayedForMember = this.isLeader() || +x.settlementStatusId !== SettlementStatusId.Running;
    });

    this.#earlyResults.forEach(x => x.resultSettingData.iconHoldResult = this.setIconMap(x.resultSettingData.isHoldResult, this.#match()));
  }

  groupInning() {
    const inningId = "8823";
    this.#earlyResults.forEach((item) => {
      if (item.resourceId.startsWith(inningId)) {
        item.groupName = "Inning";
      } else {
        item.groupName = "Match";
      }
    });
    this.#groupResultDetail = this.getGroupMapByGroupName(this.#earlyResults, this.#match());
  }

  updateDisableAction() {
    this.#disableAction.set(!this.#earlyResults.some(x => x.checked));
  }

  getPermission = () => this.#match().permission;

  getMainResult = () => this.#mainResults;

  getEarlyResultSelected = () => this.#earlyResults.filter(x => x.checked);

  getGroupResultDetail = () => this.#groupResultDetail;

  setReSettledTickets = (isReSettledTickets: boolean) => this.#isReSettledTickets.set(isReSettledTickets);

  getMatchDetail = () => this.#match().matchDetail;

  getResultChecked = () => this.#earlyResults.filter(x => x.checked);

  getResultDetails = () => this.#earlyResults;
  
  getActionSubmit = () => this.#actionSubmit;

  setActionSubmit = (action: string) => this.#actionSubmit = action;

  isLeader = (): boolean => this.#match().permission.isLeader;

  isConfirmed = (resultSetting: ResultSettingModel) => false;

  isScoreDirect = (): boolean => true;

  getMatch = (): Match => this.#match();

  getApplyingHedgeMatch = (): boolean => false;

  getOriginalResultDetails = () => this.#earlyOriginalResults;

  updateFilter(value: ItemsSelect[], type: number) {
    switch (type) {
      case 1:
        this.#resultType.set(value.length > 0 ? value.map(item => item.value).join() : "");
        break;
      case 2:
        this.#ticketStatus.set(value.length > 0 ? value.map(item => item.value).join() : "");
        break;
      case 3:
        this.#resultStatus.set(value.length > 0 ? value.map(item => item.value).join() : "");
        break;
    }
    this.#earlyResults.forEach((map) => {
      map.checked = false;
    });
    this.#groupResultDetail.forEach(map => {
      map.checked = false;
    });
    this.updateDisableAction();
  }

  updateValueGroup(group: GroupMap, isHoldResult: boolean) {
    group.isHoldResult = isHoldResult;
    group.resultDetail.forEach(x => {
      x.resultSettingData.isHoldResult = isHoldResult;
      x.resultSettingData.iconHoldResult = this.setIconMap(isHoldResult, this.#match());
      x.checked = false;
    });
    group.icon = this.setIconMap(isHoldResult, this.#match());

    this.updateDisableAction();
  }

  updateHoldStatus(resultDetail: ResultDetail, isHoldResult: boolean) {
    resultDetail.resultSettingData.isHoldResult = isHoldResult;
    resultDetail.resultSettingData.iconHoldResult = this.setIconMap(resultDetail.resultSettingData.isHoldResult, this.#match());
    resultDetail.checked = false;
    this.updateDisableAction();
  }


  private setIconMap(isHoldResult: boolean, match: Match) {
    if (match.permission.canCalculate || match.permission.canUncalculate || match.permission.canRefund) {
      return isHoldResult ? BackgroundColor.iconYes : BackgroundColor.iconNo;
    } else {
      return isHoldResult ? BackgroundColor.iconAutoDisabled : BackgroundColor.iconNoDisabled;
    }
  }

  private getGroupMapByGroupName(resultDetails: ResultDetail[], match: Match) {
    const list = uniqBy(resultDetails, (item) => item.groupName);
    const maps: GroupMap[] = [];

    list.forEach((item) => {
      const newResultDetails = resultDetails.filter((x) => x.groupName === item.groupName && !isEqual(x.ticketStatus, TicketStatusText.noTicket));
      maps.push(new GroupMap(item.groupName, newResultDetails));
    });

    maps.forEach(item => {
      item.isHoldResult = item.resultDetail.every(i => i.resultSettingData.isHoldResult)
      item.icon = this.setIconMap(item.isHoldResult, match);
    });

    return maps;
  }

  getClass(resultDetail: ResultDetail) {
    let className = '';

    if (isEqual(resultDetail.resourceId, "00")) {
      className += 'final-score ';
    } else if (isEqual(resultDetail.resourceId, "01")) {
      className += 'ht-score ';
    }

    return className + this.#intervalBackgroundPipe.transform(resultDetail.settlementStatusId);
  }

  getIsReSettledTickets = () => this.#isReSettledTickets;

  isReadyMatch(): boolean {
    return this.#match().matchDetail.playTime >= KickOffTime.playTime;
  }
}