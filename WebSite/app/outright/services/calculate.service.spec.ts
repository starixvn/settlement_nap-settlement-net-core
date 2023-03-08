import { Team, } from './../models';
import { CalculateService } from "./calculate.service";
import * as _ from 'lodash';
import { Language } from '../../shared/language.native';
import { Status } from '../constants';

describe('CalculateService', () => {
    const team: Team = {
        isDeadheat: false,
        disableDeadheat: false,
        isSettled: false,
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
        betCount: 0
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

    describe("VerifyDeadheat", () => {
        it("should return true when exist both deadheat and non-deadheat won match", () => {
            const actual = CalculateService.VerifyDeadheat([deadheatMatch, nonDeadHeatMatch], []);

            expect(actual).toBeTruthy();
        });

        it("should return true when exist deadheat settle and non-deadheat selected", () => {
            const actual = CalculateService.VerifyDeadheat([nonDeadHeatMatch], [deadheatMatch]);

            expect(actual).toBeTruthy();
        });

        it("should return true when exist deadheat selected and non-deadheat settled", () => {
            const actual = CalculateService.VerifyDeadheat([deadheatMatch], [nonDeadHeatMatch]);

            expect(actual).toBeTruthy();
        });

        it("should return true when exist deadheat selected and deadheat settled", () => {
            const actual = CalculateService.VerifyDeadheat([deadheatMatch], [deadheatMatch]);

            expect(actual).toBeTruthy();
        });

        it("should return true when exist deadheat settled and non-deadheat settled", () => {
            const actual = CalculateService.VerifyDeadheat([team], [deadheatMatch, nonDeadHeatMatch]);

            expect(actual).toBeTruthy();
        });

        test.each([[[deadheatMatch, deadheatMatch], []],
        [[nonDeadHeatMatch, nonDeadHeatMatch], []],
        [[nonDeadHeatMatch], [nonDeadHeatMatch]]])('should return false', (teamSelected: Team[], teamSettled: Team[]) => {
            const actual = CalculateService.VerifyDeadheat(teamSelected, teamSettled);

            expect(actual).toBeFalsy();
        });
    });

    it('MessageInconsistentDeadheat - should return message', () => {
        team.teamName = "Team";
        deadheatMatch.teamName = "DeadHeatMatch";
        const expected = Language.Outright.inconsistentDeadheat.replace('{0}', "<br/>Team | DeadHeatMatch | ");

        const actual = CalculateService.MessageInconsistentDeadheat([team, deadheatMatch]);

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

        expect(actual).toEqual(team);
    });
});