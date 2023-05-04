import * as _ from 'lodash';
import { Component, Input, OnInit } from "@angular/core";
import { Match } from '../../models';
import { UrlHelper } from '../../../helper';

@Component({
    selector: 'log-detail',
    templateUrl: './log-detail.component.html',
})

export class LogDetailComponent{
    @Input() public readonly match: Match;

}