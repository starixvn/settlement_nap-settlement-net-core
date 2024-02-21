import * as _ from 'lodash';
import { Component, Input, OnInit } from "@angular/core";
import { ProviderLog, MatchDetail, ProviderResultLog } from '../../models';
import { UrlHelper } from '../../../helper';

@Component({
    selector: 'provider-result',
    templateUrl: './provider-result.component.html',
})

export class ProviderMatchesComponent{
    @Input() public readonly providerLog: ProviderLog;
}