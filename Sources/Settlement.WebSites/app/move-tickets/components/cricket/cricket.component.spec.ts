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
import {
    DatepickerComponent,
    NewMultipleSelectComponent,
    ModalContentDialogComponent,
} from '../../../shared/components';
import { MoveTicketsService } from './move-tickets.service';
import { MaterialModule } from '../../../shared/material-module';
import { of } from 'rxjs';
import { MultiSport, MatchWaitingRequest } from '../../models';
import { IntervalScorePipe } from '../../../shared/pipes/interval-score.pipe';
import { ElementRef } from '@angular/core';

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
                LeagueComponent,
                DatepickerComponent,
                NewMultipleSelectComponent,
                ModalContentDialogComponent,
                IntervalScorePipe,
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
            ],
            providers: [
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

    it('ngOnInit - should start recheckin interval', () => {
        const mockUrl = "http://mock";
        spyOn(blockUIService, 'blockUIEvent').and.returnValue(of(true));

        component.init(mockUrl);

        expect(component.apiUrl).toEqual(mockUrl);
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