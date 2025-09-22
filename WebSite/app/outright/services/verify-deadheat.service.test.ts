import { VerifyDeadHeatService } from './verify-deadheat.service';
import { Team } from '../models';
import * as _ from 'lodash';

describe('VerifyDeadHeatService', () => {
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
    confirmedBy: 0,
    mismatchClass: '',
    traderConfirmClass: '',
    traderScore: '',
    originalTraderScore: '',
    resultStatusId: 1
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

  describe('VerifyDeadheatSettingYes', () => {
    it('should return true when teamWonDeadHeatSelected is not empty and teamSettledDeadHeat is not empty', () => {
      const result = VerifyDeadHeatService.VerifyDeadheatSettingYes([deadheatMatch], [deadheatMatch]);

      expect(result).toBe(true);
    });

    it('should return true when teamWonDeadHeatSelected is not empty and teamSettledNoneDeadHeat is not empty', () => {
      const result = VerifyDeadHeatService.VerifyDeadheatSettingYes([deadheatMatch], [nonDeadHeatMatch]);

      expect(result).toBe(true);
    });

    it('should return true when teamWonNonDeadHeatSelected is not empty and teamSettledDeadHeat is not empty', () => {
      const result = VerifyDeadHeatService.VerifyDeadheatSettingYes([nonDeadHeatMatch], [deadheatMatch]);

      expect(result).toBe(true);
    });

    it('should return false when teamWonDeadHeatSelected, teamSettledDeadHeat, and teamSettledNoneDeadHeat are all empty', () => {
      const result = VerifyDeadHeatService.VerifyDeadheatSettingYes([nonDeadHeatMatch], [nonDeadHeatMatch]);

      expect(result).toBe(false);
    });
  });

  describe('VerifyDeadheatSettingNo', () => {
    it('should return true when teamWonNonDeadHeatSelected is not empty and teamSettledDeadHeat is not empty', () => {
      const result = VerifyDeadHeatService.VerifyDeadheatSettingNo([nonDeadHeatMatch], [deadheatMatch]);

      expect(result).toBe(true);
    });

    it('should return false when teamWonNonDeadHeatSelected and teamSettledDeadHeat are both empty', () => {
      const result = VerifyDeadHeatService.VerifyDeadheatSettingNo([nonDeadHeatMatch], [nonDeadHeatMatch]);

      expect(result).toBe(false);
    });
  });
});