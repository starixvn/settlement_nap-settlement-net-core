import { interval } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NumberGame } from '../models';
import {
    HttpRequestService,
    BlockUIService,
    MessageBoxService,
    VerifyDateService,
    ReCheckInService,
    DialogBoxService
} from '../../shared/services';
import { DatePipe } from '@angular/common';
import { QueryService, PopupService } from '../services';
import { ISubscription } from 'rxjs-compat/Subscription';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [
        DatePipe,
        BlockUIService,
        HttpRequestService,
        MessageBoxService,
        VerifyDateService,
        ReCheckInService,
        DialogBoxService,
        QueryService,
        PopupService
    ]
})

export class AppComponent implements OnInit, OnDestroy  {
    private subscriber: ISubscription;
    private readonly period = 60000;
    public intervallTimer = interval(this.period);
    public fromDate: string;
    public toDate: string;
    public blockUI = false;
    public numberGame: NumberGame;
    constructor(private readonly blockUIService: BlockUIService,
        private readonly reCheckInService: ReCheckInService) {
    }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.reCheckIn();
    }

    public search($event: { numberGame: NumberGame; fromDate: string; toDate: string; }) {
        this.numberGame = $event.numberGame;
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
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