import { EarlySettlementComponent } from './early-settlement.component';
import { TestBed, waitForAsync, fakeAsync, ComponentFixture, tick } from '@angular/core/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ResultDetail, GroupMap } from '../../models';
import { Match } from './models';
import {
    VerifyCalculateService, VerifyRefundService,
    GroupBetTypeService, AutoFillService, PenaltyShootoutService,
    PenaltyWoodWorkService,
    HelperService
} from './services';
import { GroupNameByIdPipe } from '../../pipes/group-name-by-id.pipe';
import {
    MessageBoxService,
    HttpRequestService,
    BlockUIService,
    ClosePopupService,
    AioService,
} from '../../../shared/services';
import { FormsModule } from '@angular/forms';
import { ResultStatusId, SettlementStatusId } from '../../../shared/constants';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { 
    ModalDialogComponent,
    ResettleCheckerComponent,
    TicketCountComponent,
    ModalContentDialogComponent
} from "../../../shared/components";
import { HttpClientModule } from '@angular/common/http';
import {
    BetTypes,
    GoalMethod,
    TimeGoal,
    ScoreMiss,
    ScoreMissNotTaken,
    HitNotHit,
    OneXTwo,
    BothOneNeither,
    YesNo,
    ResultValue
} from '../../constants';
import { Language } from '../../../shared/language.native';
import { ResultSettingModel } from '../../../shared/models';
import { MatchDetailComponent } from './match-detail.component';
import { ScoreBySettlementPipe } from '../../../shared/pipes/score-by-settlement.pipe';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

