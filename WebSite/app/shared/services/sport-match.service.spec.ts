import { getTestBed, TestBed } from "@angular/core/testing";
import { Permission } from "../models/sportsbook-sop";
import { BackgroundColor, SportType } from "../constants";
import { AutoSetting, LeagueMatch, Match, MoreScore, Score, SportMatch } from "../models";
import { SportMatchService } from "./sport-match.service";

describe('SportMatchService', () => {
    let service: SportMatchService;
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
      leagueId: 1,
      matches: [],
      name: 'Test League',
      collapse: false,
      autoCalcSetting: new AutoSetting(),
      enabledAutoRefund: false
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
    });

    it('should be created', () => {
      service = TestBed.inject(SportMatchService);
      expect(service).toBeTruthy();
    });

    describe('getSportWithIntervalScore', () => {
        it('should return sport list with correct interval score', () => {
          const permission = new Permission();
          permission.isLeader = true;
          
          // Create separate sport objects for each sport type
          const badmintonSport: SportMatch = {
            id: SportType.badminton,
            name: 'Badminton',
            leagues: [{
              ...league,
              matches: [matchBadminton]
            }],
            collapse: false,
          };
          
          const iceHockeySport: SportMatch = {
            id: SportType.iceHockey,
            name: 'Ice Hockey',
            leagues: [{
              ...league,
              matches: [matchIceHockey]
            }],
            collapse: false,
          };
          
          const footballSport: SportMatch = {
            id: SportType.football,
            name: 'Football',
            leagues: [{
              ...league,
              matches: [matchFootball]
            }],
            collapse: false,
          };
          
          // Ensure the matches have the correct sport types
          matchBadminton.sportType = SportType.badminton;
          matchIceHockey.sportType = SportType.iceHockey;
          matchFootball.sportType = SportType.football;
          matchBaseball.sportType = SportType.baseBall;
          
          // Provide resultDetails for baseball match so the service can process it
          (matchBaseball as any).resultDetails = [
            { homeValue: '1', awayValue: '0' },
            { homeValue: '2', awayValue: '0' },
            { homeValue: '1', awayValue: '0' },
            { homeValue: '3', awayValue: '0' },
            { homeValue: '1', awayValue: '0' }
          ];
          
          const badmintonIntervalScore = [
            new Score('1', '0', '')
          ];
          const iceHockeyIntervalScore = [
            new Score('1', '0'),
            new Score('2', '0'),
            new Score('2', '0'),
            new Score('2', '0'),
          ];
          const footballIntervalScore = [
            new Score('1', '0', BackgroundColor.calculated),
            new Score('2', '0', BackgroundColor.calculated),
            new Score('0', '0', BackgroundColor.calculated),
            new Score('1', '0', BackgroundColor.calculated),
            new Score('0', '0', BackgroundColor.calculated),
          ];

          service.getSportsWithIntervalScore([badmintonSport, iceHockeySport, footballSport], permission);

          expect(matchBadminton.intervalScore).toEqual(badmintonIntervalScore);
          expect(matchIceHockey.intervalScore).toEqual(iceHockeyIntervalScore);
          expect(matchFootball.intervalScore).toEqual(footballIntervalScore);
        });
      });
});