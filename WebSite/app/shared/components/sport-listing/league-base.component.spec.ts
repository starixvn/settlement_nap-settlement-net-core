import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BackgroundColor, SportType } from '../../constants';
import {
  MoreScore,
  Score,
  Match,
  Remark } from '../../models';
import { LeagueBaseComponent } from './league-base.component';

describe('LeagueBaseComponent', () => {
    let component: LeagueBaseComponent;
    let fixture: ComponentFixture<LeagueBaseComponent>;
    const match = new Match();
    match.sportType = SportType.eSports;
    match.isCheckedCalcMP = true;
    
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                LeagueBaseComponent,
            ],
            providers: [
            ],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
            ],
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LeagueBaseComponent);
        component = fixture.componentInstance;
    });

    describe('getTotalHomeGames', () => {
        it('should set total games of home by more score', () => {
        match.sportType = SportType.badminton;
        match.moreScores = new MoreScore();
        match.moreScores.halfTimeScore = new Score('1', '0', '');

        const result = component.getTotalHomeGames(match);

        expect(result).toEqual('1');
        });

        it('should set total games of home by half time home score', () => {
        match.sportType = SportType.squash;
        match.homeTotalGames = 2;

        const result = component.getTotalHomeGames(match);

        expect(result).toEqual('2');
        });

        it('should return dash when match not support total games', () => {
        match.sportType = SportType.basketBall;

        const result = component.getTotalHomeGames(match);

        expect(result).toEqual('-');
        });
    });

    describe('getTotalAwayGames', () => {
        it('should set total games of away by more score', () => {
        match.sportType = SportType.badminton;

        const result = component.getTotalAwayGames(match);

        expect(result).toEqual('0');
        });

        it('should set total games of away by half time away score', () => {
        match.sportType = SportType.volleyBall;
        match.awayTotalGames = 0;

        const result = component.getTotalAwayGames(match);

        expect(result).toEqual('0');
        });

        it('should return dash when match not support total games', () => {
        match.sportType = SportType.basketBall;

        const result = component.getTotalAwayGames(match);

        expect(result).toEqual('-');
        });
    });

    describe('getHalfTimeHomeScore', () => {
        it('should return half time score by more score', () => {
        match.sportType = SportType.basketBall;

        const result = component.getHalfTimeHomeScore(match);

        expect(result).toEqual('1');
        });

        it('should return half time home score', () => {
        match.sportType = SportType.football;
        match.halfTimeHomeScore = 2;

        const result = component.getHalfTimeHomeScore(match);

        expect(result).toEqual('2');
        });

        it('should return dash when match not support half time score', () => {
        match.sportType = SportType.sepakTakraw;

        const result = component.getHalfTimeHomeScore(match);

        expect(result).toEqual('-');
        });
    });

    describe('getHalfTimeAwayScore', () => {
        it('should return half time score by more score', () => {
        match.sportType = SportType.basketBall;

        const result = component.getHalfTimeAwayScore(match);

        expect(result).toEqual('0');
        });

        it('should return half time away score', () => {
        match.sportType = SportType.football;
        match.halfTimeAwayScore = 0;

        const result = component.getHalfTimeAwayScore(match);

        expect(result).toEqual('0');
        });

        it('should return dash when match not support half time score', () => {
        match.sportType = SportType.sepakTakraw;

        const result = component.getHalfTimeAwayScore(match);

        expect(result).toEqual('-');
        });
    });

    describe('getFinalHomeScore', () => {
        it('should return final home score by more score', () => {
        match.sportType = SportType.basketBall;
        match.moreScores.finalScore = new Score('2', '3', '');

        const result = component.getFinalHomeScore(match);

        expect(result).toEqual('2');
        });

        it('should return final home score', () => {
        match.sportType = SportType.football;
        match.finalHomeScore = 1;

        const result = component.getFinalHomeScore(match);

        expect(result).toEqual('1');
        });
    });

    describe('getFinalAwayScore', () => {
        it('should return final away score by more score', () => {
        match.sportType = SportType.basketBall;

        const result = component.getFinalAwayScore(match);

        expect(result).toEqual('3');
        });

        it('should return final away score', () => {
        match.sportType = SportType.football;
        match.finalAwayScore = 2;

        const result = component.getFinalAwayScore(match);

        expect(result).toEqual('2');
        });
    });

    describe('undecidedColor', () => {
        it('should return undicided color when match is remarked', () => {
        const remark: Remark = {
            isMtdHold: true,
            isUndecided: true,
            isPending: true,
            isUnderSettle: true,
            isKeyHold: true,
        };

        const result = component.undecidedColor(remark);

        expect(result).toEqual(BackgroundColor.undecidedRow);
        });

        it('should return empty when match is not remarked', () => {
        const remark = new Remark();

        const result = component.undecidedColor(remark);

        expect(result).toEqual('');
        });
    });

    describe('getEventStatusColor', () => {
        it('should return only event status of match when match is not calculating', () => {
        match.isCalculatingSingle = null;
        match.eventStatusColor = 'event-status';

        const result = component.getEventStatusColor(match);

        expect(result).toEqual(match.eventStatusColor);
        });

        it('should return waiting status when match is waiting', () => {
        match.isCalculatingSingle = 0;

        const result = component.getEventStatusColor(match);

        expect(result).toEqual('waiting event-status');
        });

        it('should return calculating status when match is calculating', () => {
        match.isCalculatingSingle = 1;

        const result = component.getEventStatusColor(match);

        expect(result).toEqual('calculating event-status');
        });

        it('should return only event status when match is successfully calculated', () => {
        match.isCalculatingSingle = 2;

        const result = component.getEventStatusColor(match);

        expect(result).toEqual(match.eventStatusColor);
        });
    });
});
