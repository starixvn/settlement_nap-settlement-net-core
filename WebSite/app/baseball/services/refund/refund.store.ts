import { inject, Injectable, signal } from "@angular/core";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { UrlHelper } from "../../../helper";
import { Match } from "../../models/match.model";
import { AioService } from "../../../shared/services";
import { ResourceNamePipe } from "../../pipes/resource-name.pipe";

@Injectable() 

export class RefundStore {
  private aioService = inject(AioService);
  private resultPipe = inject(ResourceNamePipe);
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
      result.resourceName = this.resultPipe.transform(result.resourceId, true);
    });
    this.#match.set(matchFetched);
  }


  getResultChecked = () => this.#match().resultDetails.filter(x => x.checked);

  getMatchId = () => this.#match().matchDetail.matchId;
}