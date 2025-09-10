import { Team, } from './../models';
import { CalculateService } from "./calculate.service";
import * as _ from 'lodash';
import { Language } from '../../shared/language.native';
import { Status } from '../constants';

describe('CalculateService', () => {
    const team: Team = {
        isDeadheat: false,
        disableDeadheat: false,
        selected: false,
        eventDate: '',
        dateTime: undefined,
        oddsStatus: '',
        orId: '1',
        matchCode: '',
        kickOffTime: undefined,
        sportType: 0,
        status: 'running',
        leagueId: 0,
        leagueName: '',
        teamId: 100,
        teamName: 'team',
        betCount: 0,
        statusClass: '',
        totalCal: 0,
        totalRunning: 0,
        totalHide: 0,
        originalStatus: '',
        originalScreenshot: '',
        screenShot: '',
        confirmBy: '',
        mismatchClass: ''
    }

    const deadheatMatch = _.cloneDeep(team);
    deadheatMatch.orId = '2';
    deadheatMatch.teamId = 200;
    deadheatMatch.isDeadheat = true;
    deadheatMatch.teamName = "deadheatMatch";
    const nonDeadHeatMatch = _.cloneDeep(team);
    nonDeadHeatMatch.orId = '3';
    nonDeadHeatMatch.teamId = 300;
    nonDeadHeatMatch.isDeadheat = false;
    nonDeadHeatMatch.teamName = "nonDeadHeatMatch";


    it('ExistRunningStatus - return false when exist match running', () => {
        team.status = "Running";

        const actual = CalculateService.ExistRunningStatus([team]);

        expect(actual).toBeTruthy();
    });

    describe("VerifyDeadHeatNoSet", () => {
        it("should return true when exist both deadheat and non-deadheat won match", () => {
            const actual = CalculateService.VerifyDeadHeatNoSet([deadheatMatch, nonDeadHeatMatch], []);

            expect(actual).toBeTruthy();
        });

        it("should return true when exist deadheat settle and non-deadheat selected", () => {
            const actual = CalculateService.VerifyDeadHeatNoSet([nonDeadHeatMatch], [deadheatMatch]);

            expect(actual).toEqual("");
        });

        it("should return false when exist deadheat", () => {
            const actual = CalculateService.VerifyDeadHeatNoSet([deadheatMatch], [nonDeadHeatMatch]);

            expect(actual).not.toEqual("");
        });

        it("should return false when exist deadheat selected and deadheat settled", () => {
            const actual = CalculateService.VerifyDeadHeatNoSet([deadheatMatch], [deadheatMatch]);

            expect(actual).not.toEqual("");
        });

        it("should return false when exist deadheat settled and non-deadheat settled", () => {
            const actual = CalculateService.VerifyDeadHeatNoSet([team], [deadheatMatch, nonDeadHeatMatch]);

            expect(actual).not.toEqual("");
        });

        test.each([[[deadheatMatch, deadheatMatch], []],
        [[nonDeadHeatMatch, nonDeadHeatMatch], []],
        [[nonDeadHeatMatch], [nonDeadHeatMatch]]])('should return false', (teamSelected: Team[], teamSettled: Team[]) => {
            const actual = CalculateService.VerifyDeadHeatNoSet(teamSelected, teamSettled);

            expect(actual).not.toEqual("");
        });
    });

    it('MessageInconsistentDeadheat - should return message', () => {
        team.teamName = "Team";
        deadheatMatch.teamName = "DeadHeatMatch";
        const expected = Language.Outright.inconsistentDeadheat.replace('{0}', "<br/>Team | DeadHeatMatch");

        const actual = CalculateService.MessageInconsistentDeadheat([team, deadheatMatch], Language.Outright.inconsistentDeadheat);

        expect(actual).toEqual(expected);
    });

    test.each([
        [[deadheatMatch, nonDeadHeatMatch], [], false],
        [[deadheatMatch], [], true],
        [[nonDeadHeatMatch], [], false],
        [[deadheatMatch], [nonDeadHeatMatch], false]])('VerifyOnlyOneTeamWon - should return true when exist only one team deadHeat', (teams: Team[], teamSettled: Team[], expected: boolean) => {
            const actual = CalculateService.VerifyOnlyOneTeamWon(teams, teamSettled);

            expect(actual).toBe(expected);
        });

    describe("VerifyNonDeadheat", () => {
        it('should return true when exist one team won selected and one team won settled', () => {
            const actual = CalculateService.VerifyNonDeadheat([nonDeadHeatMatch], [nonDeadHeatMatch]);

            expect(actual).toBeTruthy();
        });
        it('should return true when exist more than one team won selected', () => {
            const actual = CalculateService.VerifyNonDeadheat([nonDeadHeatMatch, nonDeadHeatMatch], [deadheatMatch]);

            expect(actual).toBeTruthy();
        });

        it('should return false  when exist team deadheat select', () => {
            const actual = CalculateService.VerifyNonDeadheat([deadheatMatch, nonDeadHeatMatch], [deadheatMatch]);

            expect(actual).toBeFalsy();
        });

        it('should return false  when non selected team won', () => {
            const actual = CalculateService.VerifyNonDeadheat([], [deadheatMatch]);

            expect(actual).toBeFalsy();
        });
    });

    it('teamWonSettled - should return team won settled', () => {
        team.oddsStatus = Status.completed;
        team.status = Status.won;
        
        const actual = CalculateService.teamWonSettled([nonDeadHeatMatch], [team]);

        expect(actual).toEqual([team]);
    });

    describe('VerifyDeadHeatYesSetting', () => {
        it('should return empty string when the dead heat setting is correct', () => {
            const actual = CalculateService.VerifyDeadHeatYesSetting([], [deadheatMatch]);
    
            expect(actual).toEqual('');
        });
    
        it('should return message when the dead heat setting is incorrect', () => {
        
            const expected = CalculateService.MessageInconsistentDeadheat([deadheatMatch, deadheatMatch], Language.Outright.inconsistentDeadheat);
            const actual = CalculateService.VerifyDeadHeatYesSetting([deadheatMatch], [deadheatMatch]);
    
            expect(actual).toEqual(expected);
        });

        it('should return message when select teams without Deadheat', () => {
        
            const expected = CalculateService.MessageInconsistentDeadheat([nonDeadHeatMatch, nonDeadHeatMatch], Language.Outright.incorrectDeadHeatSetting);
            const actual = CalculateService.VerifyDeadHeatYesSetting([nonDeadHeatMatch, nonDeadHeatMatch], []);
    
            expect(actual).toEqual(expected);
        });

        it('should return message when select team without Deadheat and exist team settled with dead heat', () => {
        
            const expected = CalculateService.MessageInconsistentDeadheat([nonDeadHeatMatch, deadheatMatch], Language.Outright.incorrectDeadHeatSetting);
            const actual = CalculateService.VerifyDeadHeatYesSetting([nonDeadHeatMatch], [deadheatMatch]);
    
            expect(actual).toEqual(expected);
        });

        it('should return message when select both team with and without Deadheat ', () => {
        
            const expected = CalculateService.MessageInconsistentDeadheat([nonDeadHeatMatch, deadheatMatch], Language.Outright.incorrectDeadHeatSetting);
            const actual = CalculateService.VerifyDeadHeatYesSetting([nonDeadHeatMatch, deadheatMatch], []);
    
            expect(actual).toEqual(expected);
        });
    });

    describe('VerifyDeadHeatNOSetting', () => {
        it('should return empty string when the dead heat setting is correct', () => {
            const actual = CalculateService.VerifyDeadHeatNoSetting([nonDeadHeatMatch], [nonDeadHeatMatch]);
    
            expect(actual).toEqual('');
        });
    
        it('should return message when select team won with deadheat', () => {
        
            const expected = CalculateService.MessageInconsistentDeadheat([deadheatMatch], Language.Outright.incorrectDeadHeatSetting);
            const actual = CalculateService.VerifyDeadHeatNoSetting([deadheatMatch], []);
    
            expect(actual).toEqual(expected);
        });

        it('should return message when exist team settle with dead heat', () => {
        
            const expected = CalculateService.MessageInconsistentDeadheat([nonDeadHeatMatch, deadheatMatch], Language.Outright.inconsistentDeadheat);
            const actual = CalculateService.VerifyDeadHeatNoSetting([nonDeadHeatMatch], [deadheatMatch]);
    
            expect(actual).toEqual(expected);
        });

    });
});