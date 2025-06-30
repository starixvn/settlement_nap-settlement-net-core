import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VerifyDateService, BlockUIService, MessageBoxService, HttpRequestService,
    ReCheckInService, DialogBoxService, SportMatchService, GenerateFilterService } from '../../../shared/services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import {
    CricketComponent,
    FilterComponent,
    LeagueComponent,
} from '.';
import { MoveTicketsService } from './move-tickets.service';
import { MaterialModule } from '../../../shared/material-module';
import { MultiSport, MatchWaitingRequest } from '../../models';
import { IntervalScorePipe } from '../../../shared/pipes/interval-score.pipe';
import { ElementRef } from '@angular/core';
import { NewMultipleSelectComponent } from '../../../shared/components/multiple-select/multiple-select.component';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { DatePipe } from '@angular/common';

describe('MoveTickets - CricketComponent', () => {
    let component: CricketComponent;
    let fixture: ComponentFixture<CricketComponent>;
    let blockUIService: BlockUIService;
    let elementRef: ElementRef<HTMLElement>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                CricketComponent,
                FilterComponent,
                LeagueComponent
            ],
            imports: [
                IntervalScorePipe,
                DatepickerComponent,
                NewMultipleSelectComponent,
                ModalContentDialogComponent,
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule
            ],
            providers: [
                DatePipe,
                VerifyDateService,
                MessageBoxService,
                GenerateFilterService,
                BlockUIService,
                HttpRequestService,
                NgbActiveModal,
                ReCheckInService,
                DialogBoxService,
                SportMatchService,
                MoveTicketsService,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(CricketComponent);
                component = fixture.componentInstance;
                blockUIService = fixture.debugElement.injector.get(BlockUIService);
                elementRef = fixture.debugElement.injector.get(ElementRef);
            });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('search - should set multi sport', () => {
        const multiSport = new MultiSport();

        component.search(multiSport);

        expect(component.multiSport).toEqual(multiSport);
    });

    it('getRequest - should set request', () => {
        const request = new MatchWaitingRequest('', '', '' , '');

        component.getRequest(request);

        expect(component.request).toEqual(request);
    });
});