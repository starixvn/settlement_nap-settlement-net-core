import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from "@angular/core";
import { CalculationActionsComponent } from './calculation-actions.component';
import { BasketballService, BetStatusService, VerificationService, CashOutService } from '../services';
import { MessageBoxService, AioService } from '../../shared/services';
import { ModalDialogComponent } from "../../shared/components/modal-dialog/modal-dialog.component";
import { Match, HedgeMatchDetail, VoidBetInfo } from '../models';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import { ResultSettingModel } from '../../shared/models';
import { MatchDetail, Permission, ResultDetail, ExternalResultDetail } from '../../shared/models/sportsbook-sop';
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResourcesIds } from '../constants';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { Language } from '../../shared/language.native';
import { TicketCountComponent } from '../../shared/components/ticket-count/ticket-count.component';
import { ResettleCheckerComponent } from '../../shared/components/resettle-checker/resettle-checker.component';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';

describe('Basketball - Calculation Actions Component', () => {
    let component: CalculationActionsComponent;
    let fixture: ComponentFixture<CalculationActionsComponent>;
    let basketballService: BasketballService;
    let messageBoxService: MessageBoxService;
    let verificationService: VerificationService;
    let aioService: AioService;
    let betStatusService: BetStatusService;
    let toastrService: ToastrService;
    let cashOutService: CashOutService;
    const resultDetail = new ResultDetail();
    resultDetail.resourceId = ResourcesIds.quarter1;
    resultDetail.ticketStatus = null;
    resultDetail.betType = null;
    resultDetail.betTypeName = 'test bet type name';
    resultDetail.homeValue = '0';
    resultDetail.awayValue = '1';
    resultDetail.resultStatusId = 0;
    resultDetail.checked = true;
    resultDetail.resultSettingData = new ResultSettingModel();
    resultDetail.externalScores = [new ExternalResultDetail(1, 'M1', ''), new ExternalResultDetail(0, 'M1', '')];

    const originalResultDetail = new ResultDetail();
    originalResultDetail.resourceId = ResourcesIds.quarter1;
    originalResultDetail.externalScores = [new ExternalResultDetail(1001, 'M1', ''), new ExternalResultDetail(0, 'M1', '')];

    const matchDetail = new MatchDetail();
    matchDetail.matchId = 1;
    const match = new Match(matchDetail);
    match.permission = new Permission();
    match.originalResultDetail = [originalResultDetail];
    const externalResult = new ExternalResultDetail(1, '01', '');
    const externalResultHalfTime = new ExternalResultDetail(1, '01', '');
    const externalResultFullTime = new ExternalResultDetail(1, '00', '');

    const buttonName = "btn-danger";
    const errorMessage = "Error message";
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

    const halfTime = new ResultDetail();
    const fullTime = new ResultDetail();
    const OTime = new ResultDetail();
    halfTime.resourceId = ResourcesIds.htScore;
    fullTime.resourceId = ResourcesIds.finalScore;
    OTime.resourceId = ResourcesIds.ot;

    class MockElementRef implements ElementRef {
        nativeElement = {};
    }

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
                ResourceNameByIdPipe,
                ExternalSourceNamePipe,
                TicketCountComponent,
                ResettleCheckerComponent,
                CalculationActionsComponent
            ]
        })
            .overrideModule(BrowserDynamicTestingModule, {
                set: {
                    entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
                },
            })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(CalculationActionsComponent);
                component = fixture.componentInstance;
                basketballService = fixture.debugElement.injector.get(BasketballService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
                aioService = fixture.debugElement.injector.get(AioService);
                verificationService = fixture.debugElement.injector.get(VerificationService);
                betStatusService = fixture.debugElement.injector.get(BetStatusService);
                toastrService = fixture.debugElement.injector.get(ToastrService);
                cashOutService = fixture.debugElement.injector.get(CashOutService);
                component.initService();
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('selectedResources - return resource checked', () => {
        const resultOne = new ResultDetail();
        const resultTwo = new ResultDetail();
        resultOne.checked = true;

        component.resultDetails = [resultOne, resultTwo];

        expect(component.selectedResources.length).toBe(1);
    });

    it('firstHalf - return firstHalf', () => {
        const resultTwo = new ResultDetail();

        component.resultDetails = [halfTime, resultTwo];

        expect(component.firstHalf.resourceId).toBe(ResourcesIds.htScore);
    });

    it('fullTime - return fullTime', () => {
        const resultTwo = new ResultDetail();

        component.resultDetails = [fullTime, resultTwo];

        expect(component.fullTime.resourceId).toBe(ResourcesIds.finalScore);
    });

    it('firstHalfResults - return first Half Results', () => {
        const resultOne = new ResultDetail();
        const resultThree = new ResultDetail();
        resultOne.resourceId = ResourcesIds.quarter1;
        resultThree.resourceId = ResourcesIds.quarter3;

        component.resultDetails = [resultOne, resultThree];

        expect(component.firstHalfResults.length).toBe(1);
    });

    it('quarterResults - return quarter Results', () => {
        const resultOne = new ResultDetail();
        resultOne.resourceId = ResourcesIds.quarter1;

        component.resultDetails = [resultOne, fullTime];

        expect(component.quarterResults.length).toBe(1);
    });

    it('quartersWithoutOverTime - return Results', () => {
        const resultOne = new ResultDetail();
        resultOne.resourceId = ResourcesIds.quarter1;
        component.resultDetails = [resultOne, fullTime, OTime];

        expect(component.quartersWithoutOverTime.length).toBe(1);
    });

    it('quartersWithoutOverTime - return overTime ', () => {
        const resultOne = new ResultDetail();
        resultOne.resourceId = ResourcesIds.quarter1;

        component.resultDetails = [resultOne, fullTime, OTime];

        expect(component.overTime.resourceId).toEqual(ResourcesIds.ot);
    });

    it('autoFillScoreOnLoad - should auto fill games and final', () => {
        resultDetail.homeValue = '1';
        resultDetail.awayValue = '1';
        fullTime.homeValue = '1';
        fullTime.awayValue = '1';
        match.resultDetails = [resultDetail, fullTime, halfTime];
        component.match = match;
        component.resultDetails = match.resultDetails;
        verificationService.isMismatchedWarning = jest.fn().mockReturnValue(false);
        verificationService.autoFillScore = jest.fn().mockReturnValue(true);

        component.autoFillScoreOnLoad([resultDetail, fullTime]);

        expect(fullTime.isScoreMismatched).toBe(false);
    });

    describe('updateOutside', () => {
        beforeEach(() => {
            externalResult.homeValue = '1';
            externalResult.awayValue = '2';
            const setTwo = new ResultDetail();
            setTwo.resourceId = 'Q2';
            setTwo.externalScores = [externalResult]
            const setThree = new ResultDetail();
            setThree.resourceId = 'Q3';
            setThree.externalScores = [externalResult]
            const setFour = new ResultDetail();
            setFour.resourceId = 'Q4';
            setFour.externalScores = [externalResult]
            resultDetail.externalScores = [externalResult];
            halfTime.externalScores = [externalResult, externalResult, externalResult, externalResultHalfTime];
            fullTime.externalScores = [externalResult, externalResult, externalResult, externalResultFullTime];
            match.resultDetails = [resultDetail, setTwo, setThree, setFour, halfTime, fullTime];
            match.isScoreDirect = false;
            component.resultDetails = match.resultDetails;
            component.match = match;
        });

        it('update blank outSide source for total games when score is Consecutive.', () => {
            verificationService.isScoreConsecutive = jest.fn().mockReturnValue(false);

            component.autofillOutsideSource(1);

            expect(externalResultHalfTime.homeValue).toEqual('');
            expect(externalResultHalfTime.awayValue).toEqual('');
            expect(externalResultFullTime.awayValue).toEqual('');
            expect(externalResultFullTime.homeValue).toEqual('');
        });

        it('update correct outSide source for total games.', () => {
            verificationService.isScoreConsecutive = jest.fn().mockReturnValue(true);
            verificationService.isMismatchedWarning = jest.fn().mockReturnValue(false);

            component.autofillOutsideSource(1);

            expect(externalResultHalfTime.homeValue).toEqual('2');
            expect(externalResultHalfTime.awayValue).toEqual('4');
            expect(externalResultFullTime.awayValue).toEqual('8');
            expect(externalResultFullTime.homeValue).toEqual('4');
            expect(component.fullTime.isScoreMismatched).toEqual(false);
        });
    });
    it('verifyAndAutoFillScore - should verify and auto fill score', () => {
        fullTime.homeValue = '1';
        fullTime.awayValue = '1';
        match.resultDetails = [fullTime, halfTime];
        component.match = match;
        component.match.matchDetail = matchDetail;
        component.resultDetails = match.resultDetails;
        verificationService.isMismatchedWarning = jest.fn().mockReturnValue(false);
        verificationService.autoFillScore = jest.fn();
        basketballService.getExternalResults = jest.fn().mockReturnValue([]);

        component.verifyAndAutoFillScore(fullTime);

        expect(fullTime.isScoreMismatched).toBe(false);
    });

    describe('getClass', () => {
        it('return not consistent class', () => {
            component.match = match;
            component.match.isScoreDirect = true;
            verificationService.isFtScoreLowerThanHtScore = jest.fn().mockReturnValue(true);
            verificationService.isFullTimeMismatched = jest.fn().mockReturnValue(true);
            basketballService.getIntervalBackground = jest.fn().mockReturnValue("class");

            const actual = component.getClass(halfTime);

            expect(actual).toEqual("not-consistent class");

        });

        it('return mismatched  class', () => {
            component.match = match;
            component.match.isScoreDirect = true;
            verificationService.isFtScoreLowerThanHtScore = jest.fn().mockReturnValue(false);
            verificationService.isFullTimeMismatched = jest.fn().mockReturnValue(true);
            basketballService.getIntervalBackground = jest.fn().mockReturnValue("class");

            const actual = component.getClass(halfTime);

            expect(actual).toEqual("col-mismatched class");
        });
    });

    describe('isFinalScoreDisabled', () => {
        it('should return false for leader score direct fulltime', () => {
            component.isLeader = true;
            component.match = match;
            component.match.isScoreDirect = true;

            const result = component.isFinalScoreDisabled(fullTime.resourceId);

            expect(result).toBe(false);
        });

        it('should return true for leader score direct on quarters', () => {
            component.isLeader = true;
            component.match = match;
            component.match.isScoreDirect = true;

            const result = component.isFinalScoreDisabled(resultDetail.resourceId);

            expect(result).toBe(true);
        });

        it('should return true for non-leader', () => {
            component.isLeader = false;

            const result = component.isFinalScoreDisabled(resultDetail.resourceId);

            expect(result).toBe(true);
        });
    });

    it("isFullTimeMismatched - call service", () => {
        component.match = match;
        component.match.isScoreDirect = true;
        verificationService.isFullTimeMismatched = jest.fn();

        component.isFullTimeMismatched();

        expect(verificationService.isFullTimeMismatched).toHaveBeenCalled();
    });

    describe("getmatch", () => {
        it("should true for hedgeMatch and enableUncalculate", async () => {
            match.resultDetails = [fullTime, halfTime, OTime]
            match.hedgeMatchDetail = new HedgeMatchDetail();
            basketballService.getResultDetail = jest.fn().mockReturnValue(match.resultDetails);
            basketballService.isDisabledUndoButton = jest.fn().mockReturnValue(true);
            aioService.getMatch = jest.fn().mockReturnValue(Promise.resolve(match));

            await component.getMatch(12345);

            expect(component.applyHedgeMatch).toBe(true);
            expect(component.isDisabledUndo).toBe(true);
        });

        it("should call initial functions", async () => {
            match.resultDetails = [fullTime, halfTime, OTime]
            basketballService.getResultDetail = jest.fn().mockReturnValue(match.resultDetails);
            verificationService.generateExternalScores = jest.fn();
            aioService.getMatch = jest.fn().mockReturnValue(Promise.resolve(match))

            await component.getMatch(12345);

            expect(basketballService.getResultDetail).toHaveBeenCalled();
            expect(verificationService.generateExternalScores).toHaveBeenCalled();
        });
    });

    describe("changeScore", () => {
        beforeEach(() => {
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '1';
            const quarterTwo = new ResultDetail();
            quarterTwo.resourceId = ResourcesIds.quarter2
            quarterTwo.homeValue = '1';
            quarterTwo.awayValue = '1';
            const quarterThree = new ResultDetail();
            quarterThree.resourceId = ResourcesIds.quarter3
            quarterThree.homeValue = '1';
            quarterThree.awayValue = '2';
            const quarterFour = new ResultDetail();
            quarterFour.resourceId = ResourcesIds.quarter4
            quarterFour.homeValue = '1';
            quarterFour.awayValue = '2';
            halfTime.homeValue = '';
            halfTime.awayValue = '';
            fullTime.homeValue = '';
            fullTime.awayValue = '';
            component.resultDetails = [resultDetail, quarterTwo, quarterThree, quarterFour, fullTime, halfTime]
            component.match = match;
            component.match.isScoreDirect = false;
        });

        it("return correct fulltime halftime score", () => {
            verificationService.isScoreConsecutive = jest.fn().mockReturnValue(true);
            verificationService.isMismatchedWarning = jest.fn().mockReturnValue(false);
            component.changeScore(resultDetail);

            expect(resultDetail.isScoreMismatched).toBeFalsy();
            expect(halfTime.homeValue).toEqual('2');
            expect(halfTime.awayValue).toEqual('2');
            expect(fullTime.homeValue).toEqual("4");
            expect(fullTime.awayValue).toEqual("6");
        });
    });

    describe('isErrorOnVerification', () => {
        it("should return true when have not input value", () => {
            match.isClickOnCalculate = true;
            component.match = match;
            component.match.isScoreDirect = false;
            resultDetail.checked = true;

            const isError = component.isErrorOnVerification(resultDetail, "", "");
            expect(isError).toBe(true);
        });

        it("should return false when result is Fulltime and score directly is unchecked", () => {
            match.isClickOnCalculate = true;
            component.match = match;
            component.match.isScoreDirect = false;
            resultDetail.checked = true;

            const isError = component.isErrorOnVerification(fullTime, "", "");
            expect(isError).toBe(false);
        });
    });

    it("onResettleCheckboxChange - should change resettle status", () => {
        component.onResettleCheckboxChange(true);
        expect(component.isReSettledTickets).toBe(true);
    });

    describe("disableTextBox", () => {
        it("should return true when result is Fulltime and score directly is unchecked", () => {
            component.match = match;
            component.match.isScoreDirect = false;

            const actual = component.disableTextBox(ResourcesIds.finalScore);

            expect(actual).toBe(true);
        });

        it("should return false when result is Fulltime and score directly is unchecked", () => {
            component.match = match;
            component.match.isScoreDirect = true;

            const actual = component.disableTextBox(ResourcesIds.finalScore);

            expect(actual).toBe(false);
        });
    });


    describe("selectedOnMap", () => {
        it('should verifyScore when selected on half time ', () => {
            component.match = match;
            halfTime.checked = true;
            verificationService.verifyScore = jest.fn();

            component.selectedOnMap(halfTime);

            expect(component.match.isClickOnCalculate).toBe(false);
            expect(verificationService.verifyScore).toHaveBeenCalled();
        });

        it('should verifyScore when selected on full time ', () => {
            match.isScoreDirect = true;
            component.match = match;
            component.resultDetails = [fullTime, OTime]
            fullTime.checked = true;
            OTime.checked = false;
            verificationService.verifyScore = jest.fn();

            component.selectedOnMap(fullTime);

            expect(component.match.isClickOnCalculate).toBe(false);
            expect(verificationService.verifyScore).toHaveBeenCalled();
            expect(OTime.checked).toBeFalsy();
        });
    });

    it('saveScore - should push successfully when user confirm save score', fakeAsync(() => {
        component.resultDetails = [fullTime, resultDetail];
        component.matchDetail = matchDetail;
        aioService.saveScore = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
        verificationService.getChangedScores = jest.fn().mockReturnValue([]);
        verificationService.getOutsideScores = jest.fn().mockReturnValue([]);
        component.match = match;

        component.saveScore();
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(aioService.saveScore).toHaveBeenCalled();
    }));

    it('changeInputDirectly - should check final map only', () => {
        match.resultDetails = [fullTime, resultDetail];
        component.match = match;
        component.match.isScoreDirect = true;
        component.resultDetails = match.resultDetails;

        component.changeInputDirectly();

        expect(resultDetail.checked).toBeFalsy();
    });

    it("getTextBoxClass - return correct value", () => {
        expect(component.getTextBoxClass(ResourcesIds.finalScore)).toEqual("final-score-input");
        expect(component.getTextBoxClass(ResourcesIds.htScore)).toEqual("ht-score-input");
        expect(component.getTextBoxClass(ResourcesIds.quarter1)).toEqual("quarter-input");
    });

    it("getTextBoxMaxLength - return correct value", () => {
        expect(component.getTextBoxMaxLength(ResourcesIds.finalScore)).toEqual(3);
        expect(component.getTextBoxMaxLength(ResourcesIds.quarter1)).toEqual(2);
    });

    describe("calculate", () => {
        beforeEach(() => {
            messageBoxService.closePopup = jest.fn();
            toastrService.error = jest.fn();
        })
        it('should alert when fail to verify selected maps and score', fakeAsync(() => {
            component.match = match;
            component.resultDetails = [];
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));

            component.calculate();
            tick();

            expect(toastrService.error).toHaveBeenCalled();
        }));

        it('should push twice and save score when all verifications passed', fakeAsync(() => {
            component.match = match;
            component.matchDetail = matchDetail;
            resultDetail.checked = true;
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '1';
            component.resultDetails = [resultDetail];
            component.match.hedgeMatchDetail = new HedgeMatchDetail();
            component.match.hedgeMatchDetail.matchId = 12345;
            component.isLeader = true;
            component.applyHedgeMatch = true;
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.isInputScoreInvalid = jest.fn().mockReturnValue(false);
            verificationService.verifyIntervalsCalculated = jest.fn().mockReturnValue(false);
            verificationService.isFtScoreLowerThanHtScore = jest.fn().mockReturnValue(false);
            verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
            betStatusService.getBetStatus = jest.fn().mockReturnValue("");
            verificationService.getOutsideScores = jest.fn().mockReturnValue([]);
            verificationService.getChangedScores = jest.fn().mockReturnValue([]);
            cashOutService.getTicketInfo = jest.fn().mockReturnValue(Promise.resolve([]));
            aioService.saveScore = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            aioService.verifyChangedSettledTickets = jest.fn().mockReturnValue(Promise.resolve(false));
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));

            component.calculate();
            tick();
            let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(aioService.push).toHaveBeenCalledTimes(2);
            expect(aioService.saveScore).toHaveBeenCalled();
        }));

        it('should generate determine type when setting SDT On', fakeAsync(() => {
            component.match = match;
            matchDetail.autoSetting = 2;
            component.matchDetail = matchDetail;
            component.isLeader = true;
            component.applyHedgeMatch = false;
            component.isReSettledTickets = true;
            component.resultDetails = [resultDetail];
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.isInputScoreInvalid = jest.fn().mockReturnValue(false);
            verificationService.verifyIntervalsCalculated = jest.fn().mockReturnValue(false);
            verificationService.isFtScoreLowerThanHtScore = jest.fn().mockReturnValue(false);
            verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
            betStatusService.getBetStatus = jest.fn().mockReturnValue("");
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            
            verificationService.getOutsideScores = jest.fn().mockReturnValue([]);
            verificationService.getChangedScores = jest.fn().mockReturnValue([]);
            cashOutService.getTicketInfo = jest.fn().mockReturnValue(Promise.resolve([]));
            aioService.saveScore = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            aioService.generateDeterminedType = jest.fn();

            component.calculate();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(aioService.generateDeterminedType).toHaveBeenCalled();
        }));

        it('should not push hedge match when not apply for hedge match', fakeAsync(() => {
            component.match = match;
            component.matchDetail = matchDetail;
            component.match.resultDetails = [new ResultDetail()];
            component.isLeader = true;
            component.applyHedgeMatch = false;
            component.resultDetails = [resultDetail];
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.isInputScoreInvalid = jest.fn().mockReturnValue(false);
            verificationService.verifyIntervalsCalculated = jest.fn().mockReturnValue(false);
            verificationService.isFtScoreLowerThanHtScore = jest.fn().mockReturnValue(false);
            verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
            betStatusService.getBetStatus = jest.fn().mockReturnValue("");
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.getOutsideScores = jest.fn().mockReturnValue([]);
            verificationService.getChangedScores = jest.fn().mockReturnValue([]);
            cashOutService.getTicketInfo = jest.fn().mockReturnValue(Promise.resolve([]));
            aioService.saveScore = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            aioService.verifyChangedSettledTickets = jest.fn().mockReturnValue(Promise.resolve(false));

            component.calculate();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(aioService.push).toHaveBeenCalledTimes(1);
        }));

        it('should set error message when calculate unsuccessfully', fakeAsync(() => {
            component.match = match;
            component.matchDetail = matchDetail;
            component.isLeader = true;
            component.applyHedgeMatch = false;
            component.isReSettledTickets = true;
            component.resultDetails = [resultDetail];
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.isInputScoreInvalid = jest.fn().mockReturnValue(false);
            verificationService.verifyIntervalsCalculated = jest.fn().mockReturnValue(false);
            verificationService.isFtScoreLowerThanHtScore = jest.fn().mockReturnValue(false);
            verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
            betStatusService.getBetStatus = jest.fn().mockReturnValue("");
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
            verificationService.getOutsideScores = jest.fn().mockReturnValue([]);
            verificationService.getChangedScores = jest.fn().mockReturnValue([]);
            cashOutService.getTicketInfo = jest.fn().mockReturnValue(Promise.resolve([]));
            aioService.saveScore = jest.fn().mockReturnValue(Promise.resolve(successfulResult));

            component.calculate();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
        }));

        it('should call void bet  when calculate successfully and match exist ticket need to void', fakeAsync(() => {
            component.match = match;
            component.matchDetail = matchDetail;
            component.isLeader = true;
            component.applyHedgeMatch = false;
            component.isReSettledTickets = true;
            component.resultDetails = [resultDetail];
            const voidBetInfo: VoidBetInfo = {
                transId: '123',
                custId: '123'
            };
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.isInputScoreInvalid = jest.fn().mockReturnValue(false);
            verificationService.verifyIntervalsCalculated = jest.fn().mockReturnValue(false);
            verificationService.isFtScoreLowerThanHtScore = jest.fn().mockReturnValue(false);
            verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
            betStatusService.getBetStatus = jest.fn().mockReturnValue("");
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.getOutsideScores = jest.fn().mockReturnValue([]);
            verificationService.getChangedScores = jest.fn().mockReturnValue([]);
            cashOutService.getTicketInfo = jest.fn().mockReturnValue(Promise.resolve([voidBetInfo]));
            cashOutService.voidBet = jest.fn().mockReturnValue(Promise.resolve(""));
            aioService.saveScore = jest.fn().mockReturnValue(Promise.resolve(successfulResult));

            component.calculate();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(cashOutService.voidBet).toHaveBeenCalled();
        }));

        it('should set error message when save score unsuccessfully', fakeAsync(() => {
            component.match = match;
            component.matchDetail = matchDetail;
            component.isLeader = true;
            component.applyHedgeMatch = false;
            component.isReSettledTickets = true;
            component.resultDetails = [resultDetail];
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.isInputScoreInvalid = jest.fn().mockReturnValue(false);
            verificationService.verifyIntervalsCalculated = jest.fn().mockReturnValue(false);
            verificationService.isFtScoreLowerThanHtScore = jest.fn().mockReturnValue(false);
            verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
            betStatusService.getBetStatus = jest.fn().mockReturnValue("");
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.getOutsideScores = jest.fn().mockReturnValue([]);
            verificationService.getChangedScores = jest.fn().mockReturnValue([]);
            aioService.saveScore = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));

            component.calculate();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
        }));

        it('should alert when missing score source for maps and user is not leader', fakeAsync(() => {
            component.match = match;
            component.matchDetail = matchDetail;
            component.match.resultDetails = [new ResultDetail()];
            component.isLeader = false;
            component.isReSettledTickets = true;
            component.resultDetails = [resultDetail];
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.isInputScoreInvalid = jest.fn().mockReturnValue(false);
            verificationService.verifyIntervalsCalculated = jest.fn().mockReturnValue(false);
            verificationService.isFtScoreLowerThanHtScore = jest.fn().mockReturnValue(false);
            verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(false);

            component.calculate();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(Language.eSports.nonLeader.insufficientSources);
        }));

        it('should alert when score is mismatch and user is not leader', fakeAsync(() => {
            component.match = match;
            component.matchDetail = matchDetail;
            component.match.resultDetails = [new ResultDetail()];
            component.isLeader = false;
            component.isReSettledTickets = true;
            component.resultDetails = [resultDetail];
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            verificationService.isInputScoreInvalid = jest.fn().mockReturnValue(false);
            verificationService.verifyIntervalsCalculated = jest.fn().mockReturnValue(false);
            verificationService.isFtScoreLowerThanHtScore = jest.fn().mockReturnValue(false);
            verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
            verificationService.isExistMismatchScore = jest.fn().mockReturnValue(true);

            component.calculate();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(Language.eSports.nonLeader.mismatchedScore);
        }));

        it('should alert when pass validation and exist running odds', fakeAsync(() => {
            component.match = match;
            component.matchDetail = matchDetail;
            component.match.resultDetails = [new ResultDetail()];
            component.isLeader = false;
            component.resultDetails = [resultDetail];
            aioService.verifyNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
            verificationService.isInputScoreInvalid = jest.fn().mockReturnValue(false);
            verificationService.verifyIntervalsCalculated = jest.fn().mockReturnValue(false);
            verificationService.isFtScoreLowerThanHtScore = jest.fn().mockReturnValue(false);

            component.calculate();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        }));

        it('should alert when exist result confirmed', fakeAsync(() => {
            const result = new ResultDetail();
            result.resultSettingData = new ResultSettingModel();
            result.resultSettingData.isConfirmedRefund = true;
            result.checked = true;
            component.match = match;
            component.match.resultDetails = [result];
            component.resultDetails = [result];

            component.calculate();

            expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.calculateResultNotConfirmed);
        }));
    });

    describe("uncalculate", () => {
        it("Pass all validation and uncalculation is successful." +
            "Should error message is empty and  close popup.",
            fakeAsync(() => {
                fullTime.checked = true;
                component.resultDetails = [fullTime];
                component.match = match;
                component.matchDetail = matchDetail;
                aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
                cashOutService.getTicketInfo = jest.fn().mockReturnValue(Promise.resolve([]));
                cashOutService.voidBet = jest.fn().mockReturnValue(Promise.resolve(""));
                betStatusService.getBetStatus = jest.fn().mockReturnValue("");
                messageBoxService.closePopup = jest.fn();
                toastrService.error = jest.fn();

                component.uncalculate();

                const buttonYes = document.getElementsByClassName(
                    buttonName
                )[0] as HTMLElement;
                buttonYes.click();
                tick();


                expect(toastrService.error).not.toHaveBeenCalled();
                expect(messageBoxService.closePopup).toHaveBeenCalled();
            }));

        it("call void bet when match exist ticket valid", fakeAsync(() => {
            fullTime.checked = true;
            component.resultDetails = [fullTime];
            component.match = match;
            component.matchDetail = matchDetail;
            const voidBetInfo: VoidBetInfo = {
                transId: '123',
                custId: '123'
            };
            aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
            cashOutService.getTicketInfo = jest.fn().mockReturnValue(Promise.resolve([voidBetInfo]));
            cashOutService.voidBet = jest.fn().mockReturnValue(Promise.resolve(""));
            betStatusService.getBetStatus = jest.fn().mockReturnValue("");
            messageBoxService.closePopup = jest.fn();

            component.uncalculate();

            const buttonYes = document.getElementsByClassName(
                buttonName
            )[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(cashOutService.voidBet).toHaveBeenCalled();
        }));

        it(
            "Pass all validation and uncalculation is unsuccessful." +
            "Should return an error.",
            fakeAsync(() => {
                component.resultDetails = [fullTime];
                component.match = match;
                component.matchDetail = matchDetail;
                betStatusService.getBetStatus = jest.fn().mockReturnValue("");
                cashOutService.getTicketInfo = jest.fn().mockReturnValue(Promise.resolve([]));
                aioService.push = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
                toastrService.error = jest.fn();

                component.uncalculate();

                const buttonYes = document.getElementsByClassName(
                    buttonName
                )[0] as HTMLElement;
                buttonYes.click();
                tick();
                expect(toastrService.error).toHaveBeenCalledWith(errorMessage);

            }));
    });
});