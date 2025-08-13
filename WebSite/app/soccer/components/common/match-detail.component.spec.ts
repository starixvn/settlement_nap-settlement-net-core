import { MessageBoxService, BlockUIService, HttpRequestService } from '../../../shared/services';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ScoreBySettlementPipe } from '../../../shared/pipes/score-by-settlement.pipe';
import { MatchDetailComponent } from './match-detail.component';
import { Match, MatchDetail } from '../early/models';


describe('Soccer - MatchDetailComponent', () => {
    let component: MatchDetailComponent;
    let fixture: ComponentFixture<MatchDetailComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                ScoreBySettlementPipe,
                MatchDetailComponent
            ],
            providers: [
                HttpRequestService,
                BlockUIService,
                MessageBoxService]
        })
            .compileComponents()
            .then(() => {
                const matchDetail = {
                    matchId: 123,
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
                    finalHomeScore: null,
                    offerLive: false
                } as MatchDetail;
                fixture = TestBed.createComponent(MatchDetailComponent);
                component = fixture.componentInstance;
                const match = new Match();
                match.matchDetail = matchDetail;
                component.match = match;
                fixture.detectChanges();
            });
    }));

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });

    it(`should return right expected matchId`, () => {
        const matchId = 123;
        expect(component.matchDetail.matchId).toEqual(matchId);
    });
});