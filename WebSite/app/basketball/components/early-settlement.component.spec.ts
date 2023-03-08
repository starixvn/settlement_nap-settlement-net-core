import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalDialogComponent, ModalContentDialogComponent, ResettleCheckerComponent } from '../../shared/components';
import { EarlySettlementComponent } from './early-settlement.component';
import { EarlyService, BasketballService, VerificationService } from '../services';
import { Match } from '../models';
import { MessageBoxService, HttpRequestService, BlockUIService, AioService } from '../../shared/services';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { Language } from '../../shared/language.native';
import * as _ from 'lodash';
import { ResultSettingModel } from '../../shared/models';
import { MatchDetail, Permission, ResultDetail, ExternalResultDetail } from '../../shared/models/sportsbook-sop';
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ResultStatusPipe } from '../../shared/pipes/result-status.pipe';
import { TicketStatusPipe } from '../../shared/pipes/ticket-status.pipe';
import { ExternalLinkPipe } from '../../score-source-setting/pipes';
import { ResultTypePipe } from '../../shared/pipes/result-type.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

describe('Component: EarlySettlementComponent', () => {
    let component: EarlySettlementComponent;
    let fixture: ComponentFixture<EarlySettlementComponent>;
    let earlyService: EarlyService;
    let aioService: AioService;
    let messageBoxService: MessageBoxService;
    let verificationService: VerificationService;
    let toastrService: ToastrService;
    const buttonName = "btn-danger";
    const errorMessage = "Error message";
    const matchDetail = new MatchDetail();
    matchDetail.playTime = 1;
    matchDetail.matchId = 700000;
    matchDetail.leagueGroupId = 1;
    const match = new Match(matchDetail);
    const resultSettingData = new ResultSettingModel();
    const resultDetail = new ResultDetail();
    resultDetail.resourceId = "6130110";
    resultDetail.map = 0;
    resultDetail.betTypeName = "Test bet type name";
    resultDetail.awayValue = "";
    resultDetail.homeValue = "H";
    resultDetail.resultStatusId = 1;
    resultDetail.settlementStatusId = 4;
    resultDetail.resultSettingData = resultSettingData;
    resultDetail.checked = true;

    match.resultDetails = [resultDetail];
    const permission = new Permission();

    match.permission = permission;
    const successfulResult = {
        errCode: 0,
        errMsg: null,
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

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                EarlySettlementComponent,
                ModalDialogComponent,
                ModalContentDialogComponent,
                ResettleCheckerComponent,
                IntervalBackgroundPipe,
                ExternalSourceNamePipe,
                ExternalLinkPipe,
                ResultStatusPipe,
                TicketStatusPipe,
                ResultTypePipe,
                ResultByTeamNamePipe,
            ],
            providers: [
                HttpRequestService,
                MessageBoxService,
                BlockUIService,
                AioService,
                NgbModal,
                EarlyService,
                BasketballService,
                VerificationService,
                IntervalBackgroundPipe,
                ResultByTeamNamePipe,
                ToastContainerDirective,
                ToastrService
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
                fixture = TestBed.createComponent(EarlySettlementComponent);
                component = fixture.componentInstance;
                earlyService = fixture.debugElement.injector.get(EarlyService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
                aioService = fixture.debugElement.injector.get(AioService);
                verificationService = fixture.debugElement.injector.get(VerificationService);
                toastrService = fixture.debugElement.injector.get(ToastrService);

            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('ngOnInit - should set components properties', () => {
        component.match = match;
        component.init();

        expect(component.matchId).toEqual(match.matchDetail.matchId);
        expect(component.resultDetails).toEqual(match.resultDetails);
    });

    describe('hasNoneOption', () => {
        it('should return true when betType = 600 ', () => {
            const result = component.hasNoneOption('600');

            expect(result).toBe(true);
        });

        it('should set false when betType = 604', () => {
            const result = component.hasNoneOption('604');

            expect(result).toBe(false);
        });
    });

    describe('uncalculate', () => {
        beforeEach(() => {
            component.permission = new Permission();
            resultDetail.resultStatusId = 2;
            resultDetail.checked = true;
            component.resultDetails = [resultDetail];
        });

        it('should call close popup when UnCalculate has been successfully', fakeAsync(() => {
            component.match = match;
            spyOn(aioService, 'push').and.returnValue(of(successfulResult));
            spyOn(messageBoxService, 'closePopup');
            spyOn(toastrService, 'error');

            fixture.detectChanges();
            component.unCalculate();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).not.toHaveBeenCalled();
            expect(messageBoxService.closePopup).toHaveBeenCalled();
        }));

        it('should return error message when unCalculate is unsuccessful', fakeAsync(() => {
            component.match = match;
            spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));
            spyOn(messageBoxService, 'closePopup');
            spyOn(toastrService, 'error');

            fixture.detectChanges();
            component.unCalculate();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
            expect(messageBoxService.closePopup).not.toHaveBeenCalled();
        }));
    });

    describe('refund', () => {
        beforeEach(() => {
            resultDetail.resultSettingData.isConfirmedRefund = true;
            component.permission = new Permission();
            component.resultDetails = [resultDetail];
            component.matchDetail = matchDetail;
        });

        it('should call close popup when have not marked tickets and refund has been successfully', fakeAsync(async () => {

            component.match = match;
            spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
            spyOn(aioService, 'push').and.returnValue(of(successfulResult));
            spyOn(messageBoxService, 'closePopup');
            spyOn(toastrService, 'error');

            fixture.detectChanges();
            await component.refund();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).not.toHaveBeenCalled();
            expect(messageBoxService.closePopup).toHaveBeenCalled();
        }));

        it('should alert when exist marked tickets', fakeAsync(async () => {
            component.match = match;
            spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(existMarkedTicket));
            spyOn(toastrService, 'error');

            fixture.detectChanges();
            await component.refund();

            expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
        }));

        it('should return error message when refund is unsuccessful', fakeAsync(async () => {
            component.match = match;
            spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
            spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));
            spyOn(messageBoxService, 'closePopup');
            spyOn(toastrService, 'error');

            component.init();
            await component.refund();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
            expect(messageBoxService.closePopup).not.toHaveBeenCalled();
        }));

        it("should alert when exist result not confirm", fakeAsync(async () => {
            spyOn(toastrService, 'error');
            resultDetail.resultSettingData.isConfirmedRefund = false;
            component.resultDetails = [resultDetail];
            component.match = match;

            spyOn(messageBoxService, "alert");
            component.match = match;

            await component.refund();

            expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.refundResultNotConfirmed);
        }));
    });

    describe("calculate", () => {
        beforeEach(() => {
            resultDetail.checked = true;
            resultDetail.resourceId = '6130110';
            match.resultDetails = [resultDetail];
            component.resultDetails = [resultDetail];
            component.permission = new Permission();
        });

        it('should alert when pass validation and exist running odds', fakeAsync(() => {
            component.match = match;
            spyOn(earlyService, 'isInValidResultValue').and.returnValue(false);
            spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(unSuccessfulResult));
            spyOn(toastrService, 'error');

            fixture.detectChanges();
            component.calculate();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        }));

        it('should confirm when score settled is changed', fakeAsync(() => {
            const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
            match.resultDetails = resultDetails;
            component.match = match;
            component.isReSettledTickets = false;
            spyOn(messageBoxService, 'confirm');

            spyOn(earlyService, 'isInValidResultValue').and.returnValue(false);
            spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
            spyOn(verificationService, 'allResultsHaveScoreSources').and.returnValue(true);
            spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
            spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(true));
            component.calculate();
            tick();

            expect(messageBoxService.confirm).toHaveBeenCalled();
        }));

        it('Should return correct confirm message', fakeAsync(() => {
            resultDetail.homeValue = 'H';
            const resultDetails: ResultDetail[] = [resultDetail];
            match.resultDetails = resultDetails;
            matchDetail.homeName = 'home';
            match.matchDetail = matchDetail;
            component.match = match;
            component.match.matchDetail = matchDetail;
            component.isReSettledTickets = true;
            spyOn(earlyService, 'isInValidResultValue').and.returnValue(false);
            spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
            spyOn(verificationService, 'allResultsHaveScoreSources').and.returnValue(true);
            spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
            component.calculate();
            tick();

            const expected = Language.CalculationConfirmMessageEarly + "<br/>"
                + `Test bet type name: ${matchDetail.homeName}<br/>`

            expect(component.confirmationDialogMessage.message).toEqual(expected);
        }));

        it('should alert when result is invalid', () => {
            match.resultDetails[0].homeValue = '';
            component.match = match;
            component.permission = new Permission();
            spyOn(toastrService, 'error');

            component.calculate();

            expect(toastrService.error).toHaveBeenCalledWith(Language.sop.nonLeader.blankResult);
        });

        it('should alert when non-leader user calculate with mismatched score', fakeAsync(() => {
            component.match = match;
            component.permission = new Permission();
            spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
            spyOn(earlyService, "isInValidResultValue").and.returnValue(false);
            spyOn(verificationService, 'allResultsHaveScoreSources').and.returnValue(true);
            spyOn(verificationService, 'isExistMismatchScore').and.returnValue(true);
            spyOn(toastrService, 'error');

            component.calculate();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(Language.sop.nonLeader.mismatchedResult);
        }));

        it('Pass all validation and calculation is successful. Should error message is empty and close popup.', () => {
            const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
            match.resultDetails = resultDetails;
            component.match = match;
            spyOn(earlyService, 'isInValidResultValue').and.returnValue(false);
            spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
            spyOn(verificationService, 'allResultsHaveScoreSources').and.returnValue(true);
            spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
            spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
            spyOn(verificationService, 'getChangedScores').and.returnValue([]);
            spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
            spyOn(messageBoxService, 'closePopup');
            spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(true));
            spyOn(aioService, 'push').and.returnValue(of(successfulResult));
            spyOn(toastrService, 'error');

            component.calculate();

            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            expect(toastrService.error).not.toHaveBeenCalled();
        });
    });

    it('saveResult = should show confirm box', () => {
        spyOn(messageBoxService, 'confirm');

        component.saveResult();

        expect(messageBoxService.confirm).toHaveBeenCalled();
        expect(component.confirmationDialogMessage.message).toEqual(Language.eSports.saveScore);
    });

    describe('canSettleResult', () => {
        it('should return true when result is running and score is match and exist inhouse result', () => {
            resultDetail.resultStatus = 'Running';
            spyOn(verificationService, 'isExistInHouseResult').and.returnValue(true);

            const result = component.canSettleResult(resultDetail);

            expect(result).toBe(true);
        });

        it('should return false when result is completed', () => {
            resultDetail.resultStatus = 'Completed';
            spyOn(verificationService, 'isExistInHouseResult').and.returnValue(true);

            const result = component.canSettleResult(resultDetail);

            expect(result).toBe(false);
        });
    });

    it("checkResultIsMatched - should call verify service", () => {
        const result = new ResultDetail();
        spyOn(verificationService, 'isEarlyMismatchedWarning').and.returnValue(true);

        component.checkResultIsMatched(result);

        expect(verificationService.isEarlyMismatchedWarning).toHaveBeenCalled();
        expect(result.isScoreMismatched).toBeTruthy();
    });

    it('autoFillResultOnLoad - should call verify and auto fill services', (() => {
        const homeAway = new ResultDetail();
        homeAway.betType = '9063';
        homeAway.inputType = 4;
        const duration = new ResultDetail();
        duration.betType = '9058';
        duration.inputType = 0;
        const resultDetails = [homeAway, duration];
        component.match = new Match(new MatchDetail());
        component.matchDetail = match.matchDetail;
        spyOn(verificationService, 'autoFillEarlyResult');
        spyOn(verificationService, 'isEarlyMismatchedWarning');

        component.autoFillResultOnLoad(resultDetails);

        expect(component.matchDetail.isSavedScore).toBe(false);
        expect(verificationService.autoFillEarlyResult).toHaveBeenCalled();
        expect(verificationService.isEarlyMismatchedWarning).toHaveBeenCalled();
    }));

});
