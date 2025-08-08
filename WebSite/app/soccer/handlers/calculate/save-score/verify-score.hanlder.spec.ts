import { VerifyTraderScoreHandler } from './verify-score.hanlder';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { Language } from '../../../../shared/language.native';
import { TestBed } from '@angular/core/testing';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { VerifyActionService } from '../../../components/calc/services/verify-action.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RequestService } from '../../../components/calc/services/request.service';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { Match } from '../../../components/calc/models/match.model';
import { AbstractHandler } from '../../abstract.handler.native';
import { HttpClientModule } from '@angular/common/http';
import { HedgeMatchDetail, ResultDetail } from '../../../../shared/models/sportsbook-sop';
import { ScoreSourceType } from '../../../../shared/constants';
describe('VerifyScoreHandler', () => {
  let handler: VerifyTraderScoreHandler;
  let verifyScoreGoalService: VerifyScoreGoalService;
  let storage: CalculateStorage;

  const match: Match = {
    matchDetail: undefined,
    permission: new Permission(),
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: undefined,
    fantasyMatch: undefined,
    childMatches: [],
    externalResults: [],
    originalResultDetail: [],
    oldMatchDetail: new HedgeMatchDetail,
    isClickOnCalculate: false,
    isScoreDirect: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
       imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        VerifyTraderScoreHandler,
        VerifyScoreGoalService,
        VerifyActionService,
        CalculateStorage,
        ToastrService,
        RequestService,
      ]
    });

    handler = TestBed.inject(VerifyTraderScoreHandler);
    verifyScoreGoalService = TestBed.inject(VerifyScoreGoalService);
    storage = TestBed.inject(CalculateStorage);

    // Reset to default values
    match.resultDetails = [];
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.error = jest.fn();
    verifyScoreGoalService.isEmptyScore = jest.fn().mockReturnValue(false);
  });

  it('should call storage.error if there are invalid scores', () => {
    // Arrange
    const traderScore1 = { homeValue: '', awayValue: '1', sourceId: ScoreSourceType.trader, isHomeValueWarning: false, isAwayValueWarning: false };
    const traderScore2 = { homeValue: '2', awayValue: '', sourceId: ScoreSourceType.trader, isHomeValueWarning: false, isAwayValueWarning: false };
    
    const resultDetails = [
      { 
        checked: true,
        externalScores: [traderScore1]
      },
      { 
        checked: true,
        externalScores: [traderScore2]
      }
    ] as any;

    match.resultDetails = resultDetails;
    verifyScoreGoalService.isEmptyScore = jest.fn().mockImplementation(value => value === '');

    // Act
    handler.handle(storage);

    // Assert
    expect(storage.error).toHaveBeenCalledWith(Language.warningInputScore);
  });

  it('should call super.handle if there are no invalid scores', () => {
    // Arrange
    const traderScore = { homeValue: '1', awayValue: '1', sourceId: ScoreSourceType.trader, isHomeValueWarning: false, isAwayValueWarning: false };
    
    const resultDetails = [
      { 
        checked: true,
        externalScores: [traderScore]
      }
    ] as any;
    
    match.resultDetails = resultDetails;
    verifyScoreGoalService.isEmptyScore = jest.fn().mockReturnValue(false);
    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    // Act
    handler.handle(storage);

    // Assert
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });

  it('should set isHomeValueWarning and isAwayValueWarning correctly', () => {
    // Arrange
    const traderScore1 = { homeValue: '', awayValue: '1', sourceId: ScoreSourceType.trader, isHomeValueWarning: false, isAwayValueWarning: false };
    const traderScore2 = { homeValue: '2', awayValue: '', sourceId: ScoreSourceType.trader, isHomeValueWarning: false, isAwayValueWarning: false };
    
    const resultDetails = [
      { 
        checked: true,
        externalScores: [traderScore1]
      },
      { 
        checked: true,
        externalScores: [traderScore2]
      }
    ] as any;
    
    match.resultDetails = resultDetails;
    verifyScoreGoalService.isEmptyScore = jest.fn().mockImplementation(value => value === '');

    // Act
    handler.handle(storage);

    // Assert
    expect(traderScore1.isHomeValueWarning).toBe(true);
    expect(traderScore1.isAwayValueWarning).toBe(false);
    expect(traderScore2.isHomeValueWarning).toBe(false);
    expect(traderScore2.isAwayValueWarning).toBe(true);
  });
});