import { TestBed } from '@angular/core/testing';
import { MatchSettledHandler } from './match-settled.handler';
import { Storage } from '../../../storage/storage.service.native';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { AbstractHandler } from '../../abstract.handler.native';
import { Language } from '../../../../shared/language.native';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RequestService } from '../../../components/calc/services/request.service';
import { MessageBoxService } from '../../../../shared/services';
import { Match, MatchDetail } from '../../../components/calc/models/match.model';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { HttpClientModule } from '@angular/common/http';

describe('MatchSettledHandler', () => {
  let handler: MatchSettledHandler;
  let storage: CalculateStorage;
  let verifyScoreGoalService: VerifyScoreGoalService;
  const match: Match = {
    matchDetail: {} as MatchDetail,
    childMatches: [],
    permission: new Permission,
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: undefined,
    fantasyMatch: undefined
  };

  beforeEach(() => {


    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        MatchSettledHandler,
        MessageBoxService,
        VerifyScoreGoalService,
        RequestService,
        CalculateStorage,
        ToastrService,
      ]
    });

    handler = TestBed.inject(MatchSettledHandler);
    storage = TestBed.inject(CalculateStorage);
    verifyScoreGoalService = TestBed.inject(VerifyScoreGoalService);
  });

  it('should call storage.error if match is already settled', () => {

    jest.spyOn(storage, 'getMatch').mockReturnValue(match);
    jest.spyOn(verifyScoreGoalService, 'isFullTimeSettled').mockReturnValue(true);
    jest.spyOn(storage, 'error').mockImplementation(jest.fn());

    handler.handle(storage);
    expect(storage.error).toHaveBeenCalledWith(Language.soccer.matchAlreadySettled);
  });

  it('should call super.handle if match is not settled', () => {
    jest.spyOn(storage, 'getMatch').mockReturnValue(match);
    jest.spyOn(verifyScoreGoalService, 'isFullTimeSettled').mockReturnValue(false);
    jest.spyOn(AbstractHandler.prototype, 'handle').mockImplementation(jest.fn());

    handler.handle(storage);
    expect(AbstractHandler.prototype.handle).toHaveBeenCalledWith(storage);
  });
});