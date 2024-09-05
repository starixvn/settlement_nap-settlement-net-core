import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { CalculationMatchDetailComponent } from ".";
import { MessageBoxService } from "../../../shared/services";
import { GoalIconService } from "./services/goal-icon.service";
import { VerifyScoreGoalService } from "./services/verify-score-goal.service";
import { FormsModule } from "@angular/forms";
import { ScorePipe } from "../../pipes/score.pipe";
import { CreateDataTest } from "./services/create-data-test.native";
import { GoalIcon } from "../../models";
import { Language } from "../../../shared/language.native";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { VerificationBaseService } from "../../services/verification-base.service";
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';

describe('CalculationComponent', () => {
    let component: CalculationMatchDetailComponent;
    let fixture: ComponentFixture<CalculationMatchDetailComponent>;
    let goalIconService: GoalIconService;
    let verifyScoreGoalService: VerifyScoreGoalService;
    let matchDetail = CreateDataTest.MatchDetail();
    const goalIcon = new GoalIcon('1', '1', '1', '1');
    matchDetail.goalIcon = goalIcon;
    const buttonName = "btn-danger";
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ModalDialogComponent,
                ModalContentDialogComponent,
                FormsModule,
                NgbModule
            ],
            declarations: [
                CalculationMatchDetailComponent,
                ScorePipe
            ],
            providers: [
                GoalIconService,
                VerifyScoreGoalService,
                VerificationBaseService,
                { provide: MessageBoxService, useClass: MessageBoxService },
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CalculationMatchDetailComponent);
        component = fixture.componentInstance;
        goalIconService = fixture.debugElement.injector.get(GoalIconService);
        verifyScoreGoalService = fixture.debugElement.injector.get(VerifyScoreGoalService);
        component.matchDetail = matchDetail;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit - should set apply goal record and disable button', () => {
        beforeEach(() => {
            matchDetail = CreateDataTest.MatchDetail();
            matchDetail.goalIcon = goalIcon;
        });
        it('Exist first goal last goal bettype', () => {
            matchDetail.isExistFgLg = true;
            component.matchDetail = matchDetail;

            fixture.detectChanges();

            expect(component.matchDetail.applyGoalRecord).toBeTruthy();
            expect(component.disableGoalRecordCheckbox).toBeTruthy();
        });

        it('Exist half time first goal last goal bettype', () => {
            matchDetail.isExistHtFgLg = true;
            component.matchDetail = matchDetail;

            fixture.detectChanges();

            expect(component.matchDetail.applyGoalRecord).toBeTruthy();
            expect(component.disableGoalRecordCheckbox).toBeTruthy();
        });

        it('Exist Result And First Team Score', () => {
            matchDetail.isExistResultAndFirstTeamScore = true;
            component.matchDetail = matchDetail;

            fixture.detectChanges();

            expect(component.matchDetail.applyGoalRecord).toBeTruthy();
            expect(component.disableGoalRecordCheckbox).toBeTruthy();
        });

        it('Match enable ht goal record', () => {
            matchDetail.isEnabledGoalRecordHt = true;
            component.matchDetail = matchDetail;

            fixture.detectChanges();

            expect(component.matchDetail.applyGoalRecord).toBeTruthy();
            expect(component.disableGoalRecordCheckbox).toBeTruthy();
        });

        it('Match enable FT goal record', () => {
            matchDetail.isEnabledGoalRecordFt = true;
            component.matchDetail = matchDetail;

            fixture.detectChanges();

            expect(component.matchDetail.applyGoalRecord).toBeTruthy();
            expect(component.disableGoalRecordCheckbox).toBeTruthy();
        });
    });

    it('ngOninit - should disable final input when match HT only and not in pin goal league', () => {
        matchDetail.leagueGroupId = 1;
        matchDetail.isHtOnly = true;
        component.matchDetail = matchDetail;

        fixture.detectChanges();

        expect(component.disableFinal).toBeTruthy();
    });

    it('goalRecordModelChange - should set correct value', () => {
        const goal = new GoalIcon('1', '1', '1', '1');
        jest.spyOn(goalIconService, 'generateGoalIcon').mockReturnValue(goal);

        component.goalRecordModelChange('H');

        expect(component.matchDetail.goalRecord).toEqual('H');
        expect(component.matchDetail.goalIcon).toEqual(goal)
    });

    describe('changeScore', () => {
        it('always emit match detail when call function', () => {
            component.matchDetail = matchDetail;
            jest.spyOn(component.scoreChange, 'emit');

            component.changeScore();

            expect(component.scoreChange.emit).toHaveBeenCalled();
        });

        it('Score inconsistent false when HT score empty', () => {
            matchDetail.halfTimeAwayScore = null;
            matchDetail.halfTimeHomeScore = 1;
            component.matchDetail = matchDetail;

            component.changeScore();

            expect(component.matchDetail.isScoreInconsistent).toBeFalsy();
        });

        it('Score inconsistent false when FT score empty', () => {
            matchDetail.halfTimeAwayScore = 1;
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.finalAwayScore = null;
            matchDetail.finalHomeScore = 1;
            component.matchDetail = matchDetail;

            component.changeScore();

            expect(component.matchDetail.isScoreInconsistent).toBeFalsy();
        });

        it('Score inconsistent true when FT score slower than HT score', () => {
            matchDetail.halfTimeAwayScore = 1;
            matchDetail.halfTimeHomeScore = 2;
            matchDetail.finalAwayScore = 1;
            matchDetail.finalHomeScore = 1;
            component.matchDetail = matchDetail;

            component.changeScore();

            expect(component.matchDetail.isScoreInconsistent).toBeTruthy();
        });
    });

    describe('copyScore', () => {
        beforeEach(() => {
            matchDetail.halfTimeAwayScore = 0;
            matchDetail.halfTimeHomeScore = 0;
            matchDetail.finalAwayScore = 0;
            matchDetail.finalHomeScore = 0;
        });
        it('should emit match settled message when match settled', () => {
            jest.spyOn(component.errorMsgEmitter, 'emit');
            jest.spyOn(verifyScoreGoalService, 'isFullTimeSettled').mockReturnValue(true);

            component.copyScore();

            expect(component.errorMsgEmitter.emit).toHaveBeenCalledWith(Language.soccer.matchAlreadySettled);
        });

        it('should emit HT settled message when HT settled and exFTscore is invalid', () => {
            matchDetail.exFTAwayScore = null;
            matchDetail.exFTHomeScore = 1;
            component.matchDetail = matchDetail;
            jest.spyOn(component.errorMsgEmitter, 'emit');
            jest.spyOn(verifyScoreGoalService, 'isFullTimeSettled').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHalfTimeSettled').mockReturnValue(true);

            component.copyScore();

            expect(component.errorMsgEmitter.emit).toHaveBeenCalledWith(Language.soccer.halfTimeAlreadySettled);
        });

        it('should emit HT settled message when exScore is invalid', () => {
            matchDetail.exHTAwayScore = null;
            matchDetail.exHTHomeScore = 1;
            matchDetail.exFTAwayScore = null;
            matchDetail.exFTHomeScore = 1;
            component.matchDetail = matchDetail;
            jest.spyOn(component.errorMsgEmitter, 'emit');
            jest.spyOn(verifyScoreGoalService, 'isFullTimeSettled').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHalfTimeSettled').mockReturnValue(false);

            component.copyScore();

            expect(component.errorMsgEmitter.emit).toHaveBeenCalledWith(Language.soccer.noSBOScore);
        });

        it('should copy score FT when HT settle and exFTScore valid', fakeAsync(() => {
            matchDetail.exFTAwayScore = 2;
            matchDetail.exFTHomeScore = 1;
            component.matchDetail = matchDetail;
            jest.spyOn(verifyScoreGoalService, 'isFullTimeSettled').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHalfTimeSettled').mockReturnValue(true);

            component.copyScore();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.matchDetail.halfTimeHomeScore).toEqual(0);
            expect(component.matchDetail.halfTimeAwayScore).toEqual(0);
            expect(component.matchDetail.finalHomeScore).toEqual(1);
            expect(component.matchDetail.finalAwayScore).toEqual(2);
        }));

        it('should copy only Ft score when match not settle and exHTScore invalid', fakeAsync(() => {
            matchDetail.exHTAwayScore = null;
            matchDetail.exHTHomeScore = 1;
            matchDetail.exFTAwayScore = 2;
            matchDetail.exFTHomeScore = 1;
            component.matchDetail = matchDetail;
            jest.spyOn(verifyScoreGoalService, 'isFullTimeSettled').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHalfTimeSettled').mockReturnValue(false);

            component.copyScore();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.matchDetail.halfTimeHomeScore).toEqual(0);
            expect(component.matchDetail.halfTimeAwayScore).toEqual(0);
            expect(component.matchDetail.finalHomeScore).toEqual(1);
            expect(component.matchDetail.finalAwayScore).toEqual(2);
        }));

        it('should copy only HT score when match not settle and exFTScore invalid', fakeAsync(() => {
            matchDetail.exHTAwayScore = 2;
            matchDetail.exHTHomeScore = 1;
            matchDetail.exFTAwayScore = null;
            matchDetail.exFTHomeScore = 1;
            component.matchDetail = matchDetail;
            jest.spyOn(component.errorMsgEmitter, 'emit');
            jest.spyOn(verifyScoreGoalService, 'isFullTimeSettled').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHalfTimeSettled').mockReturnValue(false);

            component.copyScore();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.matchDetail.halfTimeHomeScore).toEqual(1);
            expect(component.matchDetail.halfTimeAwayScore).toEqual(2);
            expect(component.matchDetail.finalHomeScore).toEqual(0);
            expect(component.matchDetail.finalAwayScore).toEqual(0);
        }));

        it('should copy score FT when HT settle and exFTScore valid', fakeAsync(() => {
            matchDetail.exHTHomeScore = 1;
            matchDetail.exHTAwayScore = 2;
            matchDetail.exFTHomeScore = 3;
            matchDetail.exFTAwayScore = 4;
            component.matchDetail = matchDetail;
            jest.spyOn(component.errorMsgEmitter, 'emit');
            jest.spyOn(verifyScoreGoalService, 'isFullTimeSettled').mockReturnValue(false);
            jest.spyOn(verifyScoreGoalService, 'isHalfTimeSettled').mockReturnValue(false);

            component.copyScore();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(component.matchDetail.halfTimeHomeScore).toEqual(1);
            expect(component.matchDetail.halfTimeAwayScore).toEqual(2);
            expect(component.matchDetail.finalHomeScore).toEqual(3);
            expect(component.matchDetail.finalAwayScore).toEqual(4);
        }));
    });
});