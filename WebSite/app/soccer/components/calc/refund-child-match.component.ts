import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import * as _ from "lodash";
import { BackgroundColor, EventStatus } from "../../../shared/constants";
import { ChildMatch, MatchDetailSoccer as MatchDetail } from "./models/match.model";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'refund-child-match',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './refund-child-match.component.html',
})

export class RefundChildMatchComponent implements OnInit {
    @Input() public matchDetail: MatchDetail;
    @Input() public childMatches: ChildMatch[];
    @Output() public readonly childMatchesChecked = new EventEmitter<ChildMatch[]>();
    public collapsed = false;
    ngOnInit() {
        _.forEach(this.childMatches, item => {
            item.eventStatusColor = this.getColor(item);
        });
    }

    public collapse() {
        this.collapsed = !this.collapsed;
    }

    public getColor(childMatch: ChildMatch) {
        if (_.isEqual(childMatch.eventStatus.toLowerCase(), EventStatus.postponed.toLowerCase())) {
            return childMatch.isExistMarkedTicket ? BackgroundColor.yellowBlinking : BackgroundColor.yellow;
        }
        if (_.isEqual(childMatch.eventStatus.toLowerCase(), EventStatus.completed.toLowerCase())) {
            return childMatch.isExistMarkedTicket && !childMatch.isExistRunningTicket ?
                BackgroundColor.whiteBlinking : this.getColorRunningTicket(childMatch);
        }

        if (childMatch.isPending && _.isEqual(childMatch.eventStatus.toLowerCase(), EventStatus.resultPending.toLowerCase())) {
            return childMatch.isExistMarkedTicket ? BackgroundColor.brightYellowBlinking : BackgroundColor.brightYellow;
        }

        return childMatch.isExistMarkedTicket ? BackgroundColor.whiteBlinking : "";
    }

    private getColorRunningTicket(childMatch: ChildMatch) {
        if (childMatch.isExistRunningTicket) {
            return childMatch.isExistMarkedTicket ? BackgroundColor.runningTicketBlinking : BackgroundColor.pink;
        }

        return "";
    }
}