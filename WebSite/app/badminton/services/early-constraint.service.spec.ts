import { SportType } from './../../shared/constants/sport-type.native';
import { TestBed, inject, fakeAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { EarlyConstraintService } from './early-constraint.service';
import { MatchDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { ResultSettingModel } from '../../shared/models';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { InputType, VolleyballBetTypes } from '../constants';
import { Language } from '../../shared/language';
import * as _ from 'lodash';
describe('EarlyConstraintService', () => {
  let service: EarlyConstraintService = null;
  let resultByTeamNamePipe: ResultByTeamNamePipe;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EarlyConstraintService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        ResultByTeamNamePipe
      ],
      imports: [
        HttpClientModule,
      ],
    });
  });

  beforeEach(inject([EarlyConstraintService], (earlyConstraintService: EarlyConstraintService) => {
    service = earlyConstraintService;
    resultByTeamNamePipe = TestBed.inject(ResultByTeamNamePipe);
  }));

  it('should create a service', () => {
    expect(service).toBeTruthy();
  });

  describe('getGroupMapBySets', () => {
    const resultOne = new ResultDetail();
    const resultTwo = new ResultDetail();
    resultOne.map = 1;
    resultTwo.map = 2;
    resultOne.resultSettingData = new ResultSettingModel();
    resultTwo.resultSettingData = new ResultSettingModel();
    it('should return group map create by result map', () => {
      const actualResult = service.getGroupMapBySets([resultOne, resultTwo]);

      expect(actualResult.length).toEqual(2);
    });

    it('should return group map with isHoldResult define by result hold setting', () => {
      resultOne.resultSettingData.isHoldResult = true;
      const actualResult = service.getGroupMapBySets([resultOne, resultTwo]);

      expect(actualResult[0].isHoldResult).toBeTruthy();
      expect(actualResult[1].isHoldResult).toBeFalsy();
    });
  });

  describe('getGroupMapByGroupName', () => {
    const resultOne = new ResultDetail();
    const resultTwo = new ResultDetail();
    resultOne.groupName = "One";
    resultTwo.groupName = "Two";
    resultOne.resultSettingData = new ResultSettingModel();
    resultTwo.resultSettingData = new ResultSettingModel();
    it('should return group map create by result map', () => {
      const actualResult = service.getGroupMapByGroupName([resultOne, resultTwo]);

      expect(actualResult.length).toEqual(2);
    });

    it('should return group map with isHoldResult define by result hold setting', () => {
      resultOne.resultSettingData.isHoldResult = true;
      const actualResult = service.getGroupMapByGroupName([resultOne, resultTwo]);

      expect(actualResult[0].isHoldResult).toBeTruthy();
      expect(actualResult[1].isHoldResult).toBeFalsy();
    });
  });

  describe('getEarlyResultDetails', () => {
    const resultOne = new ResultDetail();
    const resultTwo = new ResultDetail();
    resultOne.betTypeName = "result One"
    it('should return result exist bet type name - Volleyball', () => {
      const actualResult = service.getEarlyResultDetails([resultOne, resultTwo], SportType.volleyBall, 0);

      expect(actualResult.length).toEqual(1);
    });

    it('should return resourceId higher than max length - Badminton', () => {
      resultOne.resourceId = "12";
      resultTwo.resourceId = "123";
      const actualResult = service.getEarlyResultDetails([resultOne, resultTwo], SportType.badminton, 2);

      expect(actualResult.length).toEqual(1);
      expect(actualResult[0].resourceId).toEqual("123");
    });
  });

  it('getConfirmMessage - should return correct message', () => {
    const resultOne = new ResultDetail();
    const resultTwo = new ResultDetail();
    resultOne.inputType = InputType.coupleScore;
    resultOne.homeValue = '1';
    resultOne.awayValue = '2';
    resultOne.betTypeName = "BetTypeOne";
    resultTwo.betTypeName = "BetTypeTwo";
    const matchDetail = new MatchDetail();
    matchDetail.homeName = "HomeName";
    matchDetail.awayName = "AwayName";

    spyOn(resultByTeamNamePipe, "transform").and.returnValue('ResultByPipe');
    const expected = `${Language.CalculationConfirmMessageEarly}<br/>` +
      'BetTypeOne: &nbspHomeName(1) - AwayName(2)<br/>' +
      'BetTypeTwo: ResultByPipe<br/>';

    const actual = service.getConfirmMessage([resultOne, resultTwo], matchDetail);

    expect(actual).toEqual(expected);
  });

  describe("verifyResultValueForBetType", () => {
    it('should verify both home and away value when result type is couple score', () => {
      const resultOne = new ResultDetail();
      resultOne.inputType = InputType.coupleScore;
      resultOne.homeValue = '1';
      resultOne.awayValue = '2';
      const resultTwo = new ResultDetail();
      resultTwo.inputType = InputType.coupleScore;
      resultTwo.homeValue = '1';
      resultOne.resourceId = '123';
      resultTwo.resourceId = '123';

      service.verifyResultValueForBetType([resultOne, resultTwo]);

      expect(resultOne.isResultWarning).toBeFalsy();
      expect(resultTwo.isResultWarning).toBeTruthy();
    });

    it('should verify only home value when result type is not couple score', () => {
      const resultOne = new ResultDetail();
      resultOne.homeValue = '1';
      const resultTwo = new ResultDetail();
      resultOne.resourceId = '123';
      resultTwo.resourceId = '123';

      service.verifyResultValueForBetType([resultOne, resultTwo]);

      expect(resultOne.isResultWarning).toBeFalsy();
      expect(resultTwo.isResultWarning).toBeTruthy();
    });
  });

  describe('verifyBeforeCalculation', () => {
    it('should return warning when exist result confirmed', async () => {
      const resultOne = new ResultDetail();
      const resultTwo = new ResultDetail();
      resultOne.resultSettingData = new ResultSettingModel();
      resultOne.resultSettingData.isConfirmedRefund = true;

      const actual = await service.verifyBeforeCalculation([resultOne, resultTwo], false);

      expect(actual).toEqual(Language.confirmRefund.calculateResultNotConfirmed);
    });

    it('should return warning when exist result invalid', async () => {
      const resultOne = new ResultDetail();
      const resultTwo = new ResultDetail();
      resultOne.resultSettingData = new ResultSettingModel();
      resultTwo.resultSettingData = new ResultSettingModel();
      resultOne.isResultWarning = true;

      const actual = await service.verifyBeforeCalculation([resultOne, resultTwo], false);
      const actualLeader = await service.verifyBeforeCalculation([resultOne, resultTwo], true);

      expect(actual).toEqual(Language.sop.nonLeader.blankResult);
      expect(actualLeader).toEqual(Language.sop.leader.blankResult);
    });

    it('should return warning when exist result invalid bet type value', async () => {
      const resultOne = new ResultDetail();
      const resultTwo = new ResultDetail();
      resultOne.resultSettingData = new ResultSettingModel();
      resultTwo.resultSettingData = new ResultSettingModel();
      resultOne.homeValue = '1';
      resultTwo.homeValue = '1';
      resultOne.awayValue = '1';
      resultOne.resourceId = `${VolleyballBetTypes.raceToPoints}5678`;

      const actual = await service.verifyBeforeCalculation([resultOne, resultTwo], false);

      expect(actual).toEqual(Language.sop.invalidResultByBetType);
    });

    it('should return empty when not exist result invalid', async () => {
      const resultOne = new ResultDetail();
      const resultTwo = new ResultDetail();
      resultOne.resultSettingData = new ResultSettingModel();
      resultTwo.resultSettingData = new ResultSettingModel();
      resultOne.homeValue = '1';
      resultTwo.homeValue = '1';

      const actual = await service.verifyBeforeCalculation([resultOne, resultTwo], false);

      expect(actual).toEqual("");
    });
  });


  it("isInvalidBetTypeValue - return true when exist result warning by Bettype", () => {
    const resultOne = new ResultDetail();
    const resultTwo = new ResultDetail();
    resultOne.isResultWarning = true;
    resultTwo.isResultWarningByBetType = true;

    const actual = service.isInvalidBetTypeValue([resultOne, resultTwo]);
    const actualTwo = service.isInvalidBetTypeValue([resultOne]);

    expect(actual).toBeTruthy();
    expect(actualTwo).toBeFalsy();
  });

  describe("isBetTypesResultInvalid", () => {
    const resultEarly = new ResultDetail();
    it("should return false when result invalid for early", () => {
      const resultOne = new ResultDetail();
      const resultTwo = new ResultDetail();
      resultOne.homeValue = '1';
      resultTwo.homeValue = '1';
      resultTwo.awayValue = '2';
      resultTwo.resourceId = '123';

      const actual = service.isBetTypesResultInvalid(resultOne);
      const actualTwo = service.isBetTypesResultInvalid(resultTwo);

      expect(actual).toBeFalsy();
      expect(actualTwo).toBeFalsy();
    });

    const cases = [['1', 'N', true], ['1', '1', true], ['6', '5', true], ['6', '8', true], ['6', '7', false], ['N', 'N', false]];
    test.each(cases)("return correct value with result race to point", (home, away, expected) => {
      resultEarly.homeValue = home.toString();
      resultEarly.awayValue = away.toString();
      resultEarly.resourceId = `${VolleyballBetTypes.raceToPoints}0007`;

      const actual = service.isBetTypesResultInvalid(resultEarly);

      expect(actual).toEqual(expected.toString() === "true");
    });

    const caseForPointsPlayed = [['1', 'N', true], ['1', '5', true], ['1', '7', false], ['N', 'N', false]];
    test.each(caseForPointsPlayed)("return correct value with result point played", (home, away, expected) => {
      resultEarly.homeValue = home.toString();
      resultEarly.awayValue = away.toString();
      resultEarly.resourceId = `${VolleyballBetTypes.pointsPlayed}0008`;

      const actual = service.isBetTypesResultInvalid(resultEarly);

      expect(actual).toEqual(expected.toString() === "true");
    });
  });
});
