import { interval } from 'rxjs';
import { ISubscription } from "rxjs/Subscription";
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
    BlockUIService,
    ReCheckInService,
    HttpRequestService,
    MessageBoxService,
    DialogBoxService,
    GenerateFilterService,
    VerifyDateService
} from '../../shared/services';
import { HappyFive } from '../models';
import { QueryService, VerifyBallService, PopupService, BallService } from '../services';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [
        BlockUIService,
        HttpRequestService,
        MessageBoxService,
        QueryService,
        VerifyBallService,
        VerifyDateService,
        ReCheckInService,
        DialogBoxService,
        GenerateFilterService,
        PopupService,
        BallService
    ],
})

export class AppComponent implements OnInit, OnDestroy  {
    private subscriber: ISubscription;
    private readonly period = 60000;
    public blockUI = false;
    public happyFive: HappyFive;
    public fromDate: string;
    public toDate: string;
    public intervallTimer = interval(this.period);
    public change = 0;
    constructor(private readonly blockUIService: BlockUIService,
        private readonly reCheckInService: ReCheckInService) {
    }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.reCheckIn();
    }

    public search($event) {
        this.happyFive = $event.happyFive;
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
    }

    public reloadAction() {
        this.change = this.change + 1;
    }

    private reCheckIn() {
        this.subscriber = this.intervallTimer.subscribe(() => {
                this.reCheckInService.reCheckin();
        });
    }

    public ngOnDestroy() {
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
    }
}