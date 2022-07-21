import * as _ from 'lodash';
import { Component, Input, OnInit } from "@angular/core";
import { Match } from '../models';
import { UrlHelper } from '../../helper';

@Component({
    selector: 'matches',
    templateUrl: './matches.component.html',
})

export class MatchesComponent implements OnInit {
    @Input() public readonly matches: Match[];
    @Input() private readonly fromDate: string;
    @Input() private readonly toDate: string;
    public scrollName: string;

    public ngOnInit() {
        this.scrollName = UrlHelper.getUrlParameter('isShowMenu') === "false"
            ? "hide-menu"
            : "show-menu";
    }

    public onCollapsedClick(match: Match) {
        match.collapsed = !match.collapsed;
    }

    public getBackgroundIcon(isCollapsed: boolean) {
        return isCollapsed ? "btn-right-up" : "btn-right";
    }
}