import { Component, ComponentRef, ElementRef, OnInit } from '@angular/core';
import { ReCheckInService } from '../../../shared/services';
import { ISubscription } from 'rxjs-compat/Subscription';
import { interval } from 'rxjs';
import { FilterQuery, Matches } from '../../models';

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
    public matches: Matches;
    public intervalTimer = interval(this.period);
    public rootApi: string;
    public filterQuery: FilterQuery;
    constructor(protected reCheckInService: ReCheckInService,
        protected elementRef: ElementRef<HTMLElement>) { }

    ngOnInit(): void {
        this.reCheckIn();
    }

    public search($event) {
        this.matches = $event.matches;
        this.filterQuery = $event.filterQuery;
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
