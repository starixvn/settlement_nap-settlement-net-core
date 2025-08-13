import { ComponentFixture, fakeAsync, TestBed, tick, flush } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { IntervalBackgroundPipe } from "../../../shared/pipes/interval-background.pipe";
import { AioService, BlockUIService, HttpRequestService, MessageBoxService } from "../../../shared/services";
import { GameTotalCalculationComponent } from "./game-total-calculation.component";
import { GameTotalVerificationService } from "./game-total-verification.service";
import { GameTotalService } from "./game-total.service";
import { ExternalResult, ExternalResultDetail, HedgeMatchDetail, MatchDetail, Permission, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { MatchAio } from "../../models";
import { ModalContentDialogComponent } from "../../../shared/components/modal-dialog/modal-content-dialog.component";
import { ModalDialogComponent } from "../../../shared/components/modal-dialog/modal-dialog.component";
import { NotReadyMatchComponent } from "../../../shared/components/not-ready-match/not-ready-match.component";
import { ResettleCheckerComponent } from "../../../shared/components/resettle-checker/resettle-checker.component";
import { TicketCountComponent } from "../../../shared/components/ticket-count/ticket-count.component";
import { HttpClientModule } from "@angular/common/http";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { ApiKeys, ResourcesIds } from "../../constants";
import { ResourceNameByIdPipe } from "../../pipes/resource-name-by-id.pipe";
import { of } from "rxjs";
import * as _ from 'lodash';
import { ResourceHeaderPipe, ResultPipe, ScorePipe } from "../../pipes";
import { ChildMatch } from "../../models/child-match.model";
import { ResultStatusId, SportType } from "../../../shared/constants";
import { ResultSettingModel } from "../../../shared/models";
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from "ngx-toastr";
import { Language } from "../../../shared/language.native";

describe('GameTotalCalculationComponent', () => {
    let component: GameTotalCalculationComponent;
    let fixture: ComponentFixture<GameTotalCalculationComponent>;
    let gameTotalService: GameTotalService;
    let messageBoxService: MessageBoxService;
    let verificationService: GameTotalVerificationService;
    let aioService: AioService;
    let toastrService: ToastrService;

    const permission = {
        canCalculate: true,
        canRefund: true,
        canUncalculate: true,
        isLeader: true,
        canChangeScoreSource: true,
        isTrader: true,
    } as Permission;

    const message = 'message';
    const externalResult = new ExternalResult(1,[]);
    const resultDetail = new ResultDetail();
    resultDetail.resourceId = "0101";
    resultDetail.homeValue = '1';
    resultDetail.awayValue = '2';
    const matchDetail = new MatchDetail();
    matchDetail.homeName = 'hTeam';
    matchDetail.confirmFT = 1;
    const match = new MatchAio(matchDetail);
    match.permission = permission;
    match.resultDetails = [resultDetail];
    match.externalResults = [externalResult];
    let childMatch = new ChildMatch();
    let totalSet = new ResultDetail();
    totalSet.resourceId = "00";
    totalSet.homeValue = '3';
    totalSet.awayValue = '4';
    totalSet.resultSettingData = new ResultSettingModel();
    matchDetail.sportType = SportType.volleyBall;

    const successfulResult = {
        errCode: 0,
        errMsg: null,
        isSuccessful: true,
    };

    const unsuccessfulResult = {
        errCode: 1,
        errMsg: "error message",
        isSuccessful: false,
    };

    const buttonName = "btn-danger";

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                GameTotalCalculationComponent,
                ResourceHeaderPipe,
                ScorePipe,
                ResultPipe,
            ],
            imports: [
                HttpClientModule,
                NgbModule,
                FormsModule,
                NoopAnimationsModule,
                ToastNoAnimationModule.forRoot(),
                ToastrModule.forRoot(),
                ModalDialogComponent,
                ModalContentDialogComponent,
                TicketCountComponent,
                ResettleCheckerComponent,
                NotReadyMatchComponent,
                IntervalBackgroundPipe
            ],
            providers: [
                AioService,
                GameTotalService,
                BlockUIService,
                HttpRequestService,
                GameTotalVerificationService,
                MessageBoxService,
                IntervalBackgroundPipe,
                ResourceNameByIdPipe,
                NgbModal,
                ToastContainerDirective,
                { provide: ToastrService, useClass: ToastrService },
                { provide: MessageBoxService, useClass: MessageBoxService },
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameTotalCalculationComponent);
        component = fixture.componentInstance;
        aioService = fixture.debugElement.injector.get(AioService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        verificationService = fixture.debugElement.injector.get(GameTotalVerificationService);
        gameTotalService = fixture.debugElement.injector.get(GameTotalService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        jest.spyOn(toastrService, 'clear');
        jest.spyOn(toastrService, 'error');
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getMatch', () => {
        it('should call with correct parameters', () => {
            const matchId = 123;
            const matchQuery = {
                matchId,
                apikey: ApiKeys.NormalMatch,
                settleType: "MNL"
            };
            jest.spyOn(aioService, 'getMatch').mockResolvedValue(match);
            component.getMatch(matchId);

            expect(aioService.getMatch).toHaveBeenCalledWith(matchQuery);
        });

        it('should set correct value when get match success', async () => {
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '2';
            totalSet.resourceId = ResourcesIds.totalSets;
            match.resultDetails = [resultDetail, totalSet];
            match.matchDetail.playTime = 0;
            jest.spyOn(aioService, 'getMatch').mockResolvedValue(match);
            jest.spyOn(gameTotalService, 'resetHomeAway');
            jest.spyOn(verificationService, 'isScoreMismatched');
            await component.getMatch(1);

            expect(gameTotalService.resetHomeAway).toHaveBeenCalledWith([resultDetail, totalSet], true);
            expect(component.isReadyMatch).toBeTruthy();
        });
    });

    describe('disableTextBox', () => {
        it('should return true when directly is checked and resourceId is set', () => {
            match.isScoreDirect = true;
            component.match = match;

            const result = component.disableTextBox('0101');

            expect(result).toBeTruthy();
        });

        it('should return false when directly is checked and resourceId is totalSet', () => {
            match.isScoreDirect = true;
            component.match = match;

            const result = component.disableTextBox(ResourcesIds.totalSets);

            expect(result).toBeFalsy();
        });

        it('should return true when directly is unchecked and resourceId is totalSet', () => {
            match.isScoreDirect = false;
            component.match = match;

            const result = component.disableTextBox(ResourcesIds.totalSets);

            expect(result).toBeTruthy();
        });

        it('should return false when directly is unchecked and resourceId is Set', () => {
            match.isScoreDirect = false;
            component.match = match;

            const result = component.disableTextBox('0101');

            expect(result).toBeFalsy();
        });
    });

    describe('isErrorOnVerification', () => {
        it('should return false when match click on calculate is false', () => {
            match.isClickOnCalculate = false;
            component.match = match;

            const result = component.isErrorOnVerification(resultDetail);

            expect(result).toBeFalsy();
        });

        it('should return false when result is total point', () => {
            component.match = match;
            resultDetail.resourceId = ResourcesIds.totalPoints;

            const result = component.isErrorOnVerification(resultDetail);

            expect(result).toBeFalsy();
        });

        it('should return false when input directly is uncheck and result is total set', () => {
            resultDetail.resourceId = ResourcesIds.totalSets;
            match.isClickOnCalculate = true;
            match.isScoreDirect = false;
            component.match = match;

            const result = component.isErrorOnVerification(resultDetail);

            expect(result).toBeFalsy();
        });

        it('should return false when result has value', () => {
            resultDetail.resourceId = '0101';
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '1';
            match.isClickOnCalculate = true;
            match.isScoreDirect = false;
            component.match = match;

            const result = component.isErrorOnVerification(resultDetail);

            expect(result).toBeFalsy();
        });

        it('should return false when result value is empty', () => {
            resultDetail.resourceId = '0101';
            resultDetail.homeValue = '';
            resultDetail.awayValue = '1';
            match.isClickOnCalculate = true;
            match.isScoreDirect = false;
            component.match = match;

            const result = component.isErrorOnVerification(resultDetail);

            expect(result).toBeTruthy();
        });
    });

    describe('calculation', () => {
        it('should show confirm when score was changed', fakeAsync (() => {
            component.isReSettledTickets = false;
            component.match = match;
            component.resultDetails = [totalSet];
            component.resultDetailsOriginal = [totalSet];
            component.matchDetail = matchDetail;
            component.permission = permission;
            totalSet.isScoreMismatched = false;
            jest.spyOn(messageBoxService, 'confirm');
            jest.spyOn(verificationService, 'isEmptyScore').mockReturnValue(false);
            jest.spyOn(verificationService, 'isNotConsistentTotalSet').mockReturnValue(false);
            jest.spyOn(verificationService, 'getResultDetailToAction').mockReturnValue([resultDetail]);
            jest.spyOn(aioService, 'verifyNoRunningOdds').mockResolvedValue(successfulResult as any);
            jest.spyOn(aioService, 'verifyChangedSettledTickets').mockResolvedValue(true);
            jest.spyOn(verificationService, 'isInsufficient').mockReturnValue(false);

            component.calculation();
            tick();

            expect(messageBoxService.confirm).toHaveBeenCalled();
        }));

        it('should show confirm with score when all validate passed', fakeAsync(() => {
            component.isReSettledTickets = false;
            component.match = match;
            component.matchDetail = matchDetail;
            component.resultDetails = [totalSet];
            component.resultDetailsOriginal = [totalSet];
            component.permission = permission;
            jest.spyOn(messageBoxService, 'confirm');
            jest.spyOn(verificationService, 'isEmptyScore').mockReturnValue(false);
            jest.spyOn(verificationService, 'getResultDetailToAction').mockReturnValue([resultDetail]);
            jest.spyOn(aioService, 'verifyNoRunningOdds').mockResolvedValue(successfulResult as any);
            jest.spyOn(aioService, 'verifyChangedSettledTickets').mockResolvedValue(false);
            jest.spyOn(gameTotalService, 'getConfirmMessage').mockReturnValue(message);
            jest.spyOn(verificationService, 'isNotConsistentTotalSet').mockReturnValue(false);
            jest.spyOn(verificationService, 'isInsufficient').mockReturnValue(false);

            component.calculation();
            tick();

            expect(messageBoxService.confirm).toHaveBeenCalled();
            expect(component.confirmDialogMessage.message).toEqual(message);
        }));

        it('should show error when set is inconsistent', fakeAsync(() => {
            match.isScoreDirect = false;
            component.isReSettledTickets = false;
            component.match = match;
            component.matchDetail = matchDetail;
            component.resultDetails = [totalSet];
            component.resultDetailsOriginal = [totalSet];
            jest.spyOn(verificationService, 'isEmptyScore').mockReturnValue(false);
            jest.spyOn(verificationService, 'getResultDetailToAction').mockReturnValue([resultDetail]);
            jest.spyOn(verificationService, 'isNotConsistentTotalSet').mockReturnValue(true);
            jest.spyOn(aioService, 'verifyNoRunningOdds').mockResolvedValue(successfulResult as any);
            jest.spyOn(aioService, 'verifyChangedSettledTickets').mockResolvedValue(false);
            jest.spyOn(gameTotalService, 'getConfirmMessage').mockReturnValue(message);

            component.calculation();
            tick();
            flush();

            expect(toastrService.error).toHaveBeenCalled();
        }));

        it('return error message when push is fail', fakeAsync(() => {
            component.isReSettledTickets = false;
            match.resultDetails = [resultDetail];
            component.resultDetails = [totalSet];
            component.resultDetailsOriginal = [totalSet];
            component.match = match;
            component.matchDetail = matchDetail;
            component.permission = permission;
            jest.spyOn(verificationService, 'isEmptyScore').mockReturnValue(false);
            jest.spyOn(verificationService, 'getResultDetailToAction').mockReturnValue([resultDetail]);
            jest.spyOn(verificationService, 'isNotConsistentTotalSet').mockReturnValue(false);
            jest.spyOn(aioService, 'verifyChangedSettledTickets').mockResolvedValue(false);
            jest.spyOn(gameTotalService, 'getConfirmMessage').mockReturnValue(message);
            jest.spyOn(aioService, 'verifyNoRunningOdds').mockResolvedValue(successfulResult as any);
            jest.spyOn(aioService, 'push').mockResolvedValue(unsuccessfulResult as any);
            jest.spyOn(verificationService, 'isInsufficient').mockReturnValue(false);


            component.calculation();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();
            flush();

            expect(toastrService.error).toHaveBeenCalledWith(unsuccessfulResult.errMsg);
        }));

        it('should show alert when child match is inconsistent', fakeAsync(() => {
            component.isReSettledTickets = false;
            childMatch.checked = true;
            match.childMatches = [childMatch];
            component.resultDetails = [totalSet];
            component.resultDetailsOriginal = [totalSet];
            component.match = match;
            component.matchDetail = matchDetail;
            jest.spyOn(messageBoxService, 'alert');
            jest.spyOn(verificationService, 'isEmptyScore').mockReturnValue(false);
            jest.spyOn(verificationService, 'getResultDetailToAction').mockReturnValue([resultDetail]);
            jest.spyOn(verificationService, 'verifyConsistentChildMatch').mockReturnValue(true);


            component.calculation();
            tick();
            flush();

            expect(toastrService.error).toHaveBeenCalled();
        }));

        it('should show confirm when child match is consistent', fakeAsync(() => {
            component.isReSettledTickets = true;
            childMatch.checked = true;
            match.childMatches = [childMatch];
            match.resultDetails = [resultDetail];
            match.isScoreDirect = false;
            component.resultDetails = [totalSet];
            component.resultDetailsOriginal = [totalSet];
            component.match = match;
            component.matchDetail = matchDetail;
            jest.spyOn(messageBoxService, 'confirm');
            jest.spyOn(verificationService, 'isEmptyScore').mockReturnValue(false);
            jest.spyOn(verificationService, 'getResultDetailToAction').mockReturnValue([resultDetail]);
            jest.spyOn(verificationService, 'verifyConsistentChildMatch').mockReturnValue(false);

            component.calculation();
            tick();

            expect(messageBoxService.confirm).toHaveBeenCalled();
        }));

        it('should call hedge match when exist', fakeAsync(() => {
            component.isReSettledTickets = true;
            match.childMatches = [];
            match.hedgeMatchDetail = new HedgeMatchDetail();
            match.resultDetails = [resultDetail];
            match.hedgeMatchDetail.matchId = 1234
            component.resultDetails = [totalSet];
            component.resultDetailsOriginal = [totalSet];
            component.applyHedgeMatch = true;
            component.match = match;
            component.matchDetail = matchDetail;
            component.permission = permission;
            jest.spyOn(verificationService, 'isEmptyScore').mockReturnValue(false);
            jest.spyOn(verificationService, 'getResultDetailToAction').mockReturnValue([resultDetail]);
            jest.spyOn(verificationService, 'isNotConsistentTotalSet').mockReturnValue(false);
            jest.spyOn(aioService, 'verifyNoRunningOdds').mockResolvedValue(successfulResult as any);
            jest.spyOn(aioService, 'verifyChangedSettledTickets').mockResolvedValue(false);
            jest.spyOn(gameTotalService, 'getConfirmMessage').mockReturnValue(message);
            jest.spyOn(aioService, 'push').mockResolvedValue(successfulResult as any);
            jest.spyOn(messageBoxService, 'closePopup');
            jest.spyOn(verificationService, 'isInsufficient').mockReturnValue(false);


            component.calculation();
            tick();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(aioService.push).toHaveBeenCalledTimes(2);
        }));

        it('should calc child match when selected and pass all validation', fakeAsync(() => {
            component.isReSettledTickets = false;
            childMatch.checked = true;
            match.childMatches = [childMatch];
            match.resultDetails = [resultDetail];
            match.isScoreDirect = false;
            component.match = match;
            component.matchDetail = matchDetail;
            component.resultDetails = [totalSet];
            component.resultDetailsOriginal = [totalSet];
            component.permission = permission;
            jest.spyOn(verificationService, 'isEmptyScore').mockReturnValue(false);
            jest.spyOn(verificationService, 'getResultDetailToAction').mockReturnValue([resultDetail]);
            jest.spyOn(verificationService, 'verifyConsistentChildMatch').mockReturnValue(false);
            jest.spyOn(aioService, 'verifyNoRunningOdds').mockResolvedValue(successfulResult as any);
            jest.spyOn(aioService, 'verifyChangedSettledTickets').mockResolvedValue(false);
            jest.spyOn(gameTotalService, 'getConfirmMessage').mockReturnValue(message);
            jest.spyOn(aioService, 'push').mockResolvedValue(successfulResult as any);
            jest.spyOn(messageBoxService, 'closePopup');
            jest.spyOn(aioService, 'pushChildMatch').mockResolvedValue(successfulResult as any);
            jest.spyOn(verificationService, 'isInsufficient').mockReturnValue(false);

            component.calculation();
            let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();
            const buttons = document.getElementsByClassName(buttonName);
            if (buttons.length > 0) {
                buttonYes = buttons[0] as HTMLElement;
                buttonYes.click();
                tick();
            }

            expect(aioService.pushChildMatch).toHaveBeenCalled();
        }));


        it('should confirm twice and calc successfully when leader calc insufficient match', fakeAsync(() => {
            component.isReSettledTickets = true;
            match.childMatches = [];
            match.hedgeMatchDetail = new HedgeMatchDetail();
            match.resultDetails = [resultDetail];
            match.hedgeMatchDetail.matchId = 1234
            component.resultDetails = [totalSet];
            component.resultDetailsOriginal = [totalSet];
            component.applyHedgeMatch = true;
            component.match = match;
            component.matchDetail = matchDetail;
            component.permission = permission;
            jest.spyOn(verificationService, 'isEmptyScore').mockReturnValue(false);
            jest.spyOn(verificationService, 'getResultDetailToAction').mockReturnValue([resultDetail]);
            jest.spyOn(verificationService, 'isNotConsistentTotalSet').mockReturnValue(false);
            jest.spyOn(aioService, 'verifyNoRunningOdds').mockResolvedValue(successfulResult as any);
            jest.spyOn(aioService, 'verifyChangedSettledTickets').mockResolvedValue(false);
            jest.spyOn(gameTotalService, 'getConfirmMessage').mockReturnValue(message);
            jest.spyOn(aioService, 'push').mockResolvedValue(successfulResult as any);
            jest.spyOn(messageBoxService, 'closePopup');
            jest.spyOn(verificationService, 'isInsufficient').mockReturnValue(true);


            component.calculation();
            tick();
            let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();
            buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(aioService.push).toHaveBeenCalled();
        }));

        it('should confirm twice and calc successfully when leader calc mismatched match', fakeAsync(() => {
            component.isReSettledTickets = true;
            match.childMatches = [];
            match.hedgeMatchDetail = new HedgeMatchDetail();
            match.resultDetails = [resultDetail];
            match.hedgeMatchDetail.matchId = 1234
            component.resultDetails = [totalSet];
            component.resultDetailsOriginal = [totalSet];
            component.applyHedgeMatch = true;
            component.match = match;
            component.matchDetail = matchDetail;
            component.permission = permission;
            totalSet.isScoreMismatched = true;
            jest.spyOn(verificationService, 'isEmptyScore').mockReturnValue(false);
            jest.spyOn(verificationService, 'getResultDetailToAction').mockReturnValue([resultDetail]);
            jest.spyOn(verificationService, 'isNotConsistentTotalSet').mockReturnValue(false);
            jest.spyOn(aioService, 'verifyNoRunningOdds').mockResolvedValue(successfulResult as any);
            jest.spyOn(aioService, 'verifyChangedSettledTickets').mockResolvedValue(false);
            jest.spyOn(gameTotalService, 'getConfirmMessage').mockReturnValue(message);
            jest.spyOn(aioService, 'push').mockResolvedValue(successfulResult as any);
            jest.spyOn(messageBoxService, 'closePopup');
            jest.spyOn(verificationService, 'isInsufficient').mockReturnValue(false);


            component.calculation();
            tick();
            let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();
            const buttons = document.getElementsByClassName(buttonName);
            if (buttons.length > 0) {
                buttonYes = buttons[0] as HTMLElement;
                buttonYes.click();
                tick();
            }

            expect(aioService.push).toHaveBeenCalled();
        }));
    });

    it('uncalculation - should push query and close popup when click confirm', fakeAsync(() => {
        match.resultDetails = [resultDetail];
        component.match = match;
        jest.spyOn(aioService, 'push').mockResolvedValue(successfulResult as any);
        jest.spyOn(messageBoxService, 'closePopup');

        component.uncalculation();
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(aioService.push).toHaveBeenCalled();
        expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('changeInputDirectly - should set correct when check input directly', () => {
        resultDetail.homeValue = '1';
        resultDetail.awayValue = '2';
        totalSet = _.cloneDeep(resultDetail);
        totalSet.resourceId = ResourcesIds.totalSets;
        match.isScoreDirect = true;
        component.resultDetails = [resultDetail, totalSet];
        component.resultDetailsOriginal = _.cloneDeep(component.resultDetails);
        totalSet.homeValue = '3';
        component.match = match;
        component.matchDetail = matchDetail;
        component.permission = permission;

        jest.spyOn(verificationService, 'getClassWithScore');
        jest.spyOn(verificationService, 'isNotConsistent').mockReturnValue(true);

        component.changeInputDirectly();

        expect(resultDetail.homeValue).toEqual("");
        expect(resultDetail.awayValue).toEqual("");
        expect(totalSet.awayValue).toEqual('2');
        expect(totalSet.homeValue).toEqual('1');
        expect(component.match.isClickOnCalculate).toBeFalsy();
    });

    it('onResettleCheckboxChange - set correct value', () => {
        component.isReSettledTickets = false;

        component.onResettleCheckboxChange(true);

        expect(component.isReSettledTickets).toBeTruthy();
    });

    it('copyScore - should copy external score to result detail', fakeAsync(() => {
        jest.spyOn(verificationService, 'verifyCopyScore').mockReturnValue('');
        jest.spyOn(verificationService, 'isNotConsistent').mockReturnValue(true);
        const externalResultDetail = new ExternalResultDetail(100, '00', 'SBO', '', '3', '4');
        component.providerResultDetails = [externalResultDetail];
        match.matchDetail.exFTHomeScore = 3;
        match.matchDetail.exFTAwayScore = 4;
        totalSet = new ResultDetail();
        totalSet.resourceId = "00";
        childMatch = new ChildMatch();
        childMatch.relatedResourceId = "00";
        match.childMatches = [childMatch];
        component.resultDetails = [totalSet];
        component.match = match;
        component.matchDetail = matchDetail;

        component.copyScore();
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(totalSet.homeValue).toEqual("3");
        expect(totalSet.awayValue).toEqual("4");
        expect(childMatch.isNotConsistent).toBeTruthy();
      }));

    describe("getClass", () => {
        it("should return not-consistent when child match is not consistent", () => {
            childMatch.isNotConsistent = true;

            const actual = component.getClass(childMatch);

            expect(actual).toEqual("not-consistent");
        });

        it("should return consistent when child match is consistent and confirmed", () => {
            childMatch.isNotConsistent = false;
            childMatch.resultStatusId = ResultStatusId.RunningThree;

            const actual = component.getClass(childMatch);

            expect(actual).toEqual("consistent");
        });

        it("should return empty when child match is consistent and not confirmed", () => {
            childMatch.isNotConsistent = false;
            childMatch.resultStatusId = ResultStatusId.RunningOne;

            const actual = component.getClass(childMatch);

            expect(actual).toEqual("");
        });
    });

    describe('getConfirmedBackground', () => {
        it('should return confirmed background when match is confirmed and running', () => {
            totalSet.settlementStatusId = 0;
            jest.spyOn(verificationService, 'isScoreConfirmed').mockReturnValue(true);

            expect(component.getConfirmedBackground(totalSet, true)).toBe('bg-result-confirmed');
        });

        it('should return empty when match not confirmed yet', () => {
            jest.spyOn(verificationService, 'isScoreConfirmed').mockReturnValue(false);

            expect(component.getConfirmedBackground(totalSet, true)).toBe('');
        });

        it('should return empty when result detail is not final', () => {
            jest.spyOn(verificationService, 'isScoreConfirmed').mockReturnValue(true);

            expect(component.getConfirmedBackground(totalSet, false)).toBe('');
        });
    });

    describe('getMismatchedBackground', () => {
        it('should return mismatched background when score is mismatched', () => {
            totalSet.isScoreMismatched = true;

            expect(component.getMismatchedBackground(totalSet, true)).toBe('mismatched');
        });

        it('should return empty when score is matched', () => {
            totalSet.isScoreMismatched = false;

            expect(component.getMismatchedBackground(totalSet, true)).toBe('');
        });

        it('should return empty when result detail is not final', () => {
            expect(component.getMismatchedBackground(totalSet, false)).toBe('');
        });
    });

    it('changeScore - should sum total score and verify score', () => {
        match.isScoreDirect = false;
        component.match = match;
        component.matchDetail = matchDetail;
        const totalPoint = { resourceId: '01' } as ResultDetail;
        component.resultDetails = [resultDetail, totalPoint, totalSet];
        component.resultDetailsOriginal = [resultDetail, totalPoint, totalSet];
        jest.spyOn(gameTotalService, 'changeTotalPoints').mockReturnValue(new ResultDetail());
        jest.spyOn(gameTotalService, 'computeTotalSets').mockReturnValue(new ResultDetail());
        jest.spyOn(verificationService, 'isNotConsistent');
        jest.spyOn(verificationService, 'isScoreMismatched');
        jest.spyOn(verificationService, 'getClassWithScore');

        component.changeScore();

        expect(verificationService.isScoreMismatched).toHaveBeenCalled();
    });
});