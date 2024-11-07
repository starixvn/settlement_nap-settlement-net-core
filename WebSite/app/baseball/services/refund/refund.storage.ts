import { inject, Injectable, signal } from "@angular/core";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { UrlHelper } from "../../../helper";
import { Match } from "../../models/match.model";
import { AioService } from "../../../shared/services";
import { ResourceNamePipe } from "../../pipes/resource-name.pipe";
import { ResultDetail } from "../../../shared/models/sportsbook-sop/result-detail.model";
import { IntervalBackgroundPipe } from "../../../shared/pipes/interval-background.pipe";
import { isEqual } from "lodash";
import { SettlementStatusId, ResourceIds } from "../../../shared/constants";
@Injectable()

export class RefundStorage {
  private readonly aioService = inject(AioService);
  private readonly resultPipe = inject(ResourceNamePipe);
  private readonly intervalBackgroundPipe = inject(IntervalBackgroundPipe);
  #match = signal<Match>(null);

  match = this.#match.asReadonly();

  async fetchMatch(matchId: number) {
    const sportType = Number(UrlHelper.getUrlParameter('sportType'));
    const matchQuery = {
      matchId,
      apikey: BaseballApiKeys.NormalMatch,
      sportType,
      settleType: "MNL"
    };
    const matchFetched = (await this.aioService.getMatch(matchQuery)) as Match;
    matchFetched.resultDetails.forEach(result => {
      result.resourceName = this.resultPipe.transform(result.resourceId, true,matchFetched.matchDetail.sessionTime);
      result.className = this.getClass(result);
      result.isDisplayedForMember = matchFetched.permission.isLeader || Number(result.settlementStatusId) !== SettlementStatusId.Running;
    });
    this.#match.set(matchFetched);
  }


  getResultChecked = () => this.#match().resultDetails.filter(x => x.checked);

  getResultDetails = () => this.#match().resultDetails.filter(x => x.resourceId !== ResourceIds.totalHits);

  getMatchId = () => this.#match().matchDetail.matchId;

  getClass(resultDetail: ResultDetail) {
    let className = '';

    if (isEqual(resultDetail.resourceId, "00")) {
      className += 'final-score ';
    } else if (isEqual(resultDetail.resourceId, "01")) {
      className += 'ht-score ';
    }

    return className + this.intervalBackgroundPipe.transform(resultDetail.settlementStatusId);
  }
}