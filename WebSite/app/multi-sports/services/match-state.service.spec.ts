import { TestBed } from "@angular/core/testing";
import { IntervalScorePipe } from "../../shared/pipes/interval-score.pipe";
import { MatchStateService } from "./match-state.service";
import { BackGroundService } from "./back-ground.service";
import { BackgroundColor, EventStatus, ResultType, SportType } from "../../shared/constants";
import { AutoSetting, MoreScore, Remark, Score } from "../../shared/models";
import { Match } from "../models";
import { Permission } from "../models/permission.model";

describe('MatchStateService', () => {
  let service: MatchStateService;
  let intervaleScorePipe: IntervalScorePipe;
  let backGroundService: BackGroundService;
  let permission: Permission = {
    canViewSettlementLog: false,
    canCalculate: false,
    canUncalculate: false,
    canRefund: false,
    canAutoPayout: false,
    canMarkPending: false,
    canMarkUnDecided: false,
    isTrader: false,
    isLeader: false
  }
  const match: Match = {
    matchId: "",
    matchCode: "",
    kickOffTime: undefined,
    homeName: "",
    awayName: "",
    moreScores: new MoreScore,
    halfTimeHomeScore: 0,
    halfTimeAwayScore: 0,
    finalHomeScore: 0,
    finalAwayScore: 0,
    eventStatus: "running",
    newEventStatus: "",
    originalEventStatus: "",
    suspenderHalfTime: "",
    suspenderFullTime: "",
    remark: new Remark,
    sportType: 0,
    intervalScore: [],
    isCalculatingSingle: 0,
    isCalculatingMP: 0,
    isExistRunningTicket: false,
    isExistMarkedTicket: false,
    eventStatusColor: "",
    isCalculated: false,
    isCalRefund: false,
    isHalfTimeCal: false,
    showLink: false,
    isMultiCaled: false,
    isRefund: false,
    earlySettleStatus: "",
    betStatus: "",
    isHavingIntervalScore: false,
    homeTotalGames: 0,
    awayTotalGames: 0,
    leagueId: 0,
    exHalfTimeScore: "",
    exFullTimeScore: "",
    autoPayoutStatus: 0,
    autoInstantStatus: 0,
    isExistsConfirmedEarly: false,
    bestOfMap: 0,
    isMatchBOMThirty: false,
    earlySettleBackground: "",
    isNotConsistentExFtScore: false,
    isNotConsistentExHtScore: false,
    confirmFullTimeScore: "",
    confirmHalfTimeScore: "",
    offerLive: false,
    applyDirect: false,
    autoCalcSetting: new AutoSetting,
    refundWaitingTime: 0,
    mercyAbandonedInfo: "",
    hasFailedResource: false,
    hasProviderHT: false,
    hasProviderFT: false,
    resourceIdsHasTicket: [],
    apGroup: null
  }
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IntervalScorePipe,
        BackGroundService,
        MatchStateService
      ],
    });

    intervaleScorePipe = TestBed.inject(IntervalScorePipe);
    backGroundService = TestBed.inject(BackGroundService);
    service = TestBed.inject(MatchStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each([
    [true, false, false, false, BackgroundColor.undecidedRow],
    [false, true, false, false, BackgroundColor.undecidedRow],
    [false, false, true, false, BackgroundColor.undecidedRow],
    [false, false, false, true, BackgroundColor.undecidedRow],
    [false, false, false, false, ""]])('getUndecidedColor - Should return undecided class when match undecided', (isMtdHold: boolean, isUndecided: boolean, isUnderSettle: boolean, isKeyHold: boolean, expected: string) => {
      const remark: Remark = {
        isPending: false,
        isUndecided: isUndecided,
        isUnderSettle: isUnderSettle,
        isMtdHold: isMtdHold,
        isKeyHold: isKeyHold
      };

      const actual = service.getUndecidedColor(remark);

      expect(actual).toEqual(expected);
    });

  describe('getBackgroundAutoSetting', () => {
    it('should return background settings with link enabled and status completed', () => {
      match.autoPayoutStatus = 2;
      permission.canAutoPayout = true;

      const result = service.getBackgroundAutoSetting(match, permission, true);

      expect(result).toBe('code-link auto-setting-completed');
    });

    it('should return background settings with link disabled and status failed', () => {
      match.autoPayoutStatus = 3;
      permission.canAutoPayout = true;

      const result = service.getBackgroundAutoSetting(match, permission, true);

      expect(result).toBe('code-link auto-setting-failed');
    });

    it('should return background settings with link disabled and status completed for auto-instant', () => {
      match.autoInstantStatus = 2;
      permission.canAutoPayout = true;

      const result = service.getBackgroundAutoSetting(match, permission, false);

      expect(result).toBe(' auto-setting-completed');
    });

    it('should return background settings with link disabled and status failed for auto-instant', () => {
      match.autoInstantStatus = 3;
      permission.canAutoPayout = true;

      const result = service.getBackgroundAutoSetting(match, permission, false);

      expect(result).toBe(' auto-setting-failed');
    });
  })

  describe("ResultConfirmedBackGround", () => {
    it('returns Background with match have interval score and exist score confirmed', () => {
      match.intervalScore = [new Score('1', '1', '', true, true)];
      match.isHavingIntervalScore = true;
      const actual = service.ResultConfirmedBackGround(match, "");

      expect(actual).toEqual(BackgroundColor.resultConfirmed);
    });

    it('return empty with match have interval score and not  exist score confirmed', () => {
      match.intervalScore = [new Score('1', '1', '', false, false)];
      match.isHavingIntervalScore = true;

      const actual = service.ResultConfirmedBackGround(match, "");

      expect(actual).toEqual("");
    });

    it('return empty with match not have interval score and not exist score confirmed', () => {
      intervaleScorePipe.transform = jest.fn().mockReturnValue([new Score('1', '1', '', false, false)]);
      match.isHavingIntervalScore = false;

      const actual = service.ResultConfirmedBackGround(match, "");

      expect(actual).toEqual("");
    });

    it('return empty with match have interval score and not  exist score confirmed', () => {
      intervaleScorePipe.transform = jest.fn().mockReturnValue([new Score('1', '1', '', true, true)]);
      match.isHavingIntervalScore = false;

      const actual = service.ResultConfirmedBackGround(match, "");

      expect(actual).toEqual(BackgroundColor.resultConfirmed);
    });
  });


  describe('getTotalHomeGames', () => {
    it('return HalfTime from more score when match have total game and score in resultDetail', () => {
      match.sportType = ResultType.havingTotalGames.filter(item => ResultType.scoreInResultDetail.includes(item))[0];
      match.moreScores.halfTimeScore = new Score('1', '2');

      const actual = service.getTotalHomeGames(match);

      expect(actual).toEqual("1");
    });

    it('return HalfTime from Match when match have total game and score not in resultDetail', () => {
      match.sportType = ResultType.havingTotalGames.find(item => !ResultType.scoreInResultDetail.includes(item));
      match.moreScores.halfTimeScore = new Score('1', '2');
      match.homeTotalGames = 2;

      const actual = service.getTotalHomeGames(match);

      expect(actual).toEqual("2");
    });

    it('return dash  when match not have total point', () => {
      match.sportType = 1;
      match.moreScores.halfTimeScore = new Score('1', '2');
      match.homeTotalGames = 2;

      const actual = service.getTotalHomeGames(match);

      expect(actual).toEqual("-");
    });
  });


  describe('getTotalAwayGames', () => {
    it('return HalfTime from more score when match have total game and score in resultDetail', () => {
      match.sportType = ResultType.havingTotalGames.filter(item => ResultType.scoreInResultDetail.includes(item))[0];
      match.moreScores.halfTimeScore = new Score('1', '2');

      const actual = service.getTotalAwayGames(match);

      expect(actual).toEqual("2");
    });

    it('return HalfTime from Match when match have total game and score not in resultDetail', () => {
      match.sportType = ResultType.havingTotalGames.find(item => !ResultType.scoreInResultDetail.includes(item));
      match.moreScores.halfTimeScore = new Score('1', '2');
      match.awayTotalGames = 1;

      const actual = service.getTotalAwayGames(match);

      expect(actual).toEqual("1");
    });

    it('return dash  when match not have total point', () => {
      match.sportType = 1;
      match.moreScores.halfTimeScore = new Score('1', '2');
      match.awayTotalGames = 2;

      const actual = service.getTotalAwayGames(match);

      expect(actual).toEqual("-");
    });
  });

  describe('isHalfTimeConfirmed', () => {
    it('should return true when basketball match has half time score confirmed with interval sport', () => {
      match.sportType = 2;
      match.moreScores = new MoreScore();
      match.moreScores.halfTimeScore = new Score('-', '-');
      match.moreScores.halfTimeScore.isConfirmed = true;
      match.moreScores.halfTimeScore.isNotSettled = true;

      const result = service.isHalfTimeConfirmed(match);

      expect(result).toBe(true);
    });

    it('should return true when match has half time score confirmed with other sport', () => {
      match.sportType = 49;
      match.suspenderHalfTime = 'abc';
      match.halfTimeHomeScore = 1;
      match.halfTimeAwayScore = 0;
      match.isHalfTimeCal = false;
      match.isCalRefund = false;

      const result = service.isHalfTimeConfirmed(match);

      expect(result).toBe(true);
    });

    it('should return false when sport not supported', () => {
      match.sportType = 1;

      const result = service.isHalfTimeConfirmed(match);

      expect(result).toBeFalsy();
    });
  });

  describe('isFinalConfirmed', () => {
    it('should return true when final score is confirmed with interval sport', () => {
      match.sportType = 2;
      match.moreScores = new MoreScore();
      match.moreScores.finalScore = new Score('-', '-');
      match.moreScores.finalScore.isConfirmed = true;
      match.moreScores.finalScore.isNotSettled = true;

      const result = service.isFinalConfirmed(match);

      expect(result).toBe(true);
    });

    it('should return true when final score is confirmed with other sports', () => {
      match.sportType = 25;
      match.suspenderFullTime = 'abc';
      match.finalHomeScore = 1;
      match.finalAwayScore = 0;
      match.isCalculated = false;
      match.isCalRefund = false;

      const result = service.isFinalConfirmed(match);

      expect(result).toBe(true);
    });

    it('should return false when sport not supported', () => {
      match.sportType = 1;

      const result = service.isFinalConfirmed(match);

      expect(result).toBeFalsy();
    });
  });

  describe('getHalfTimeHomeScore', () => {
    it('should return dash when score is hidden', () => {
      match.sportType = 49;
      match.isHalfTimeCal = false;
      match.isCalRefund = false;
      permission.isLeader = false;

      const result = service.getHalfTimeHomeScore(match, permission);

      expect(result).toEqual('-');
    });

    it('should return half time score by more score', () => {
      match.sportType = SportType.basketBall;
      match.moreScores.halfTimeScore = new Score('1', '-');
      permission.isLeader = true;

      const result = service.getHalfTimeHomeScore(match, permission);

      expect(result).toEqual('1');
    });

    it('should return half time home score', () => {
      match.sportType = SportType.football;
      match.halfTimeHomeScore = 2;
      permission.isLeader = true;

      const result = service.getHalfTimeHomeScore(match, permission);

      expect(result).toEqual('2');
    });

    it('should return dash when match not support half time score', () => {
      match.sportType = SportType.sepakTakraw;
      permission.isLeader = true;

      const result = service.getHalfTimeHomeScore(match, permission);

      expect(result).toEqual('-');
    });
  });

  describe('getHalfTimeAwayScore', () => {
    it('should return dash when score is hidden', () => {
      match.sportType = 49;
      match.isHalfTimeCal = false;
      match.isCalRefund = false;
      permission.isLeader = false;

      const result = service.getHalfTimeAwayScore(match, permission);

      expect(result).toEqual('-');
    });

    it('should return half time score by more score', () => {
      match.sportType = SportType.basketBall;
      match.moreScores.halfTimeScore = new Score('1', '0');
      permission.isLeader = true;

      const result = service.getHalfTimeAwayScore(match, permission);

      expect(result).toEqual('0');
    });

    it('should return half time away score', () => {
      match.sportType = SportType.football;
      match.halfTimeAwayScore = 0;
      permission.isLeader = true;

      const result = service.getHalfTimeAwayScore(match, permission);

      expect(result).toEqual('0');
    });

    it('should return dash when match not support half time score', () => {
      match.sportType = SportType.sepakTakraw;
      permission.isLeader = true;

      const result = service.getHalfTimeAwayScore(match, permission);

      expect(result).toEqual('-');
    });
  });

  describe('isHideHtScore', () => {
    it('should return false if sport type is not in havingHalfTimeConfirmedStatus', () => {
      match.sportType = 1;

      const result = service.isHideHtScore(match, permission);

      expect(result).toBeFalsy();
    });

    it('should return false if isLeader is true', () => {
      match.sportType = ResultType.havingHalfTimeConfirmedStatus[0];
      permission.isLeader = true;

      const result = service.isHideHtScore(match, permission);

      expect(result).toBeFalsy();
    });

    it('should return false if halfTime calculated', () => {
      match.sportType = ResultType.havingHalfTimeConfirmedStatus[0];
      permission.isLeader = false;
      match.isHalfTimeCal = true;

      const result = service.isHideHtScore(match, permission);

      expect(result).toBeFalsy();
    });

    it('should return false when isCalRefund flag is true', () => {
      match.sportType = ResultType.havingHalfTimeConfirmedStatus[0];
      permission.isLeader = false;
      match.isHalfTimeCal = false;
      match.isCalRefund = true;

      const result = service.isHideHtScore(match, permission);

      expect(result).toBeFalsy();
    });

    it('should return false if event status is refund halfTime', () => {
      match.sportType = ResultType.havingHalfTimeConfirmedStatus[0];
      permission.isLeader = false;
      match.isHalfTimeCal = false;
      match.isCalRefund = false;
      match.eventStatus = EventStatus.refundHalftime;

      const result = service.isHideHtScore(match, permission);

      expect(result).toBeFalsy();
    });

    it('should return false when score is Refund', () => {
      match.sportType = ResultType.havingHalfTimeConfirmedStatus.filter(s => ResultType.scoreInResultDetail.includes(s))[0];
      permission.isLeader = false;
      match.isHalfTimeCal = false;
      match.isCalRefund = false;
      match.eventStatus = "";
      match.moreScores = new MoreScore();
      match.moreScores.halfTimeScore = new Score("R", "", "");

      const result = service.isHideHtScore(match, permission);

      expect(result).toBeFalsy();
    });

    it('should return true when pass all condition', () => {
      match.sportType = ResultType.havingHalfTimeConfirmedStatus.filter(s => ResultType.scoreInResultDetail.includes(s))[0];
      permission.isLeader = false;
      match.isHalfTimeCal = false;
      match.isCalRefund = false;
      match.eventStatus = "";
      match.moreScores = new MoreScore();
      match.moreScores.halfTimeScore = new Score("1", "1", "");

      const result = service.isHideHtScore(match, permission);

      expect(result).toBeTruthy();
    });
  });

  describe('getFinalHomeScore', () => {
    it('should return dash when score is hidden', () => {
      match.sportType = 25;
      match.isCalRefund = false;
      match.isCalRefund = false;
      permission.isLeader = false;

      const result = service.getFinalHomeScore(match, permission);

      expect(result).toEqual('-');
    });

    it('should return final home score by more score', () => {
      match.sportType = SportType.basketBall;
      match.moreScores.finalScore = new Score('2', '3', '');
      permission.isLeader = true;


      const result = service.getFinalHomeScore(match, permission);

      expect(result).toEqual('2');
    });

    it('should return final home score', () => {
      match.sportType = SportType.football;
      match.finalHomeScore = 1;
      permission.isLeader = true;

      const result = service.getFinalHomeScore(match, permission);

      expect(result).toEqual('1');
    });
  });

  describe('getFinalAwayScore', () => {
    it('should return dash when score is hiden', () => {
      match.sportType = 25;
      match.isCalRefund = false;
      match.isCalRefund = false;
      permission.isLeader = false;

      const result = service.getFinalAwayScore(match, permission);

      expect(result).toEqual('-');
    });

    it('should return final away score by more score', () => {
      match.sportType = SportType.basketBall;
      match.moreScores = new MoreScore();
      match.moreScores.finalScore = new Score("1", "3");

      permission.isLeader = true;

      const result = service.getFinalAwayScore(match, permission);

      expect(result).toEqual('3');
    });

    it('should return final away score', () => {
      match.sportType = SportType.football;
      match.finalAwayScore = 2;
      permission.isLeader = true;

      const result = service.getFinalAwayScore(match, permission);

      expect(result).toEqual('2');
    });
  });

  describe('isHideFinalScore', () => {
    it('should return false if sport type is neither in havingConfirmedStatus nor in havingHalfTimeConfirmedStatus', () => {
      match.sportType = 1;

      const result = service.isHideFinalScore(match, permission);

      expect(result).toBeFalsy();
    });

    it('should return false if isLeader is true', () => {
      match.sportType = ResultType.havingHalfTimeConfirmedStatus[0];
      permission.isLeader = true;

      const result = service.isHideFinalScore(match, permission);

      expect(result).toBeFalsy();
    });

    it('should return false if match calculated', () => {
      match.sportType = ResultType.havingHalfTimeConfirmedStatus[0];
      permission.isLeader = false;
      match.isCalculated = true;

      const result = service.isHideFinalScore(match, permission);

      expect(result).toBeFalsy();
    });

    it('should return false when isCalRefund flag is true', () => {
      match.sportType = ResultType.havingHalfTimeConfirmedStatus[0];
      permission.isLeader = false;
      match.isCalculated = false;
      match.isCalRefund = true;

      const result = service.isHideFinalScore(match, permission);

      expect(result).toBeFalsy();
    });

    it('should return true when pass all condition', () => {
      match.sportType = ResultType.havingHalfTimeConfirmedStatus[0];
      permission.isLeader = false;
      match.isCalculated = false;
      match.isCalRefund = false;

      const result = service.isHideFinalScore(match, permission);

      expect(result).toBeTruthy();
    });
  });


  it('canAutoSettlement - return true when sport supports auto settlement', () => {
    const result = service.canAutoSettlement(ResultType.autoSettleSupported[0]);

    expect(result).toBeTruthy();
  });

  describe('getEarlySettleBackground', () => {
    it('should return background running when early settle is running', () => {
      match.earlySettleStatus = 'running';
      match.eventStatus = 'completed';

      const result = service.getEarlySettleBackground(match, "");

      expect(result).toEqual(' bg-auto-settle-running');
    });

    it('should return background blinking when early confirmed, earlyOver and 1 other Over Status option selected.', () => {
      match.isExistsConfirmedEarly = true;
      match.earlySettleStatus = 'running';
    

      const result = service.getEarlySettleBackground(match, "1,3");

      expect(result).toEqual('bg-green-blinking bg-auto-settle-running');
    });

    it('should return background not blinking when early confirmed but filter only earlyOver', () => {
      match.isExistsConfirmedEarly = true;
      match.earlySettleStatus = 'running';

      const result = service.getEarlySettleBackground(match, "1");

      expect(result).toEqual(' bg-auto-settle-running');
    });

    it('should return background calculated when early settle is completed', () => {
      match.isExistsConfirmedEarly = false;
      match.earlySettleStatus = 'completed';

      const result = service.getEarlySettleBackground(match, "");

      expect(result).toEqual(' bg-calculated');
    });

    it('should return empty when early settle status is null', () => {
      match.isExistsConfirmedEarly = false;
      match.earlySettleStatus = null;

      const result = service.getEarlySettleBackground(match, "");

      expect(result).toEqual(' ');
    });
  });

  describe('isShowEarlySettleLink', () => {
    test.each([
      [true, false, false],
      [false, true, false],
      [false, false, true],
    ])('should show early settle link has permission settle', (canRefund: boolean, canUncalculate: boolean, canCalculate: boolean) => {
      match.showLink = true;
      match.sportType = SportType.eSports;
      const permission = new Permission();
      permission.canCalculate = canUncalculate;
      permission.canUncalculate = canCalculate;
      permission.canRefund = canRefund;
      backGroundService.isShowLink = jest.fn().mockReturnValue(true);


      const result = service.isShowEarlySettleLink(match, permission);

      expect(result).toEqual(BackgroundColor.codeLink);
    });

    it('should hide refund link when has permission trader and match is cricket', () => {
      const permission = new Permission();
      permission.isTrader = true;
      match.sportType = SportType.cricket;
      backGroundService.isShowLink = jest.fn().mockReturnValue(true);

      const result = service.isShowEarlySettleLink(match, permission);

      expect(result).toEqual(BackgroundColor.codeLink);
    });

    it('should hide early settle link when validate failed', () => {
      const permission = new Permission();
      permission.canCalculate = true;
      backGroundService.isShowLink = jest.fn().mockReturnValue(false);

      const result = service.isShowEarlySettleLink(match, permission);

      expect(result).toEqual('');
    });

    it('should hide early settle link when missing permission', () => {
      permission = new Permission();
      backGroundService.isShowLink = jest.fn().mockReturnValue(true);

      const result = service.isShowEarlySettleLink(match, permission);

      expect(result).toEqual('');
    });
  });

  describe('isShowCalculationLink', () => {
    it('should show calculating link when has permission', () => {
      match.sportType = SportType.eSports;
      const permission = new Permission();
      permission.canCalculate = true;
      backGroundService.isShowLink = jest.fn().mockReturnValue(true);

      const result = service.isShowCalculationLink(match, permission);

      expect(result).toEqual(BackgroundColor.codeLink);
    });

    it('should show calculating link when has permission trader and sport cricket', () => {
      match.sportType = SportType.cricket;
      const permission = new Permission();
      permission.canCalculate = false;
      permission.isTrader = true;
      backGroundService.isShowLink = jest.fn().mockReturnValue(true);

      const result = service.isShowCalculationLink(match, permission);

      expect(result).toEqual(BackgroundColor.codeLink);
    });

    it('should hide calculation link when missing permission', () => {
      const permission = new Permission();
      permission.canCalculate = false;
      backGroundService.isShowLink = jest.fn().mockReturnValue(true);

      const result = service.isShowCalculationLink(match, permission);

      expect(result).toEqual('');
    });

    it('should hide calculation link when failed validation show link', () => {
      const permission = new Permission();
      permission.canCalculate = true;
      backGroundService.isShowLink = jest.fn().mockReturnValue(false);

      const result = service.isShowCalculationLink(match, permission);

      expect(result).toEqual('');
    });
  });

  describe('isShowRefundLink', () => {
    it('should show refund link when has permission refund', () => {
      match.sportType = SportType.eSports;
      const permission = new Permission();
      permission.canRefund = true;
      
      backGroundService.isShowLink = jest.fn().mockReturnValue(true);

      const result = service.isShowRefundLink(match, "1",permission, "");

      expect(result).toEqual(BackgroundColor.codeLink);
    });

    it('should hide refund link when missing permission', () => {
      const permission = new Permission();
      
      backGroundService.isShowLink = jest.fn().mockReturnValue(true);

      const result = service.isShowRefundLink(match, "1",permission, "");

      expect(result).toEqual('');
    });

    it('should hide refund link when failed validation show link', () => {
      const permission = new Permission();
      permission.canCalculate = true;
      
      backGroundService.isShowLink = jest.fn().mockReturnValue(false);

      const result = service.isShowRefundLink(match, "1",permission, "");

      expect(result).toEqual('');
    });

    it('should hide refund link when disable link', () => {
      const permission = new Permission();
      permission.canCalculate = true;
      
      backGroundService.isShowLink = jest.fn().mockReturnValue(false);

      const result = service.isShowRefundLink(match, "",permission, "");

      expect(result).toEqual('');
    });
  });

  describe('getCalcColumnColor', () => {
    it('should return background calculated when match is calculated', () => {
      match.isCalculated = true;

      const result = service.getCalcColumnColor(match);

      expect(result).toEqual(BackgroundColor.calculated);
    });

    it('should return background half time calculated when half time is calculated', () => {
      match.isCalculated = false;
      match.isHalfTimeCal = true;

      const result = service.getCalcColumnColor(match);

      expect(result).toEqual(BackgroundColor.halfTimeCalculated);
    });

    it('should return background refund when match is refunded', () => {
      match.isHalfTimeCal = false;
      match.isCalRefund = true;

      const result = service.getCalcColumnColor(match);

      expect(result).toEqual(BackgroundColor.calRefund);
    });
  });


  describe('getRemarkStatusTooltip', () => {
    it('should return tooltip when all status are marked', () => {
      const remark: Remark = {
        isKeyHold: true,
        isMtdHold: true,
        isPending: true,
        isUndecided: true,
        isUnderSettle: true,
      };

      const result = service.getRemarkStatusTooltip(remark);
      const expected = "MTD. Hold\nUndecided\nResult Pending\nUnder Settlement\nHold Key\n";

      expect(result).toEqual(expected);
    });

    it('should return empty tooltip when all status are not marked', () => {
      const remark = new Remark();

      const result = service.getRemarkStatusTooltip(remark);

      expect(result).toEqual('');
    });
  });

  describe('isChangeSetting', () => {
    it('should return true when having permission and match is not calculating', () => {
      match.isCalculatingSingle = null;
      match.isCalculatingMP = null;

      const result = service.isChangeSetting(match);

      expect(result).toBe(true);
    });

    describe('should return false', () => {
      beforeEach(() => {
        match.isCalculatingSingle = null;
      });

      it('when match is calculating single', () => {
        match.isCalculatingSingle = 1;

        const result = service.isChangeSetting(match);

        expect(result).toBe(false);
      });

      it('when match is waiting for single calculation', () => {
        match.isCalculatingSingle = 0;

        const result = service.isChangeSetting(match);

        expect(result).toBe(false);
      });

      it('when match is calculating MP', () => {
        match.isCalculatingMP = 1;

        const result = service.isChangeSetting(match);

        expect(result).toBe(false);
      });

      it('when match is waiting for MP calculation', () => {
        match.isCalculatingMP = 0;

        const result = service.isChangeSetting(match);

        expect(result).toBe(false);
      });
    });
  });


  describe('getAutoSetting', () => {
    beforeEach(() => {
      match.autoCalcSetting = new AutoSetting();
    });
    it('should return BOTH when match is both auto payout and direct payout', () => {
      match.autoCalcSetting.isAutoPayoutForMatch = true;
      match.autoCalcSetting.isDirectPayoutForMatch = true

      const result = service.getAutoSetting(match.autoCalcSetting);

      expect(result).toEqual("BOTH");
    });

    it('should return AUTO when match only access auto payout', () => {
      match.autoCalcSetting.isAutoPayoutForMatch = true;
      match.autoCalcSetting.isDirectPayoutForMatch = false;

      const result = service.getAutoSetting(match.autoCalcSetting);

      expect(result).toEqual("AUTO");
    });

    it('should return DIRECT when match only access direct payout', () => {
      match.autoCalcSetting.isAutoPayoutForMatch = false;
      match.autoCalcSetting.isDirectPayoutForMatch = true;

      const result = service.getAutoSetting(match.autoCalcSetting);

      expect(result).toEqual("DIRECT");
    });

    it('should return OFF when match when not access auto', () => {
      match.autoCalcSetting.isAutoPayoutForMatch = false;
      match.autoCalcSetting.isDirectPayoutForMatch = false;

      const result = service.getAutoSetting(match.autoCalcSetting);

      expect(result).toEqual("OFF");
    });
  });

  it.each([
    [true, false, false, false, false, "YES"],
    [false, true, false, false, false,"YES"],
    [false, false, true, false, false,"YES"],
    [false, false, false, true,false, "YES"],
    [false, false, false, false,true, "YES"],
    [false, false, false, false,false, "NO"]])('getRemarkState - Should return correct State', (isMtdHold: boolean, isUndecided: boolean, isUnderSettle: boolean, isKeyHold: boolean, isPending: boolean,expected: string) => {
      const remark: Remark = {
        isPending: isPending,
        isUndecided: isUndecided,
        isUnderSettle: isUnderSettle,
        isMtdHold: isMtdHold,
        isKeyHold: isKeyHold
      };

      const actual = service.getRemarkState(remark);

      expect(actual).toEqual(expected);
    });

  describe('getMercyAbandonedInfo', () => {
    it('should return default object when mercyAbandonedInfo is null', () => {
      const match = { mercyAbandonedInfo: null, eventStatus: 'Running' } as Match;
      const result = service.getMercyAbandonedInfo(match);
      
      expect(result).toEqual({
        isMercy: false,
        isAbandoned: false,
        otherInfo: "",
        position: ""
      });
    });

    it('should return default object when mercyAbandonedInfo is empty', () => {
      const match = { mercyAbandonedInfo: "", eventStatus: 'Running' } as Match;
      const result = service.getMercyAbandonedInfo(match);
      
      expect(result).toEqual({
        isMercy: false,
        isAbandoned: false,
        otherInfo: "",
        position: ""
      });
    });

    it('should return mercy info when mercyAbandonedInfo contains mercy', () => {
      const match = { mercyAbandonedInfo: "1:Mercy", eventStatus: 'Running' } as Match;
      const result = service.getMercyAbandonedInfo(match);
      
      expect(result).toEqual({
        isMercy: true,
        isAbandoned: false,
        otherInfo: "Mercy",
        position: "1"
      });
    });

    it('should return abandoned info when mercyAbandonedInfo contains abandoned', () => {
      const match = { mercyAbandonedInfo: "2:A", eventStatus: 'Running' } as Match;
      const result = service.getMercyAbandonedInfo(match);
      
      expect(result).toEqual({
        isMercy: false,
        isAbandoned: true,
        otherInfo: "A",
        position: "2"
      });
    });

    it('should handle other types of mercyAbandonedInfo', () => {
      const match = { mercyAbandonedInfo: "3:X", eventStatus: 'Running' } as Match;
      const result = service.getMercyAbandonedInfo(match);
      
      expect(result).toEqual({
        isMercy: false,
        isAbandoned: false,
        otherInfo: "X",
        position: "3"
      });
    });
  });

});

