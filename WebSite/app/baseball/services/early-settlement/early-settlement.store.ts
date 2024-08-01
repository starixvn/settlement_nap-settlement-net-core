import { inject, Injectable, signal } from "@angular/core";
import { UrlHelper } from "../../../helper";
import { AioService } from "../../../shared/services";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { Match } from "../../models/match.model";
import { ResourceNamePipe } from "../../pipes/resource-name.pipe";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { cloneDeep, isEqual, isNil, uniqBy } from "lodash";
import { GroupMap, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ItemsSelect } from "../../../shared/models";
import { Store } from '../store.service';
import { BackgroundColor, TicketStatusText } from '../../../shared/constants';

@Injectable()
export class EarlySettlementStore implements Store {
  #aioService = inject(AioService);
  #resultPipe = inject(ResourceNamePipe);
  #verificationService = inject(VerificationBaseService);
  #match = signal<Match>(null);
  #disableAction = signal<boolean>(true);
  #mainResults: ResultDetail[];
  #earlyResults: ResultDetail[];
  #earlyOriginalResults: ResultDetail[];
  #groupResultDetail: GroupMap[];
  #actionSubmit = '';
  #resultType = signal<string>("");
  #isReSettledTickets = signal<boolean>(false);
  #ticketStatus = signal<string>("");;
  #resultStatus = signal<string>("");;

  match = this.#match.asReadonly();
  resultType = this.#resultType.asReadonly();
  ticketStatus = this.#ticketStatus.asReadonly();
  resultStatus = this.#resultStatus.asReadonly();
  disableAction = this.#disableAction.asReadonly();
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
    this.#mainResults = matchFetched.resultDetails.filter(x => x.resourceId.length < 5 && isNil(x.betTypeName));
    this.#earlyResults = matchFetched.resultDetails.filter(x => x.resourceId.length > 4 && !isNil(x.betTypeName));
    this.#match.set(matchFetched);
    this.GetInitStatus();
    this.#earlyOriginalResults = cloneDeep(this.#earlyResults);
  }

  private GetInitStatus() {
    this.#mainResults.forEach(x => {
      x.resourceName = this.#resultPipe.transform(x.resourceId, true)
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

  getActionSubmit = () => this.#actionSubmit;

  setActionSubmit = (action: string) => this.#actionSubmit = action;

  isLeader = (): boolean => this.#match().permission.isLeader;

  isScoreDirect = (): boolean => true;

  getMatch = (): Match => this.#match();

  getApplyingHedgeMatch = (): boolean => true;

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
}