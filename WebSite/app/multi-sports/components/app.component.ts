import { Component, OnInit, OnDestroy, Injector, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from "@angular/common";
import { Subscription } from "rxjs";
import { interval } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
    BlockUIService,
    HttpRequestService,
    MessageBoxService,
    VerifyDateService,
    ReCheckInService,
    DialogBoxService,
    GenerateFilterService
} from '../../shared/services';
import { MultiSportService, RefreshMatchService, PopupService, DetectChangesService, HandleActionsService, BackGroundService, SportMatchService } from '../services';
import { MultiSport } from '../models';
import { FilterComponent } from './filter.component';
import { TableMatchComponent } from './table-match/table-match.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [
        DatePipe,
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
    standalone: true,
    imports: [FilterComponent, TableMatchComponent, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
    private subscriber: Subscription;
    private readonly period = 60000;
    public blockUIService: BlockUIService;
    private reCheckInService: ReCheckInService;
    public blockUI = false;
    public multiSport = new MultiSport();
    public intervalTimer = interval(this.period);
   
    constructor(protected injector: Injector) {
    }

    public ngOnInit() {
        this.blockUIService = this.injector.get(BlockUIService);
        this.reCheckInService = this.injector.get(ReCheckInService);
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
}