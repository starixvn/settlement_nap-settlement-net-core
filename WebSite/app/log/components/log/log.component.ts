import { interval } from 'rxjs';
import { ISubscription } from "rxjs-compat/Subscription";
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
    BlockUIService,
    ReCheckInService,
} from '../../../shared/services';
import { Match } from '../../models';
import * as _ from 'lodash';
import { ResettleType } from '../../constants/log-Type';

@Component({
    selector: 'app-root',
    templateUrl: './log.component.html'
})

export class LogComponent implements OnInit, OnDestroy {
    public blockUI = false;
    public fromDate: string;
    public toDate: string;
    public matchCode: string;
    public isResettleLog: boolean
    public matches: Match[];
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

    public search($event) {
        this.matchCode = $event.matchCode;
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        this.isResettleLog = _.isEqual($event.productType, ResettleType);
    }

    public getMatch($event) {
        this.matches = $event;
    }

    private reCheckIn() {
        this.subscriber = this.intervalTimer.subscribe(() => {
                this.reCheckInService.reCheckin();
        });
    }
}