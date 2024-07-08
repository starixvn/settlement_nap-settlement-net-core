import { Component, Input,  } from "@angular/core";
import { ChildMatch } from "../../models/child-match.model";
import { MatchDetail } from "../../models";
import { ResultStatusId } from "../../../shared/constants";
import * as _ from 'lodash';
import { NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ScoreChildMatchPipe } from "../../pipes/score-child-match.pipe";

@Component({
  selector: 'tb-child-match',
  templateUrl: './child-match.component.html',
  standalone: true,
  imports: [NgClass,ScoreChildMatchPipe,FormsModule]
})
export class ChildMatchComponent {
  @Input() matches: ChildMatch[]  = [];
  @Input() matchDetail: MatchDetail;
  @Input() showAction = false;
  @Input() isLeader = true;

  public collapse = false;

  public getChildMatchesClass(child: ChildMatch) {
    if (child.isNotConsistent) {
      return "not-consistent";
    } else {
      return child.resultStatusId === ResultStatusId.RunningThree ||
        (child.confirmFT > 0 && !_.isNil(child.betStatus) && !_.isEmpty(child.betStatus)) ? "consistent" : "";
    }
  }
  public collapseChildMatch() {
    this.collapse = !this.collapse;
  }
}