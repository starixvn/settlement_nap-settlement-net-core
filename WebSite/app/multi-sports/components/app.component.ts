import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { interval } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
    BlockUIService,
    HttpRequestService,
    MessageBoxService,
    VerifyDateService,
    ReCheckInService,
    DialogBoxService,
    GenerateFilterService,
    SportMatchService,
} from '../../shared/services';
import { MultiSportService, RefreshMatchService, PopupService, DetectChangesService, HandleActionsService, BackGroundService} from '../services';
import { MultiSport, MatchWaitingRequest } from '../models';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [
        VerifyDateService,
        MessageBoxService,
        MultiSportService,
        PopupService,
        GenerateFilterService,
        BlockUIService,
        HttpRequestService,
        NgbActiveModal,
        ReCheckInService,
        RefreshMatchService,
        DialogBoxService,
        DetectChangesService,
        HandleActionsService,
        SportMatchService,
        BackGroundService 
    ],
})
export class AppComponent implements OnInit, OnDestroy {
    private subscriber: ISubscription;
    private readonly period = 60000;
    public blockUI = false;
    public multiSport = new MultiSport();
    public intervalTimer = interval(this.period);
    public request: MatchWaitingRequest;

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

    private reCheckIn() {
        this.subscriber = this.intervalTimer.subscribe(() => {
            this.reCheckInService.reCheckin();
        });
    }

    public search(value: MultiSport) {
        this.multiSport = value;
    }

    public getRequest(request: MatchWaitingRequest) {
        this.request = request;
    }
}