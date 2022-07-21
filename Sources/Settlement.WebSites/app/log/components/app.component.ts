import { interval } from 'rxjs';
import { ISubscription } from "rxjs/Subscription";
import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
    BlockUIService,
    HttpRequestService,
    MessageBoxService,
    VerifyDateService,
    ReCheckInService,
} from '../../shared/services';
import { SearchService } from '../services';
import { Match } from '../models';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [
        SearchService,
        VerifyDateService,
        MessageBoxService,
        BlockUIService,
        HttpRequestService,
        ReCheckInService,
        NgbActiveModal],
})

export class AppComponent implements OnInit, OnDestroy {
    public blockUI = false;
    public fromDate: string;
    public toDate: string;
    public matchCode: string;
    public matches: Match[];
    private subscriber: ISubscription;
    private readonly period = 60000;
    public intervallTimer = interval(this.period);
    public apiUrl: string;
    constructor(
        private readonly elementRef: ElementRef<HTMLElement>,
        private readonly blockUIService: BlockUIService,
        private readonly reCheckInService: ReCheckInService) {
    }

    public ngOnInit() {
        this.apiUrl = this.elementRef.nativeElement.getAttribute('api-url');
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.reCheckIn();
    }

    public ngOnDestroy() {
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
    }

    public search($event) {
        this.matches = $event.match;
        this.matchCode = $event.matchCode;
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
    }

    private reCheckIn() {
        this.subscriber = this.intervallTimer.subscribe(() => {
                this.reCheckInService.reCheckin();
        });
    }
}