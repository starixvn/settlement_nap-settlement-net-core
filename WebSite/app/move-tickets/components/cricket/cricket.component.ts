import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISubscription } from "rxjs-compat/Subscription";
import { interval } from 'rxjs';
import {
    BlockUIService,
    ReCheckInService,
} from '../../../shared/services';
import { MultiSport, MatchWaitingRequest } from '../../models';

@Component({
    selector: 'cricket',
    templateUrl: './cricket.component.html',
})
export class CricketComponent implements OnInit, OnDestroy {
    public blockUI = false;
    public multiSport = new MultiSport();
    public request: MatchWaitingRequest;
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

    public search(value: MultiSport) {
        console.log(value);
        this.multiSport = value;
    }

    public getRequest(request: MatchWaitingRequest) {
        console.log(request);
        this.request = request;
    }

    private reCheckIn() {
        this.subscriber = this.intervalTimer.subscribe(() => {
            this.reCheckInService.reCheckin();
        });
    }

    public ngOnDestroy() {
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
    }
}