import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MessageBoxService } from "../../../shared/services";
import { FantasyComponent } from ".";
import { VerifyMatchService } from "./services/verify-match.service";
import { VerifyScoreGoalService } from "./services/verify-score-goal.service";
import { ScorePipe } from "../../pipes/score.pipe";
import { FantasyMatch, FantasyMatchDetail, FantasyRelatedMatch } from "./models/match.model";
import { Remark } from "../../../shared/models";
import { Language } from "../../../shared/language.native";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { ModalContentDialogComponent, ModalDialogComponent } from "../../../shared/components";

describe('GoalHistoryComponent', () => {
    let component: FantasyComponent;
    let fixture: ComponentFixture<FantasyComponent>;
    let verifyMatchService: VerifyMatchService;
    let messageBoxService: MessageBoxService;
    let verifyScoreGoalService: VerifyScoreGoalService;
    const buttonName = "btn-danger";

    const fantasyMatchDetail: FantasyMatchDetail = {
        fantasyHomeTeam: "",
        fantasyAwayTeam: ""
    }

    const fantasyRelatedMatch: FantasyRelatedMatch = {
        matchId: 0,
        matchCode: "",
        kickOffTime: "",
        homeId: 0,
        awayId: 0,
        homeName: "",
        awayName: "",
        htHomeScore: "",
        htAwayScore: "",
        finalHomeScore: "",
        finalAwayScore: "",
        remark: new Remark(),
        eventStatus: "",
        betStatus: "",
        isDeleted: false
    }

    const fantasyMatch: FantasyMatch = {
        fantasyMatchDetail,
        relatedMatches: [fantasyRelatedMatch]
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                NgbModule,
                FormsModule
            ],
            declarations: [
                FantasyComponent,
                ModalDialogComponent,
                ModalContentDialogComponent,
                ScorePipe
            ],
            providers: [
                MessageBoxService,
                VerifyMatchService,
                VerifyScoreGoalService,
            ]
        }).overrideModule(BrowserDynamicTestingModule, {
            set: {
              entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
            },
          }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FantasyComponent);
        verifyMatchService = fixture.debugElement.injector.get(VerifyMatchService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        verifyScoreGoalService = fixture.debugElement.injector.get(VerifyScoreGoalService);
        component = fixture.componentInstance;
        component.fantasyMatch = fantasyMatch;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('isMatchRefunded', () => {
        it('should return true when bet status exist refunded', () => {
            fantasyRelatedMatch.betStatus = 'refunded ';

            const result = component.isMatchRefunded(fantasyRelatedMatch);

            expect(result).toBeTruthy();
        });

        it('should return true when bet status exist abandoned', () => {
            fantasyRelatedMatch.betStatus = 'AbandoneD ';

            const result = component.isMatchRefunded(fantasyRelatedMatch);

            expect(result).toBeTruthy();
        });
    });

    describe('verifyAndFillFantasyMatch', () => {
        it('should emit error message when related matches insufficient', () => {
            spyOn(verifyMatchService, 'isRelatedMatchesInsufficient').and.returnValue(true);
            spyOn(component.errorMsgEmitter, 'emit');

            component.verifyAndFillFantasyMatch();

            expect(component.errorMsgEmitter.emit).toHaveBeenCalledTimes(2);
            expect(component.errorMsgEmitter.emit).toHaveBeenCalledWith(Language.fantasyMatch.insufficientRelatedMatches);
        });

        it('should emit error message when exist match not calculated', () => {
            fantasyRelatedMatch.eventStatus = 'runninG';
            component.relatedMatches = [fantasyRelatedMatch];
            spyOn(verifyMatchService, 'isRelatedMatchesInsufficient').and.returnValue(false);
            spyOn(verifyMatchService, 'isExistHoldMatch').and.returnValue(false);
            spyOn(component.errorMsgEmitter, 'emit');

            component.verifyAndFillFantasyMatch();

            expect(component.errorMsgEmitter.emit).toHaveBeenCalledTimes(2);
            expect(component.errorMsgEmitter.emit).toHaveBeenCalledWith(Language.fantasyMatch.warningMatchNotCalculated);
        });

        it('should call sum score function and emit score after confirm', fakeAsync(() => {
            fantasyRelatedMatch.eventStatus = 'completeD';
            fantasyRelatedMatch.betStatus = 'running';
            component.relatedMatches = [fantasyRelatedMatch];
            spyOn(verifyMatchService, 'isRelatedMatchesInsufficient').and.returnValue(false);
            spyOn(verifyMatchService, 'isExistHoldMatch').and.returnValue(false);
            spyOn(verifyScoreGoalService, 'sumScoreAndAutoFill');
            spyOn(component.autoFillScore, 'emit');

            component.verifyAndFillFantasyMatch();
            const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(verifyScoreGoalService.sumScoreAndAutoFill).toHaveBeenCalled();
            expect(component.autoFillScore.emit).toHaveBeenCalled();
        }));

        it('should show twice confirm when exist hold match', fakeAsync(() => {
            fantasyRelatedMatch.eventStatus = 'Completed';
            component.relatedMatches = [fantasyRelatedMatch];
            spyOn(verifyMatchService, 'isRelatedMatchesInsufficient').and.returnValue(false);
            spyOn(verifyMatchService, 'isExistHoldMatch').and.returnValue(true);
            spyOn(verifyScoreGoalService, 'sumScoreAndAutoFill');
            spyOn(component.autoFillScore, 'emit');

            component.verifyAndFillFantasyMatch();
            let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();
            buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
            buttonYes.click();
            tick();

            expect(verifyScoreGoalService.sumScoreAndAutoFill).toHaveBeenCalled();
            expect(component.autoFillScore.emit).toHaveBeenCalled();
        }));
    });
});