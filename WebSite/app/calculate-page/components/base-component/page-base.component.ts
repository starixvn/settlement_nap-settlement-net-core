import { Component, ElementRef, OnInit } from '@angular/core';
import { ReCheckInService } from '../../../shared/services';
import { ISubscription } from 'rxjs-compat/Subscription';
import { interval } from 'rxjs';
import { FilterQuery, Calculation } from '../../models';

@Component({
    selector: 'page-base',
    template: '',
    providers: [
        ReCheckInService,
    ],
})
export class PageBaseComponent implements OnInit {
    private subscriber: ISubscription;
    private readonly period = 60000;
    public blockUI = false;
    public calculation: Calculation;
    public intervalTimer = interval(this.period);
    constructor(protected reCheckInService: ReCheckInService,
        protected elementRef: ElementRef<HTMLElement>) { }

    ngOnInit(): void {
        this.reCheckIn();
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
