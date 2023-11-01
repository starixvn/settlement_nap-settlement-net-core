import { Component, Input } from "@angular/core";
import { MatchDetail } from "../../models";

@Component({
  templateUrl:"./match-info.compoment.html"
})
export class MatchInfoCompoment {
  @Input() matchDetail: MatchDetail;
}