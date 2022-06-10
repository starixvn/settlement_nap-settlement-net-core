
import { Component, Input, OnInit } from "@angular/core";
import * as _ from "lodash";
import { UrlHelper } from "../../helper";
import { RequestService } from "../services";
import { MatchDetail } from "../models";
@Component({
  selector: "match-detail",
  templateUrl: "./match-detail.component.html",
})
export class MatchDetailComponent implements OnInit {
  @Input() apiUrl: string;
  public matchDetail: MatchDetail;
  constructor(private readonly requestService: RequestService) {
  }
  public ngOnInit() {
    this.requestService.apiUrl = this.apiUrl;
    const matchId = Number(UrlHelper.getUrlParameter("matchId"));
    this.requestService
    .getMatch(matchId)
    .subscribe((match: MatchDetail) => {
      this.matchDetail = match;
    });
  }
}
