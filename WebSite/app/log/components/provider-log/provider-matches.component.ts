import * as _ from 'lodash';
import { Component, Input, OnInit } from "@angular/core";
import { Match } from '../../models';
import { UrlHelper } from '../../../helper';

@Component({
    selector: 'provider-matches',
    templateUrl: './provider-matches.component.html',
})

export class ProviderMatchesComponent implements OnInit {
    @Input() public readonly matches: Match[];
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