import * as _ from 'lodash';
import { Component, Input } from "@angular/core";
import { Match } from '../../models';

@Component({
    selector: 'log-detail',
    templateUrl: './log-detail.component.html',
})

export class LogDetailComponent{
    @Input() public readonly match: Match;

}