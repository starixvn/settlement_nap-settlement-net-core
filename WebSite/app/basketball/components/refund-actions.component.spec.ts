import { CashOutService } from './../services/cash-out.service';
import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientModule } from '@angular/common/http';
import { RefundActionsComponent } from './refund-actions.component';
import { BasketballService, VerificationService } from '../services';
import { Match, HedgeMatchDetail, VoidBetInfo } from '../models';
import { MessageBoxService, AioService } from '../../shared/services';
import { Language } from '../../shared/language.native';
import { ResultStatusId, SettlementStatusId } from '../../shared/constants';
import { ResultSettingModel } from '../../shared/models';
import { ExternalResult, ExternalResultDetail, MatchDetail, Permission, ResultDetail } from '../../shared/models/sportsbook-sop';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import * as _ from 'lodash';

describe('Component: RefundActionsComponent', () => {
    let component: RefundActionsComponent;
    let fixture: ComponentFixture<RefundActionsComponent>;
    let messageBoxService: MessageBoxService;
    let aioService: AioService;
    let toastrService: ToastrService;
    let basketballService: BasketballService;
    let cashOutService: CashOutService;
    let verificationService: VerificationService;
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
    const permission = new Permission();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                ModalDialogComponent,
                ModalContentDialogComponent,
            ],
            imports: [
                HttpClientModule,
                ToastNoAnimationModule.forRoot(),
                ToastContainerModule,
                ToastrModule.forRoot(),
                RefundActionsComponent
            ],
        }).overrideModule(BrowserDynamicTestingModule, {
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
                cashOutService = fixture.debugElement.injector.get(CashOutService);
                verificationService = fixture.debugElement.injector.get(VerificationService);
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
            aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(noMarkedTicket));
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            messageBoxService.closePopup = jest.fn();
            cashOutService.getTicketInfo = jest.fn().mockReturnValue(Promise.resolve([]));
            toastrService.error = jest.fn();

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

                aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(noMarkedTicket));
                aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
                cashOutService.getTicketInfo = jest.fn().mockReturnValue(Promise.resolve([]));
                messageBoxService.closePopup = jest.fn();
                toastrService.error = jest.fn();


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
            aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(existMarkedTicket));
            toastrService.error = jest.fn();

            component.refund();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
        }));

        it('should alert when result mismatch with result confirmed', fakeAsync(async () => {
            component.match = match;
            component.isSDTSettle = true;
            resultDetail.resourceId = '01';
            resultDetail.checked = true;
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '2';
            const secondResult = { ...resultDetail, resourceId: '02' };
            const externalResult = new ExternalResultDetail(99, '01', '', '', '1', '2');
            const secondExternalResult = { ...externalResult, resouceId: '02', homeValue: '', awayValue: '' }
            component.resourceConfirmedSdt = [externalResult, secondExternalResult]
            component.resultDetails = [resultDetail, secondResult]
            toastrService.error = jest.fn();

            component.refund();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.sdtErrorMessage);
        }));

        it('should return error message when result is unsuccessful', fakeAsync(async () => {
            component.match = match;
            component.matchDetail = match.matchDetail;
            aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(noMarkedTicket));
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
            cashOutService.getTicketInfo = jest.fn().mockReturnValue(Promise.resolve([]));
            messageBoxService.closePopup = jest.fn();
            toastrService.error = jest.fn();

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
            aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(noMarkedTicket));
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            cashOutService.getTicketInfo = jest.fn().mockReturnValue(Promise.resolve([voidBetInfo]));
            cashOutService.voidBet = jest.fn().mockReturnValue(Promise.resolve(""));
            messageBoxService.closePopup = jest.fn();
            toastrService.error = jest.fn();

            component.refund();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(cashOutService.voidBet).toHaveBeenCalled();
        }));

        it('should alert when exist result not confirmed', fakeAsync(async () => {
            const result = new ResultDetail();
            result.resultSettingData = new ResultSettingModel();
            result.resultSettingData.isConfirmedRefund = false;
            result.checked = true;
            component.match = match;
            component.matchDetail = match.matchDetail;
            component.resultDetails = [result];
            toastrService.error = jest.fn();

            component.refund();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith("WARNING! Cannot continue due to selected results are not confirmed to refund. Please confirm refund and try again.");
        }));
    });
    describe('Init', () => {
        beforeEach(() => {
            match.externalResults = [new ExternalResult(99, [])];
            match.permission = permission;
            match.hedgeMatchDetail = new HedgeMatchDetail();
            component.permission = permission;
            component.match = match;
            basketballService.getResourceExternalRefund = jest.fn();
        });

        it('should set components properties, apply hedge match', () => {
            basketballService.getResultDetail = jest.fn().mockReturnValue([]);
            verificationService.isTicketOnQuarter = jest.fn().mockReturnValue(false);

            component.init();

            expect(component.matchId).toEqual(match.matchDetail.matchId);
            expect(component.hedgeMatchDetail).toEqual(match.hedgeMatchDetail);
            expect(component.applyHedgeMatch).toBeTruthy();
            expect(component.isDirectly).toBeFalsy()
            expect(verificationService.isTicketOnQuarter).toHaveBeenCalled();
            expect(basketballService.getResourceExternalRefund).toHaveBeenCalled();
        });

        it('should turn on SDT when exist result confirmed SDT', () => {
            component.permission.isLeader = true;
            const resultSettingData = new ResultSettingModel();
            resultSettingData.isConfirmedRefundSdt = true;
            resultDetail.resultSettingData = resultSettingData;

            basketballService.getResultDetail = jest.fn().mockReturnValue([resultDetail]);
            component.init();


            expect(component.isSDTSettle).toBeTruthy();
        });

        it('should turn on SDT when exist result calculated', () => {
            component.permission.isLeader = true;
            resultDetail.resultStatusId = ResultStatusId.AutoCompleted;

            basketballService.getResultDetail = jest.fn().mockReturnValue([resultDetail]);
            component.init();


            expect(component.isSDTSettle).toBeTruthy();
        });

        it('should turn off SDT when exist result calculated but exist result confirm refund normal ', () => {
            component.permission.isLeader = true;
            resultDetail.resultStatusId = ResultStatusId.AutoCompleted;
            const resultSettingData = new ResultSettingModel();
            resultSettingData.isConfirmedRefund = true;
            resultDetail.resultSettingData = resultSettingData;

            basketballService.getResultDetail = jest.fn().mockReturnValue([resultDetail]);
            component.init();


            expect(component.isSDTSettle).toBeFalsy();
        });
    });

    it('changeScore - should clear score result behind result has inputted', () => {
        const resultDetail1 = { resourceId: '01', awayValue: "1", homeValue: "2" } as ResultDetail;
        const resultDetail2 = { ...resultDetail1, resourceId: '02' };
        const resultDetail3 = { ...resultDetail1, resourceId: '03' };

        component.resultDetails = [resultDetail1, resultDetail2, resultDetail3]

        component.changeScore(resultDetail2);

        expect(component.resultDetails[0].awayValue).toBe("1");
        expect(component.resultDetails[0].homeValue).toBe("2");
        expect(component.resultDetails[1].awayValue).toBe("1");
        expect(component.resultDetails[1].homeValue).toBe("2");
        expect(component.resultDetails[2].awayValue).toBe("");
        expect(component.resultDetails[2].homeValue).toBe("");
    });

    describe('inputDirectly', () => {
        it('should disable quarter and enable HT & FT for both input & select when select settle directly and SDT', () => {
            component.isDirectly = true;
            component.isSDTSettle = true;
            const ht = { resourceId: '01', awayValue: "1", homeValue: "2", checked: true } as ResultDetail;
            const ft = { ...ht, resourceId: '00' };
            const resultDetail2 = { ...ht, resourceId: '02' };
            const resultDetail3 = { ...ht, resourceId: '06' };

            component.resultDetails = [ht, ft, resultDetail2, resultDetail3];
            component.resultDetailDisableInput = new Array(component.resultDetails.length).fill(true);
            component.inputDirectly();

            expect(component.resultDetails.map(i => i.disabled)).toEqual([undefined, undefined, true, true]);
            expect(component.resultDetailDisableInput).toEqual([false, false, true, true]);
        });

        it('Status input and select correct for FT,HT and quarter when select settle directly and not SDT', () => {
            component.isDirectly = true;
            component.isSDTSettle = false;
            const ht = { resourceId: '01', awayValue: "1", homeValue: "2", checked: true } as ResultDetail;
            const ft = { ...ht, resourceId: '00' };
            const resultDetail2 = { ...ht, resourceId: '02' };
            const resultDetail3 = { ...ht, resourceId: '06' };

            component.resultDetails = [ht, ft, resultDetail2, resultDetail3];
            component.resultDetailDisableInput = new Array(component.resultDetails.length).fill(true);
            component.inputDirectly();

            expect(component.resultDetails.map(i => i.disabled)).toEqual([undefined, undefined, true, true]);
            expect(component.resultDetailDisableInput).toEqual([true, true, true, true]);
        });
    });



    describe('selectFullTimeCheckBox', () => {
        beforeEach(() => {
            component.resultDetails = [{ ...resultDetail, resourceId: '00', checked: true }, { ...resultDetail, resourceId: 'OT' }];
        });

        it('should set overTime checked to fullTime checked when isSDTSettle is true and isDirectly is false', () => {
            component.isSDTSettle = true;
            component.isDirectly = false;

            component.selectFullTimeCheckBox();

            expect(component.overTimeResult.checked).toBe(component.fullTimeResult.checked);
        });

        it('should set overTimeResult.checked to false when isSDTSettle is false or isDirectly is true', () => {
            component.isSDTSettle = false;
            component.isDirectly = true;

            component.selectFullTimeCheckBox();

            expect(component.overTimeResult.checked).toBe(false);
        });
    });

    describe('enableInput - should return correct status of input text box', () => {

        beforeEach(() => {
            const ht = { resourceId: '01', awayValue: "1", homeValue: "2", checked: true } as ResultDetail;
            const ft = { ...ht, resourceId: '00' };
            const resultDetail1 = { ...ht, resourceId: '02' };
            const OT = { ...ht, resourceId: '06' };
            component.resultDetails = [ht, ft, resultDetail1, OT];
            component.resultDetailDisableInput = new Array(component.resultDetails.length).fill(true);
        })
        it('When not pass result specifically and not is SDT ', () =>{
            component.isSDTSettle = false;

            component.enableInput();

            expect(component.resultDetailDisableInput.every(i => i)).toBeTruthy();
        });

        it('When not pass result specifically and SDT ', () =>{
            component.isSDTSettle = true;

            component.enableInput();

            expect(component.resultDetailDisableInput.map(i => i)).toEqual([true, true, false, false]);
        });

        it('When not pass result specifically and SDT ON and directly ON ', () =>{
            component.isSDTSettle = true;
            component.isDirectly = true;

            component.enableInput();

            expect(component.resultDetailDisableInput.map(i => i)).toEqual([false, false, true, true]);
        });

        it('When pass result specifically and SDT ON and directly ON', () =>{
            component.isSDTSettle = true;
            component.isDirectly = true;

            component.enableInput(component.resultDetails[2]);

            expect(component.resultDetailDisableInput[2]).toBeTruthy();
        });

        it('When pass result specifically and result is fulltime and SDT ON and directly ON', () =>{
            component.isSDTSettle = true;
            component.isDirectly = true;

            component.enableInput(component.resultDetails[3], true);

            expect(component.resultDetailDisableInput[1]).toBeFalsy();
            expect(component.resultDetailDisableInput[3]).toBeTruthy();
        });

        it('When pass result specifically and result is fulltime and SDT ON and directly off', () =>{
            component.isSDTSettle = true;
            component.isDirectly = false;

            component.enableInput(component.resultDetails[3], true);

            expect(component.resultDetailDisableInput[1]).toBeTruthy();
            expect(component.resultDetailDisableInput[3]).toBeTruthy();
        });
    });
});