describe('Soccer - EarlySettlementComponent', () => {
    let component: EarlySettlementComponent;
    let fixture: ComponentFixture<EarlySettlementComponent>;
    let closePopupService: ClosePopupService;
    let messageBoxService: MessageBoxService;
    let verifyCalculateService: VerifyCalculateService;
    let autoFillService: AutoFillService;
    let penaltyShootoutService: PenaltyShootoutService;
    let penaltyWoodWorkService: PenaltyWoodWorkService;
    let helperService: HelperService;
    let toastrService: ToastrService;
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
    const existMarkedTicket = {
        isExistMarkedTicket: true,
    };
    const noMarkedTicket = {
        isExistMarkedTicket: false,
    };
    const matchDetail = {
        matchId: 0,
        matchCode: null,
        leagueName: "Expect",
        kickOffTime: null,
        homeId: null,
        homeName: null,
        awayName: null,
        playTime: null,
        goalRecord: null,
        goalIcon: {
            homeGoal: null,
            awayGoal: null,
            halfTimeHomeGoal: null,
            halfTimeAwayGoal: null,
        },
        childMatchType: null,
        halfTimeAwayScore: null,
        halfTimeHomeScore: null,
        finalAwayScore: null,
        finalHomeScore: null
    };

    const resultSettingData = new ResultSettingModel();
    const resultDetail: ResultDetail = {
        resourceId: "M1",
        ticketStatus: "",
        map: 0,
        betType: "",
        betTypeName: "",
        awayValue: "",
        homeValue: "",
        resultStatusId: 1,
        settlementStatusId: 0,
        resultStatus: "",
        checked: false,
        isResultWarning: null,
        isHomeValueWarning: null,
        isInvalidSelectedProceed: null,
        isInvalidValue: null,
        isNotExistedValue: null,
        isNotTaken: null,
        isSettleDetermined: null,
        isAwayValueWarning: null,
        resultSettingData,
    };

    beforeEach(waitForAsync(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    EarlySettlementComponent,
                    ModalDialogComponent,
                    ModalContentDialogComponent,
                    ResettleCheckerComponent,
                    GroupNameByIdPipe,
                    MatchDetailComponent,
                    TicketCountComponent,
                    ScoreBySettlementPipe],
                providers: [
                    HttpClientModule,
                    AioService,
                    MessageBoxService,
                    ClosePopupService,
                    VerifyCalculateService,
                    VerifyRefundService,
                    GroupBetTypeService,
                    AutoFillService,
                    PenaltyShootoutService,
                    PenaltyWoodWorkService,
                    BlockUIService,
                    HttpRequestService,
                    NgbModal,
                    HelperService,
                    ToastContainerDirective,
                    ToastrService,
                ],
                imports: [
                    FormsModule,
                    HttpClientModule,
                    NgbModule,
                    ToastNoAnimationModule.forRoot(),
                    ToastContainerModule,
                    ToastrModule.forRoot()
                ],
            })
            .compileComponents().then(() => {
                fixture = TestBed.createComponent(EarlySettlementComponent);
                component = fixture.componentInstance;
                const match = new Match();
                const permission = {
                    canCalculate: true,
                    canUncalculate: false,
                    canRefund: false,
                    canUncalculateInstant: false
                };
                match.matchDetail = matchDetail;
                match.resultDetail = [resultDetail];
                match.permission = permission;
                component.match = match;
                fixture.detectChanges();
                verifyCalculateService = fixture.debugElement.injector.get(VerifyCalculateService);
                closePopupService = fixture.debugElement.injector.get(ClosePopupService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);   
                autoFillService = fixture.debugElement.injector.get(AutoFillService);
                penaltyShootoutService = fixture.debugElement.injector.get(PenaltyShootoutService);
                penaltyWoodWorkService = fixture.debugElement.injector.get(PenaltyWoodWorkService);
                helperService = fixture.debugElement.injector.get(HelperService);
                toastrService = fixture.debugElement.injector.get(ToastrService);
                spyOn(toastrService, 'clear');
                spyOn(toastrService, 'error');
            });
    }));

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });

    it('getMatch - should get match information', async () => {
        const match = new Match();
        matchDetail.matchId = 12345;
        match.matchDetail = matchDetail;
        match.resultDetail = [resultDetail];
        spyOn(helperService, 'getMatch').and.returnValue(of(match));
        await component.getMatch(12345);
        expect(component.match.matchDetail.matchId).toEqual(12345);
    });

    it(`When match have value -> resultDetails have value`, () => {
        expect(component.resultDetails.length).toEqual(1);
    });

    it(`When match have value -> permission have value`, () => {
        expect(component.permission.canCalculate).toBe(true);
    });

    it(`Should return true when resultStatusId = AutoCompleted or ManualCompleted`, () => {
        expect(component.isCompleted(ResultStatusId.AutoCompleted, 0)).toBe(true);
        expect(component.isCompleted(ResultStatusId.ManualCompleted, SettlementStatusId.Calculated)).toBe(true);
    });

    it(`Should return true when resultStatusId = ManualCompleted and'
    + ' settlementStatusId = Refund or RefundSettleDetermined`, () => {
        expect(component.isRefunded(ResultStatusId.ManualCompleted, SettlementStatusId.Refund)).toBe(true);
        expect(component.isRefunded(ResultStatusId.ManualCompleted,
            SettlementStatusId.RefundSettleDetermined)).toBe(true);
    });
    it('Should checked/unchecked result detail item like group map', () => {
        const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
        const map = new GroupMap(1, resultDetails);
        map.checked = true;
        const match = new Match();
        match.resultDetail = resultDetails;
        component.match = match;
        component.onChangeGroupMap(map);

        resultDetail.checked = true;
        const expectedResultDetails: ResultDetail[] = [resultDetail, resultDetail];
        const expectedMap = new GroupMap(1, expectedResultDetails);
        expectedMap.checked = true;

        expect(map).toEqual(expectedMap);
    });

    describe('calculate', () => {
        it('should show right comfirm message when score is changed.', fakeAsync(async() => {
            const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
            const match = new Match();
            match.matchDetail = matchDetail;
            match.resultDetail = resultDetails;
            component.match = match;
            component.isReSettledTickets = false;
            spyOn(helperService, 'checkingStatus').and.returnValue(of(successfulResult));
            spyOn(verifyCalculateService, 'verifyInputValue').and.returnValue("");
            spyOn(verifyCalculateService, 'verifyPenaltyBettypeBeforeCalculation').and.returnValue("");
            spyOn(verifyCalculateService, 'verifyCornerBettypeBeforeCalculation').and.returnValue("");
            spyOn(helperService, 'getLastestMatchResult').and.returnValue(of(resultDetails));
            spyOn(verifyCalculateService, 'isChangedScore').and.returnValue(true);
            spyOn(messageBoxService, 'confirm');

            await component.calculate();
            expect(component.confirmationDialogMessage.message).toEqual(Language.recalculateNotification);
        }));

        it('should show error message when checkingStatus is failed', fakeAsync(async() => {
            const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
            const match = new Match();
            match.matchDetail = matchDetail;
            match.resultDetail = resultDetails;
            component.match = match;
            spyOn(helperService, 'checkingStatus').and.returnValue(of(unSuccessfulResult));
            await component.calculate();

            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        }));

        it('should show error message when input empty value', fakeAsync( async() => {
            const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
            const match = new Match();
            match.resultDetail = resultDetails;
            match.matchDetail = matchDetail;
            component.match = match;
            spyOn(helperService, 'checkingStatus').and.returnValue(of(successfulResult));
            spyOn(verifyCalculateService, 'verifyInputValue').and.returnValue(errorMessage);
            await component.calculate();
            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        }));

        it('should show error message when have an error with penalty bettype ', fakeAsync( async() => {
            const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
            const match = new Match();
            match.resultDetail = resultDetails;
            match.matchDetail = matchDetail;
            component.match = match;
            spyOn(helperService, 'checkingStatus').and.returnValue(of(successfulResult));
            spyOn(verifyCalculateService, 'verifyInputValue').and.returnValue("");
            spyOn(verifyCalculateService, 'verifyPenaltyBettypeBeforeCalculation').and.returnValue(errorMessage);
            await component.calculate();
            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        }));

        it('should show error message when have an error with corner bettype ', fakeAsync( async() => {
            const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
            const match = new Match();
            match.resultDetail = resultDetails;
            match.matchDetail = matchDetail;
            component.match = match;
            spyOn(helperService, 'checkingStatus').and.returnValue(of(successfulResult));
            spyOn(verifyCalculateService, 'verifyInputValue').and.returnValue("");
            spyOn(verifyCalculateService, 'verifyPenaltyBettypeBeforeCalculation').and.returnValue("");
            spyOn(verifyCalculateService, 'verifyCornerBettypeBeforeCalculation').and.returnValue(errorMessage);
            await component.calculate();
            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        }));
    });

    describe('uncalculate', () => {
        const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
        const match = new Match();
        match.resultDetail = resultDetails;

        it('should pass all validation and success', fakeAsync(() => {
            component.match = match;
            resultDetail.checked = true;
            resultDetail.resultStatusId = ResultStatusId.RunningOne;
            spyOn(helperService, 'settle').and.returnValue(of(successfulResult));
            spyOn(closePopupService, 'closePopup');

            component.unCalculate();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.confirmationDialogMessage.message).toEqual(Language.UnCalculationConfirmMessageEarly2);
            expect(toastrService.error).not.toHaveBeenCalled();
        }));

        it('should pass all validation but unsuccess', fakeAsync(() => {
            component.match = match;
            resultDetail.checked = true;
            resultDetail.resultStatusId = ResultStatusId.AutoCompleted;
            spyOn(helperService, 'settle').and.returnValue(of(unSuccessfulResult));

            component.unCalculate();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.confirmationDialogMessage.message).toEqual(Language.UnCalculationConfirmMessageEarly1);
            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        }));
    });

    describe('refund', () => {
        resultDetail.checked = true;
        const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
        const match = new Match();
        match.resultDetail = resultDetails;
        match.matchDetail = matchDetail;

        it('should pass all validation and refund successfully', fakeAsync(async() => {
            component.match = match;
            spyOn(helperService, 'checkingStatus').and.returnValue(of(successfulResult));
            spyOn(helperService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
            spyOn(verifyCalculateService, 'verifyPenaltyBettypeBeforeRefund').and.returnValue("");

            spyOn(helperService, 'settle').and.returnValue(of(successfulResult));
            spyOn(closePopupService, 'closePopup');

            await component.refund();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.confirmationDialogMessage.message).toEqual(Language.RefundConfirmMessageEarly);
            expect(toastrService.error).not.toHaveBeenCalled();
        }));

        it('should pass all validation but refund unsuccessfully', fakeAsync(async() => {
            component.match = match;
            spyOn(helperService, 'checkingStatus').and.returnValue(of(successfulResult));
            spyOn(helperService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
            spyOn(helperService, 'settle').and.returnValue(of(unSuccessfulResult));

            await component.refund();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        }));

        it('should show error message when checkingStatus is failed.', fakeAsync(async() => {
            component.match = match;
            spyOn(helperService, 'checkingStatus').and.returnValue(of(unSuccessfulResult));
            await component.refund();

            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        }));

        it('should show error message when there are marked tickets', fakeAsync(async() => {
            component.match = match;
            spyOn(helperService, 'checkingStatus').and.returnValue(of(successfulResult));
            spyOn(helperService, 'checkMarkedTickets').and.returnValue(of(existMarkedTicket));

            await component.refund();

            expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
        }));

        it('should show error message when there are not marked tickets but an error penalty', fakeAsync(async() => {
            component.match = match;
            spyOn(helperService, 'checkingStatus').and.returnValue(of(successfulResult));
            spyOn(helperService, 'checkMarkedTickets').and.returnValue(of(noMarkedTicket));
            spyOn(verifyCalculateService, 'verifyPenaltyBettypeBeforeRefund').and.returnValue(errorMessage);

            await component.refund();

            expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        }));
    });

    describe('getListResult', () => {
        let betType: string;
        let roundId = 0;

        it('should return goal method', () => {
            betType = BetTypes.ExtraTimeNextGoalMethod;

            const result = component.getListResult(betType, roundId);

            expect(result).toEqual(GoalMethod);
        });

        it('should return time goal', () => {
            betType = BetTypes.TimeOfFirstGoal;

            const result = component.getListResult(betType, roundId);

            expect(result).toEqual(TimeGoal);
        });

        it('should return score miss', () => {
            betType = BetTypes.HomePenaltyShootout;
            roundId = 6;

            const result = component.getListResult(betType, roundId);

            expect(result).toEqual(ScoreMiss);
        });

        it('should return score miss not taken', () => {
            betType = BetTypes.HomePenaltyShootout;
            roundId = 1;

            const result = component.getListResult(betType, roundId);

            expect(result).toEqual(ScoreMissNotTaken);
        });

        it('should return penalty woodwork', () => {
            betType = BetTypes.PenaltyWoodwork;

            const result = component.getListResult(betType, roundId);

            expect(result).toEqual(HitNotHit);
        });

        it('should return one x two', () => {
            betType = BetTypes.PenaltyShootout1X2;

            const result = component.getListResult(betType, roundId);

            expect(result).toEqual(OneXTwo);
        });

        it('should return both one neither', () => {
            betType = BetTypes.PenaltyShootoutBothOneNeither;

            const result = component.getListResult(betType, roundId);

            expect(result).toEqual(BothOneNeither);
        });

        it('should return yes no', () => {
            betType = BetTypes.PenaltyShootoutSuddenDead;

            const result = component.getListResult(betType, roundId);

            expect(result).toEqual(YesNo);
        });

        it('should return list is empty', () => {
            betType = "00";

            const result = component.getListResult(betType, roundId);

            expect(result).toEqual([]);
        });
    });

    describe('getListResult', () => {
        it('should return true', () => {
            const result = component.isTextBoxControl(BetTypes.TimeOfFirstCorner);
            expect(result).toBe(true);
        });

        it('should return false', () => {
            const result = component.isTextBoxControl("");
            expect(result).toBe(false);
        });
    });

    it('resultOnChange - should call autoFillService and set false for result warning', () => {
        resultDetail.map = 3;
        const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
        const match = new Match();
        match.resultDetail = resultDetails;
        component.match = match;
        spyOn(autoFillService, 'autoFillResult');

        component.resultOnChange(resultDetail);

        expect(resultDetail.isResultWarning).toBe(false);
        expect(autoFillService.autoFillResult).toHaveBeenCalled();
    });

    it('woodworkOnChange - should set result properties correctly', () => {
        const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
        const match = new Match();
        match.resultDetail = resultDetails;
        component.match = match;
        spyOn(penaltyShootoutService, 'isSelectedNotTaken').and.returnValue(true);
        spyOn(penaltyWoodWorkService, 'isInvalidResult').and.returnValue(true);

        component.woodworkOnChange(resultDetail);

        expect(resultDetail.isNotTaken).toBe(true);
        expect(resultDetail.isResultWarning).toBe(false);
        expect(resultDetail.isInvalidValue).toBe(true);
        expect(resultDetail.isSettleDetermined).toBe(false);
    });

    it('onCollapsedClick - should set collapse property', () => {
        const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
        const map = new GroupMap(700000, resultDetails);
        map.collapsed = false;

        component.onCollapsedClick(map);

        expect(map.collapsed).toBe(true);
    });

    describe('onResettleCheckboxChange', () => {
        it('should set true for isReSettledTickets', () => {
            component.onResettleCheckboxChange(true);

            expect(component.isReSettledTickets).toBe(true);
        });

        it('should set true for isReSettledTickets', () => {
            component.onResettleCheckboxChange(false);

            expect(component.isReSettledTickets).toBe(false);
        });
    });

    describe('setAllResults', () => {
        const resultDetails: ResultDetail[] = [resultDetail];
        const match = new Match();
        match.resultDetail = resultDetails;

        it('should set value for home away penalty shootout', () => {
            resultDetail.betType = BetTypes.HomePenaltyShootout;

            component.setAllResults();

            expect(resultDetail.homeValue).toEqual(ResultValue.NotTaken);
            expect(resultDetail.isNotTaken).toBe(true);
        });

        it('should set value for penalty woodwork', () => {
            resultDetail.betType = BetTypes.PenaltyWoodwork;

            component.setAllResults();

            expect(resultDetail.homeValue).toEqual('');
            expect(resultDetail.awayValue).toEqual('');
        });

        it('should set value for odd/even bet type', () => {
            resultDetail.betType = BetTypes.PenaltyShootoutOddEven;

            component.setAllResults();

            expect(resultDetail.homeValue).toEqual('0');
            expect(resultDetail.awayValue).toEqual('0');
        });

        it('should set value for home away score penalty shootout', () => {
            resultDetail.betType = BetTypes.PenaltyShootoutHomeScore;

            component.setAllResults();

            expect(resultDetail.homeValue).toEqual('0');
        });

        it('should set value for penalty shootout combo', () => {
            resultDetail.betType = BetTypes.PenaltyShootoutCombo;

            component.setAllResults();

            expect(resultDetail.homeValue).toEqual('NNNNN');
            expect(resultDetail.awayValue).toEqual('NNNNN');
        });
    });

    it('resultOnChangeFirstTen - should call autoFillService', () => {
        resultDetail.map = 6;
        const resultDetails: ResultDetail[] = [resultDetail];
        const match = new Match();
        match.resultDetail = resultDetails;
        component.match = match;
        spyOn(autoFillService, 'changeValueOnPenaltyFirstTen');

        component.resultOnChangeFirstTen(resultDetail);

        expect(autoFillService.changeValueOnPenaltyFirstTen).toHaveBeenCalled();
    });

    describe('getResultSettingIcon.', () => {
        it('should return "icon-yes" when input is true', () => {
            const result = component.getResultSettingIcon(true);

            expect(result).toEqual('icon-yes');
        });

        it('should return "icon-no" when input is false', () => {
            const result = component.getResultSettingIcon(false);

            expect(result).toEqual('icon-no');
        });
    });

    describe('isChangeSetting.', () => {
        beforeAll(() => {
            component.matchId = 70001;
        });
        it('always show confirm', () => {
            spyOn(messageBoxService, 'confirm');

            const map = new GroupMap(1, []);

            component.isChangeSetting(resultDetail, map);

            expect(messageBoxService.confirm).toHaveBeenCalled();
        });

        it('should set correct value when aioService is successful', fakeAsync(() => {
            const map = new GroupMap(1, [resultDetail]);
            resultDetail.resultSettingData.isHoldResult = false;
            spyOn(helperService, 'changeResultSetting').and.returnValue(of(true));

            component.isChangeSetting(resultDetail, map);
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(resultDetail.resultSettingData.isHoldResult).toBe(true);
            expect(resultDetail.checked).toBe(false);
            expect(map.isHoldResult).toBe(true);
        }));
    });

    describe('changeSettingGroup', () => {
        beforeAll(() => {
            component.matchId = 70001;
        });
        it('always show confirm', () => {
            spyOn(messageBoxService, 'confirm');

            const map = new GroupMap(1, []);

            component.changeSettingGroup(map);

            expect(messageBoxService.confirm).toHaveBeenCalled();
        });

        it('should set correct value when service successful', fakeAsync(() => {
            const map = new GroupMap(1, [resultDetail]);
            spyOn(helperService, 'changeResultSetting').and.returnValue(of(true));

            component.changeSettingGroup(map);
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(map.checked).toBe(false);
            expect(map.isHoldResult).toBe(true);
            expect(resultDetail.checked).toBe(false);
            expect(resultDetail.resultSettingData.isHoldResult).toEqual(map.isHoldResult);
        }));
    });

    it('disableCalculateAndUnCalculate - should disable button when not exist bettype selected', () => {
        resultDetail.checked = false;
        component.match.resultDetail = [resultDetail];

        component.disableCalculateAndUnCalculate();

        expect(component.isDisabledCalculate).toBeTruthy();
        expect(component.isDisabledUnCalculate).toBeTruthy();
    });
});