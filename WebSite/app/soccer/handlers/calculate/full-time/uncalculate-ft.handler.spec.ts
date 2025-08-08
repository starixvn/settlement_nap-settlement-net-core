import { TestBed } from '@angular/core/testing';
import { UncalculateFTHandler } from './uncalculate-ft.handler';
import { ClosePopupService, MessageBoxService } from '../../../../shared/services';
import { RequestService } from '../../../components/calc/services/request.service';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import {  HedgeMatchDetail, Match, MatchDetailSoccer } from '../../../components/calc/models/match.model';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { Result } from '../../../../shared/models';

describe('UncalculateFTHandler', () => {
  let handler: UncalculateFTHandler;
  let closePopupService: ClosePopupService;
  let requestService: RequestService;
  let storage: CalculateStorage;

  const matchDetail = {

  } as MatchDetailSoccer;
  
  const hedgeMatchDetail = {
    matchId: 0,
  } as HedgeMatchDetail;
  const match: Match = {
    matchDetail,
    permission: new Permission,
    ticketCounts: [],
    resultDetails: [],
    fantasyMatch: undefined,
    childMatches: [],
    externalResults: [],
    originalResultDetail: [],
    oldMatchDetail: undefined,
    isClickOnCalculate: false,
    isScoreDirect: false,
    hedgeMatchDetail: hedgeMatchDetail
  }

  const result: Result = {
    isSuccessful: true,
    errMsg: '',
    errCode: 0,
    childMatchIds: '',
    settledSessionId: '',
    hasResultAmendment: false,
    isOrg: false
  };


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        UncalculateFTHandler,
        VerifyScoreGoalService,
        CalculateStorage,
        ToastrService,
        RequestService,
        MessageBoxService,
        ClosePopupService
      ]
    });

    handler = TestBed.inject(UncalculateFTHandler);
    closePopupService = TestBed.inject(ClosePopupService);
    requestService = TestBed.inject(RequestService);
    storage = TestBed.inject(CalculateStorage);
  });

  it('should close popup on successful uncalculation', async () => {
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.isApplyHedgeMatch = jest.fn().mockReturnValue(true);
    requestService.unCalculateFt = jest.fn().mockReturnValue(Promise.resolve(result));
    closePopupService.closePopup = jest.fn();

    await handler.handle(storage);

    expect(requestService.unCalculateFt).toHaveBeenCalled();
    expect(closePopupService.closePopup).toHaveBeenCalled();
  });

  it('should handle error on unsuccessful uncalculation', async () => {
    result.isSuccessful = false;
    result.errMsg = 'Error';
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.isApplyHedgeMatch = jest.fn().mockReturnValue(true);
    requestService.unCalculateFt = jest.fn().mockReturnValue(Promise.resolve(result));
    storage.error = jest.fn();
    closePopupService.closePopup = jest.fn();

    await handler.handle(storage);

    expect(requestService.unCalculateFt).toHaveBeenCalled();
    expect(closePopupService.closePopup).not.toHaveBeenCalled();
    expect(storage.error).toHaveBeenCalledWith('Error');
  });

  it('should use hedgeMatchId as 0 if isApplyHedgeMatch is false', async () => {
    result.isSuccessful = true;
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.isApplyHedgeMatch = jest.fn().mockReturnValue(false);
    requestService.unCalculateFt = jest.fn().mockReturnValue(Promise.resolve(result));
    closePopupService.closePopup = jest.fn();

    await handler.handle(storage);

    expect(requestService.unCalculateFt).toHaveBeenCalled();
    expect(closePopupService.closePopup).toHaveBeenCalled();
  });
});