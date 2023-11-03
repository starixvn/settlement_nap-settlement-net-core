import { Component, Input } from "@angular/core";
import { MatchDetail } from "../../models";
import { ResultDetail } from "../../../bet-builder/models";

@Component({
  templateUrl:"./match-info.compoment.html",
  selector: 'match-info'
})
export class MatchInfoCompoment {
  @Input() matchDetail: MatchDetail;
  @Input() resultDetails: ResultDetail[] = [];
  @Input() showResultDetails: boolean = false;
}