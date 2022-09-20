import { BadmintonApiKeys } from './../../badminton/constants/api-keys.native';
import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalDialogComponent, ModalContentDialogComponent } from '../../shared/components';
import { RefundActionsComponent } from './refund-actions.component';
import { BasketballService, BetStatusService, VerificationService } from '../services';
import { Match, HedgeMatchDetail, VoidBetInfo } from '../models';
import { MessageBoxService, HttpRequestService, BlockUIService, AioService } from '../../shared/services';
import { Language } from '../../shared/language';
import { SettlementStatusId } from '../../shared/constants';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import * as _ from 'lodash';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ScoreBySettlementPipe } from '../../shared/pipes/score-by-settlement.pipe';
import { ResultSettingModel } from '../../shared/models';
import { MatchDetail, Permission, ResultDetail } from '../../shared/models/sportsbook-sop';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

describe('Component: RefundActionsComponent', () => {
    let component: RefundActionsComponent;
    let fixture: ComponentFixture<RefundActionsComponent>;
    let messageBoxService: MessageBoxService;
    let aioService: AioService;
    let toastrService: ToastrService;
    let basketballService: BasketballService;
    const buttonName = "btn-danger";
    const errorMessage = "Error message";
    const successfulResult = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
    };

    const unSuccessfulResult = {
        errCode: 1,
        errMsg: errorMessage,
        isSuccessful: false,
    };

    const noMarkedTicket = {
        isExistMarkedTicket: false,
    };

    const existMarkedTicket = {
        isExistMarkedTicket: true,
    };

    const resultDetail = new ResultDetail();

    resultDetail.resourceId = "Q1";
    resultDetail.map = 0;
    resultDetail.awayValue = "0";
    resultDetail.homeValue = "1";
    resultDetail.resultStatusId = 1;
    resultDetail.betTypeName = "test bet type name";
    resultDetail.resultSettingData = new ResultSettingModel();
    const matchDetail = new MatchDetail();
    matchDetail.playTime = 1;
    matchDetail.matchId = 70000000;
    matchDetail.leagueGroupId = 1;
    const match = new Match(matchDetail);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                RefundActionsComponent,
                ModalDialogComponent,
                ModalContentDialogComponent,
                ResourceNameByIdPipe,
                IntervalBackgroundPipe,
                ScoreBySettlementPipe,
            ],
            providers: [
                HttpRequestService,
                BlockUIService,
                NgbModal,
                BasketballService,
                MessageBoxService,
                AioService,
                IntervalBackgroundPipe,
                BetStatusService,
                ResourceNameByIdPipe,
                VerificationService,
                ResultByTeamNamePipe,
                ToastrService,
            ],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
                ToastNoAnimationModule.forRoot(),
                ToastContainerModule,
                ToastrModule.forRoot()
            ],
        })
            .overrideModule(BrowserDynamicTestingModule, {
                set: {
                    entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
                },
            })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(RefundActionsComponent);
                component = fixture.componentInstance;
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
                aioService = fixture.debugElement.injector.get(AioService);
                toastrService = fixture.debugElement.injector.get(ToastrService);
                basketballService = fixture.debugElement.injector.get(BasketballService);
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    describe('refund', () => {
        beforeEach(() => {
            match.resultDetails = [resultDetail];
            const q2 = _.clone(resultDetail);
            q2.resourceId = "Q2";
            const q3 = _.clone(resultDetail);
            q3.resourceId = "Q3";
            const q4 = _.clone(resultDetail);
            q4.resourceId = "Q4";
            const ht = _.clone(resultDetail);
            ht.resourceId = "01";
            const ft = _.clone(resultDetail);
            ft.resourceId = "00";
            ft.settlementStatusId = SettlementStatusId.Refund;
            match.resultDetails.push(q2);
            match.resultDetails.push(q3);
            match.resultDetails.push(q4);
            match.resultDetails.push(ht);
            match.resultDetails.push(ft);
            component.matchDetail = matchDetail;
            component.resultDetails = match.resultDetails;
        });

        it('should call close popup when have not marked tickets, no hedge match and refund has been successfully', fakeAsync(async () => {
            component.match = match;
            component.applyHedgeMatch = false;
            component.matchDetail = matchDetail;
            spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
            spyOn(aioService, 'push').and.returnValue(of(successfulResult));
            spyOn(messageBoxService, 'closePopup');
            spyOn(aioService, 'getTicketInfo').and.returnValue(of([]));
            spyOn(toastrService, 'error');

            component.refund();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).not.toHaveBeenCalled();
            expect(aioService.push).toHaveBeenCalledTimes(1);
            expect(messageBoxService.closePopup).toHaveBeenCalled();
        }));

        it('should call close popup when have not marked tickets, '
            + 'hedge match and refund has been successfully', fakeAsync(async () => {
                match.hedgeMatchDetail = new HedgeMatchDetail();
                component.applyHedgeMatch = true;
                component.match = match;
                component.matchDetail = matchDetail;
                component.hedgeMatchDetail = new HedgeMatchDetail();
                component.hedgeMatchDetail.matchId = 700000;
                component.permission = new Permission();

                spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
                spyOn(aioService, 'push').and.returnValue(of(successfulResult));
                spyOn(aioService, 'getTicketInfo').and.returnValue(of([]));
                spyOn(messageBoxService, 'closePopup');
                spyOn(toastrService, 'error');


                component.refund();
                tick();
                const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
                buttonYes.click();
                tick();

                expect(toastrService.error).not.toHaveBeenCalled();
                expect(aioService.push).toHaveBeenCalledTimes(2);
                expect(messageBoxService.closePopup).toHaveBeenCalled();
            }));

        it('should alert when exist marked tickets', fakeAsync(async () => {
            component.match = match;
            component.matchDetail = match.matchDetail;
            spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(existMarkedTicket));
            spyOn(toastrService, 'error');

            component.refund();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
        }));

        it('should return error message when result is unsuccessful', fakeAsync(async () => {
            component.match = match;
            component.matchDetail = match.matchDetail;
            spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
            spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));
            spyOn(aioService, 'getTicketInfo').and.returnValue(of([]));
            spyOn(messageBoxService, 'closePopup');
            spyOn(toastrService, 'error');

            component.refund();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
            expect(messageBoxService.closePopup).not.toHaveBeenCalled();
        }));

        it('should call void bet when result is successful and exist ticket ', fakeAsync(async () => {
            component.match = match;
            component.matchDetail = match.matchDetail;
            const voidBetInfo: VoidBetInfo = {
                transId: '123',
                custId: '123'
            };
            spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
            spyOn(aioService, 'push').and.returnValue(of(successfulResult));
            spyOn(aioService, 'getTicketInfo').and.returnValue(of([voidBetInfo]));
            spyOn(aioService, 'voidBet').and.returnValue(of(""));
            spyOn(messageBoxService, 'closePopup');
            spyOn(toastrService, 'error');

            component.refund();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(aioService.voidBet).toHaveBeenCalled();
        }));

        it('should alert when exist result not confirmed', fakeAsync(async () => {
            const result = new ResultDetail();
            result.resultSettingData = new ResultSettingModel();
            result.resultSettingData.isConfirmedRefund = false;
            result.checked = true;
            component.match = match;
            component.matchDetail = match.matchDetail;
            component.resultDetails = [result];
            spyOn(toastrService, 'error');

            component.refund();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith("WARNING! Cannot continue due to selected results are not confirmed to refund. Please confirm refund and try again.");
        }));
    });
    it('init - should set components properties, apply hedge match', () => {
        component.match = match;
        spyOn(basketballService, 'getResultDetail').and.returnValue([]);

        component.init();

        expect(component.matchId).toEqual(match.matchDetail.matchId);
        expect(component.hedgeMatchDetail).toEqual(match.hedgeMatchDetail);
        expect(component.applyHedgeMatch).toBe(true);
    });
});
