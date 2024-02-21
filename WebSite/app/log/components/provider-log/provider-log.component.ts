import { interval } from 'rxjs';
import { ISubscription } from "rxjs-compat/Subscription";
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BlockUIService, ReCheckInService} from '../../../shared/services';
import { ProviderLog } from '../../models';
import * as _ from 'lodash';

@Component({
    selector: 'app-root',
    templateUrl: './provider-log.component.html',
})

export class ProviderLogComponent implements OnInit, OnDestroy {
    public blockUI = false;
    public providerLog: ProviderLog;
    private subscriber: ISubscription;
    private readonly period = 60000;
    public intervalTimer = interval(this.period);
    constructor(
        private readonly blockUIService: BlockUIService,
        private readonly reCheckInService: ReCheckInService) {
    }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.reCheckIn();
    }

    public ngOnDestroy() {
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
    }

    public getProviderResult($event) {
        this.providerLog = $event;
    }

    private reCheckIn() {
        this.subscriber = this.intervalTimer.subscribe(() => {
            this.reCheckInService.reCheckin();
        });
    }
}