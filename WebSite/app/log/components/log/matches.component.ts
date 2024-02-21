import * as _ from 'lodash';
import { Component, Input, OnInit } from "@angular/core";
import { Match } from '../../models';
import { UrlHelper } from '../../../helper';

@Component({
    selector: 'matches',
    templateUrl: './matches.component.html',
})

export class MatchesComponent implements OnInit {
    @Input() public readonly matches: Match[];
    @Input() public readonly fromDate: string;
    @Input() public readonly toDate: string;
    @Input() public readonly isResettleLog: boolean;
     scrollName: string;

     ngOnInit() {
        this.scrollName = UrlHelper.getUrlParameter('isShowMenu') === "false"
            ? "hide-menu"
            : "show-menu";
    }

     onCollapsedClick(match: Match) {
        match.collapsed = !match.collapsed;
    }

     getBackgroundIcon(isCollapsed: boolean) {
        return isCollapsed ? "btn-right-up" : "btn-right";
    }
}