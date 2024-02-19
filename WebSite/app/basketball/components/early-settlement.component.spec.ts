import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientModule } from '@angular/common/http';
import { EarlySettlementComponent } from './early-settlement.component';
import { EarlyService, VerificationService } from '../services';
import { Match } from '../models';
import { MessageBoxService, AioService } from '../../shared/services';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { Language } from '../../shared/language.native';
import * as _ from 'lodash';
import { ResultSettingModel } from '../../shared/models';
import { MatchDetail, Permission, ResultDetail } from '../../shared/models/sportsbook-sop';
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ExternalLinkPipe } from '../../score-source-setting/pipes';
import {ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';
import { ResettleCheckerComponent } from '../../shared/components/resettle-checker/resettle-checker.component';
import { PipesModule } from '../../shared/pipes/pipes.module.native';

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
    matchDetail.betStatus =''
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
                ModalDialogComponent,
                ModalContentDialogComponent
            ],
            imports: [
                HttpClientModule,
                PipesModule,
                ToastNoAnimationModule.forRoot(),
                ToastContainerModule,
                ToastrModule.forRoot(),
                EarlySettlementComponent,
                IntervalBackgroundPipe,
                ExternalSourceNamePipe,
                ExternalLinkPipe,
                ResultByTeamNamePipe,
                ResettleCheckerComponent,
            ],
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
                component.initService();

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
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            messageBoxService.closePopup = jest.fn();
            toastrService.error = jest.fn();

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
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
            messageBoxService.closePopup = jest.fn();
            toastrService.error = jest.fn();

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
            aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(noMarkedTicket));
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            messageBoxService.closePopup = jest.fn();
            toastrService.error = jest.fn();

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
            aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(existMarkedTicket));
            toastrService.error = jest.fn();

            fixture.detectChanges();
            await component.refund();

            expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
        }));

        it('should return error message when refund is unsuccessful', fakeAsync(async () => {
            component.match = match;
            aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(noMarkedTicket));
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
            messageBoxService.closePopup = jest.fn();
            toastrService.error = jest.fn();

            component.init();
            await component.refund();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
            expect(messageBoxService.closePopup).not.toHaveBeenCalled();
        }));

        it("should alert when exist result not confirm", fakeAsync(async () => {
            toastrService.error = jest.fn();
            resultDetail.resultSettingData.isConfirmedRefund = false;
            component.resultDetails = [resultDetail];
            component.match = match;

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
            toastrService.error = jest.fn();
        });

        it('should alert when pass validation and exist running odds', fakeAsync(() => {
            component.match = match;
            earlyService.isInValidResultValue = jest.fn().mockReturnValue(false);
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));

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
            messageBoxService.confirm = jest.fn();

            earlyService.isInValidResultValue = jest.fn().mockReturnValue(false);
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.allResultsHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
            aioService.verifyChangedSettledTickets = jest.fn().mockReturnValue(Promise.resolve(true));
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
            earlyService.isInValidResultValue = jest.fn().mockReturnValue(false);
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.allResultsHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
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

            component.calculate();

            expect(toastrService.error).toHaveBeenCalledWith(Language.sop.nonLeader.blankResult);
        });

        it('should alert when non-leader user calculate with mismatched score', fakeAsync(() => {
            component.match = match;
            component.permission = new Permission();
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            earlyService.isInValidResultValue = jest.fn().mockReturnValue(false);
            verificationService.allResultsHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationService.isExistMismatchScore = jest.fn().mockReturnValue(true);

            component.calculate();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(Language.sop.nonLeader.mismatchedResult);
        }));

        it('Pass all validation and calculation is successful. Should error message is empty and close popup.', fakeAsync(async () => {
            const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
            match.resultDetails = resultDetails;
            component.matchDetail = matchDetail;
            component.match = match;
            earlyService.isInValidResultValue = jest.fn().mockReturnValue(false);
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.allResultsHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
            verificationService.getOutsideScores = jest.fn().mockReturnValue([]);
            verificationService.getChangedScores = jest.fn().mockReturnValue([]);
            aioService.saveScore = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            messageBoxService.closePopup = jest.fn();
            aioService.verifyChangedSettledTickets = jest.fn().mockReturnValue(Promise.resolve(false));
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));

            component.calculate();
            flush();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).not.toHaveBeenCalled();
            expect(messageBoxService.closePopup).toBeCalled();
        }));
    });

    it('saveResult = should show confirm box', () => {
        messageBoxService.confirm = jest.fn();

        component.saveResult();

        expect(messageBoxService.confirm).toHaveBeenCalled();
        expect(component.confirmationDialogMessage.message).toEqual(Language.eSports.saveScore);
    });

    describe('canSettleResult', () => {
        it('should return true when result is running and score is match and exist inhouse result', () => {
            resultDetail.resultStatus = 'Running';
            verificationService.isExistInHouseResult = jest.fn().mockReturnValue(true);

            const result = component.canSettleResult(resultDetail);

            expect(result).toBe(true);
        });

        it('should return false when result is completed', () => {
            resultDetail.resultStatus = 'Completed';
            verificationService.isExistInHouseResult = jest.fn().mockReturnValue(true);

            const result = component.canSettleResult(resultDetail);

            expect(result).toBe(false);
        });
    });

    it("checkResultIsMatched - should call verify service", () => {
        const result = new ResultDetail();
        verificationService.isEarlyMismatchedWarning = jest.fn().mockReturnValue(true);

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
        verificationService.autoFillEarlyResult = jest.fn();
        verificationService.isEarlyMismatchedWarning = jest.fn();

        component.autoFillResultOnLoad(resultDetails);

        expect(component.matchDetail.isSavedScore).toBe(false);
        expect(verificationService.autoFillEarlyResult).toHaveBeenCalled();
        expect(verificationService.isEarlyMismatchedWarning).toHaveBeenCalled();
    }));

});
