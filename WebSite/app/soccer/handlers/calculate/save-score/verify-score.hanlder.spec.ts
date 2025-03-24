import { VerifyTraderScoreHandler } from './verify-score.hanlder';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { Language } from '../../../../shared/language.native';
import { ResultDetail } from '../../../models';
import { TestBed } from '@angular/core/testing';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { VerifyActionService } from '../../../components/calc/services/verify-action.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RequestService } from '../../../components/calc/services/request.service';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { Match } from '../../../components/calc/models/match.model';
import { AbstractHandler } from '../../abstract.handler.native';
import { HttpClientModule } from '@angular/common/http';

describe('VerifyScoreHandler', () => {
  let verifyScoreHandler: VerifyTraderScoreHandler;
  let verifyScoreGoalService: VerifyScoreGoalService;
  let storage: CalculateStorage;

    const match: Match = {
      matchDetail: undefined,
      permission: new Permission,
      ticketCounts: [],
      resultDetails: [],
      hedgeMatchDetail: undefined,
      fantasyMatch: undefined,
      childMatches: []
    }

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

    verifyScoreHandler = TestBed.inject(VerifyTraderScoreHandler);
    verifyScoreGoalService = TestBed.inject(VerifyScoreGoalService);
    storage = TestBed.inject(CalculateStorage);
  });

  it('should call storage.error if there are invalid scores', () => {
    const resultDetails =  [
      { checked: true, homeValue: '', awayValue: '1', isHomeValueWarning: false, isAwayValueWarning: false },
      { checked: true, homeValue: '2', awayValue: '', isHomeValueWarning: false, isAwayValueWarning: false }
    ];

    match.resultDetails = resultDetails as ResultDetail[];
    storage.getMatch = jest.fn().mockReturnValue(match);
    jest.spyOn(verifyScoreGoalService, 'isEmptyScore').mockImplementation(value => value === '');
    storage.error = jest.fn();

    verifyScoreHandler.handle(storage);

    expect(storage.error).toHaveBeenCalledWith(Language.warningInputScore);
  });

  it('should call super.handle if there are no invalid scores', () => {
    const resultDetails = [
      { checked: true, homeValue: '1', awayValue: '1', isHomeValueWarning: false, isAwayValueWarning: false }
    ];
    match.resultDetails = resultDetails as ResultDetail[];
    storage.getMatch = jest.fn().mockReturnValue(match);
    jest.spyOn(verifyScoreGoalService, 'isEmptyScore').mockImplementation((value: string): value is '' => false);

    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    verifyScoreHandler.handle(storage);

    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });

  it('should set isHomeValueWarning and isAwayValueWarning correctly', () => {
    const resultDetails = [
      { checked: true, homeValue: '', awayValue: '1', isHomeValueWarning: false, isAwayValueWarning: false } ,
      { checked: true, homeValue: '2', awayValue: '', isHomeValueWarning: false, isAwayValueWarning: false }
    ];
    
    match.resultDetails = resultDetails as ResultDetail[];
    storage.getMatch = jest.fn().mockReturnValue(match);
    jest.spyOn(verifyScoreGoalService, 'isEmptyScore').mockImplementation(value => value === '');

    verifyScoreHandler.handle(storage);

    expect(resultDetails[0].isHomeValueWarning).toBe(true);
    expect(resultDetails[0].isAwayValueWarning).toBe(false);
    expect(resultDetails[1].isHomeValueWarning).toBe(false);
    expect(resultDetails[1].isAwayValueWarning).toBe(true);
  });
});