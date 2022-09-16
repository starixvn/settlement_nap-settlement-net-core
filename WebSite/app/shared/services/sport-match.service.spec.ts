import { getTestBed, TestBed } from "@angular/core/testing";
import { Permission } from "../models/sportsbook-sop";
import { BackgroundColor, SportType } from "../constants";
import { AutoSetting, LeagueMatch, Match, MoreScore, Score, SportMatch } from "../models";
import { SportMatchService } from "./sport-match.service";

describe('SportMatchService', () => {
    let service: SportMatchService;
    let injector: TestBed;
    const matchBadminton = new Match();
    matchBadminton.sportType = SportType.badminton;
    matchBadminton.moreScores = new MoreScore();
    matchBadminton.moreScores.sets = [new Score('1', '0', '')];
    const matchIceHockey = new Match();
    matchIceHockey.sportType = SportType.iceHockey;
    matchIceHockey.betStatus = 'Refund;1-0,2-0,2-0,2-0';
    const matchFootball = new Match();
    matchFootball.sportType = SportType.football;
    matchFootball.betStatus = '1-0,2-0,0-0,1-0,0-0';
    matchFootball.isHalfTimeCal = true;
    matchFootball.isCalculated = true;
    const matchBaseball = new Match();
    matchBaseball.sportType = SportType.baseBall;
    matchBaseball.betStatus = '1-0,2-0,1-0,3-0,1-0';
    const league: LeagueMatch = {
        leagueId: 7000000,
        matches: [matchFootball, matchIceHockey, matchBaseball, matchBadminton],
        name: 'mock league',
        collapse: false,
        isCheckedCalcMP: false,
        disableCheckCalcMP: false,
        isMergedParlay: false,
        autoCalcSetting: new AutoSetting
    };

    const sport: SportMatch = {
        id: SportType.badminton,
        name: 'mock sport',
        leagues: [league],
        collapse: false,
    };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
            SportMatchService
        ],
      });

      injector = getTestBed();
    });

    it('should be created', () => {
      service = TestBed.inject(SportMatchService);
      expect(service).toBeTruthy();
    });

    describe('getSportWithIntervalScore', () => {
        it('should return sport list with correct interval score', () => {
          const permission = new Permission();
          permission.isLeader = true;
          const badmintonIntervalScore = [
            new Score('1', '0', '')
          ];
          const iceHockeyIntervalScore = [
            new Score('1', '0'),
            new Score('2', '0'),
            new Score('2', '0'),
            new Score('2', '0'),
          ];
          const baseballIntervalScore = [
            new Score('1', '0'),
            new Score('2', '0'),
            new Score('1', '0'),
            new Score('3', '0'),
            new Score('1', '0'),
            new Score('-', '-'),
            new Score('-', '-'),
            new Score('-', '-'),
            new Score('-', '-'),
            new Score('-', '-'),
          ];
          const footballIntervalScore = [
            new Score('1', '0', BackgroundColor.calculated),
            new Score('2', '0', BackgroundColor.calculated),
            new Score('0', '0', BackgroundColor.calculated),
            new Score('1', '0', BackgroundColor.calculated),
            new Score('0', '0', BackgroundColor.calculated),
          ];

          service.getSportsWithIntervalScore([sport], permission);

          expect(matchBadminton.intervalScore).toEqual(badmintonIntervalScore);
          expect(matchIceHockey.intervalScore).toEqual(iceHockeyIntervalScore);
          expect(matchBaseball.intervalScore).toEqual(baseballIntervalScore);
          expect(matchFootball.intervalScore).toEqual(footballIntervalScore);
        });
      });
});