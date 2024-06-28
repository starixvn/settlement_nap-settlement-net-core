import * as _ from 'lodash';
import { Component, Input } from "@angular/core";
import { ProviderLog } from '../../models';

@Component({
    selector: 'provider-result',
    templateUrl: './provider-result.component.html',
})

export class ProviderMatchesComponent{
    @Input() public readonly providerLog: ProviderLog;
}