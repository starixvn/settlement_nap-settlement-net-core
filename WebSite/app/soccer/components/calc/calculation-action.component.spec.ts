import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculationActionComponent } from './calculation-action.component';
import { CalculateService } from './services/calculate.service';
import { AioService, ClosePopupService, MessageBoxService } from '../../../shared/services';
import { GoalIconService } from './services/goal-icon.service';
import { CalculateStorage } from '../../storage/calculate.storage';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { VerifyScoreGoalService } from './services/verify-score-goal.service';
import { ScoreService } from './services/score.service';
import { VerifyActionService } from './services/verify-action.service';
import { RequestService } from './services/request.service';
import { GoalRecordWithSemicolonService } from './services/goal-record-with-semicolon.service';
import { Match, MatchDetail } from './models/match.model';
import { Permission } from '../../../shared/models/sportsbook-sop';
import { GoalIcon, ResultDetail } from '../../models';
import { ResourceIds } from '../../constants';
import { GoalRecordWithOutSemicolonService } from './services/goal-record-with-out-semicolon.service';
import { Language } from '../../../shared/language.native';

describe('CalculationActionComponent', () => {
  let component: CalculationActionComponent;
  let fixture: ComponentFixture<CalculationActionComponent>;
  let storage: CalculateStorage;
  let calculateService: CalculateService;
  let scoreService: ScoreService;

  const matchDetail = {
    ftStatus: '',
    htStatus: '',
    isExistFgLg: false,
    isExistHtFgLg: false,
    isExistResultAndFirstTeamScore: false,
    isEnabledGoalRecordHt: false,
    isEnabledGoalRecordFt: false,
    exHTHomeScore: '2',
    exHTAwayScore: '1'
  } as MatchDetail;

  const firstHalfResult = { resourceId: ResourceIds.halfTime, resultSettingData: {} } as ResultDetail;
  const fullTimeResult = { resourceId: ResourceIds.fullTime, resultSettingData: {} } as ResultDetail;

  const match: Match = {
    matchDetail: matchDetail,
    permission: new Permission(),
    ticketCounts: [],
    resultDetails: [fullTimeResult, firstHalfResult],
    hedgeMatchDetail: undefined,
    fantasyMatch: undefined,
    childMatches: []
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculationActionComponent, HttpClientModule, ToastrModule.forRoot()],
      providers: [
        CalculateService,
        MessageBoxService,
        GoalIconService,
        AioService,
        CalculateStorage,
        VerifyScoreGoalService,
        VerifyActionService,
        ToastrService,
        RequestService,
        ClosePopupService,
        ScoreService,
        GoalRecordWithSemicolonService,
        GoalRecordWithOutSemicolonService!
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalculationActionComponent);
    storage = TestBed.inject(CalculateStorage);
    calculateService = TestBed.inject(CalculateService);
    scoreService  = TestBed.inject(ScoreService);
    component = fixture.componentInstance;
    storage.setMatch(match);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('copyScore - should call calculate service copyScore', () => {
    calculateService.copyScore = jest.fn();

    component.copyScore();

    expect(calculateService.copyScore).toHaveBeenCalled();
  });

  describe('selectResult', () => {
    it('should set enableAction to true when halfTimeResult is checked', () => {
      component.halfTimeResult = { checked: true } as ResultDetail;
      component.fullTimeResult = { checked: false } as ResultDetail;

      component.selectResult();

      expect(component.state.enableAction).toBe(true);
    });

    it('should set enableAction to false when both halfTimeResult and fullTimeResult are unchecked', () => {
      component.halfTimeResult = { checked: false } as ResultDetail;
      component.fullTimeResult = { checked: false } as ResultDetail;

      component.selectResult();

      expect(component.state.enableAction).toBe(false);
    });
  });

  it('isChangeSetting - should call aioService.changeResultSetting and update resultDetail', async () => {
    const resultDetail = { resultSettingData: { isHoldResult: false, iconHoldResult: '' }, resourceId: ResourceIds.halfTime } as ResultDetail;
    const aioService = TestBed.inject(AioService);
    aioService.changeResultSetting = jest.fn().mockResolvedValue(true);
    const messageBoxService = TestBed.inject(MessageBoxService);
    messageBoxService.confirm = jest.fn((msg, callback) => callback());

    await component.isChangeSetting(resultDetail);

    expect(aioService.changeResultSetting).toHaveBeenCalled();
    expect(resultDetail.resultSettingData.isHoldResult).toBe(true);
    expect(resultDetail.resultSettingData.iconHoldResult).toBe('icon-yes');
  });

  it('scoreChanged - should update resultDetail isMismatch and call changeResultState', () => {
    const resultDetail = { resourceId: ResourceIds.halfTime, homeValue: '1', awayValue: '1', isMismatch: false } as ResultDetail;
    component.matchDetail = matchDetail;
    component.halfTimeResult = resultDetail;

    scoreService.changeResultState = jest.fn();

    component.scoreChanged(resultDetail);

    expect(resultDetail.isMismatch).toBe(true);
    expect(scoreService.changeResultState).toHaveBeenCalled();
  });

  describe('calculate', () => {
    it('should call calculateALL when both halfTimeResult and fullTimeResult are checked', () => {
      component.halfTimeResult = { checked: true, homeValue: '1', awayValue: '1' } as ResultDetail;
      component.fullTimeResult = { checked: true, homeValue: '2', awayValue: '2' } as ResultDetail;
      calculateService.calculateALL = jest.fn();

      component.calculate();

      expect(calculateService.calculateALL).toHaveBeenCalled();
    });

    it('should call calculateHalfTime when only halfTimeResult is checked', () => {
      component.halfTimeResult = { checked: true, homeValue: '1', awayValue: '1' } as ResultDetail;
      component.fullTimeResult = { checked: false } as ResultDetail;
      calculateService.calculateHalfTime = jest.fn();

      component.calculate();

      expect(calculateService.calculateHalfTime).toHaveBeenCalled();
    });

    it('should call calculateFullTime when only fullTimeResult is checked', () => {
      component.halfTimeResult = { checked: false } as ResultDetail;
      component.fullTimeResult = { checked: true, homeValue: '2', awayValue: '2' } as ResultDetail;
      calculateService.calculateFullTime = jest.fn();

      component.calculate();

      expect(calculateService.calculateFullTime).toHaveBeenCalled();
    });
  });

  describe('uncalculate', () => {
    it('should call uncalculateAll when both halfTimeResult and fullTimeResult are checked', () => {
      component.halfTimeResult = { checked: true } as ResultDetail;
      component.fullTimeResult = { checked: true } as ResultDetail;
      calculateService.uncalculateAll = jest.fn();

      component.uncalculate();

      expect(calculateService.uncalculateAll).toHaveBeenCalled();
    });

    it('should call uncalculateFT when only fullTimeResult is checked', () => {
      component.halfTimeResult = { checked: false } as ResultDetail;
      component.fullTimeResult = { checked: true } as ResultDetail;
      calculateService.uncalculateFT = jest.fn();

      component.uncalculate();

      expect(calculateService.uncalculateFT).toHaveBeenCalled();
    });

    it('should call storage.error when neither halfTimeResult nor fullTimeResult is checked', () => {
      component.halfTimeResult = { checked: false } as ResultDetail;
      component.fullTimeResult = { checked: false } as ResultDetail;
      storage.error = jest.fn();

      component.uncalculate();

      expect(storage.error).toHaveBeenCalledWith(Language.CannotUncalculateHalfTime);
    });
  });

  it('unCalcInstant - should call calculateService.unCalcInstant', () => {
    calculateService.unCalcInstant = jest.fn();

    component.unCalcInstant();

    expect(calculateService.unCalcInstant).toHaveBeenCalled();
  });

  it('saveScore - should call calculateService.saveScore', () => {
    calculateService.saveScore = jest.fn();

    component.saveScore();

    expect(calculateService.saveScore).toHaveBeenCalled();
  });

  it('goalRecordModelChange - should update matchDetail goalRecord and goalIcon', () => {
    const goalIcon = new GoalIcon('', '', '', '');
    const goalIconService = TestBed.inject(GoalIconService);
    goalIconService.generateGoalIcon = jest.fn().mockReturnValue(goalIcon);

    component.goalRecordModelChange('goal');

    expect(component.matchDetail.goalRecord).toBe('goal');
    expect(component.matchDetail.goalIcon).toStrictEqual(goalIcon);
  });
});
