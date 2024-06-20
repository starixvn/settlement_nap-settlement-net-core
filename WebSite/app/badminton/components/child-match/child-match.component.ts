import { Component, Input, OnInit, Output } from "@angular/core";
import { ChildMatch } from "../../models/child-match.model";
import { MatchDetail } from "../../models";
import { ResultStatusId } from "../../../shared/constants";
import * as _ from 'lodash';
import { NgClass } from "@angular/common";
import { ResultPipe } from "../../../shared/pipes/result.pipe";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'tb-child-match',
  templateUrl: './child-match.component.html',
  standalone: true,
  imports: [NgClass,ResultPipe,FormsModule]
})
export class ChildMatchComponent implements OnInit {
  @Input() matches: ChildMatch[]  = [];
  @Input() matchDetail: MatchDetail;
  @Input() showAction = false;
  // @Output() selectMatchEvent = new EventEmitter<number[]>();

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

  ngOnInit(): void {
    // throw new Error("Method not implemented.");
  }
}