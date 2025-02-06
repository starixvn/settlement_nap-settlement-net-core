import { TestBed } from '@angular/core/testing';
import { ToastContainerDirective, ToastrModule, ToastrService } from 'ngx-toastr';
import { CalculateStorage } from './calculate.storage';
import { VerifyScoreGoalService } from '../components/calc/services/verify-score-goal.service';
import { Match } from '../components/calc/models/match.model';
import { HttpClientModule } from '@angular/common/http';
import { ResourceIds } from '../constants';

describe('CalculateStorage', () => {
  let storage: CalculateStorage;
  let verifyScoreGoalService: VerifyScoreGoalService;
  let toastrService: ToastrService;

  beforeEach(() => {
    TestBed.configureTestingModule({
       imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        CalculateStorage,
        ToastrService,
        VerifyScoreGoalService,
        ToastrService
      ]
    });

    storage = TestBed.inject(CalculateStorage);
    verifyScoreGoalService = TestBed.inject(VerifyScoreGoalService);
    toastrService = TestBed.inject(ToastrService) ;
  });

  it('should be created', () => {
    expect(storage).toBeTruthy();
  });

  it('should set and get match', () => {
    const mockMatch = { matchDetail: {}, resultDetails: [] } as Match;

    storage.setMatch(mockMatch);

    expect(storage.getMatch()).toBe(mockMatch);
  });

  it('should set and get calculateAction', () => {
    const action = 'test-action';
    storage.setCalculateAction(action);
    expect(storage.getCalculateAction()).toBe(action);
  });

  it('should set and get isResettleTicket', () => {
    storage.setIsResettleTicket(true);
    expect(storage.getIsResettleTicket()).toBe(true);
  });

  it('should set and get isApplyHedgeMatch', () => {
    storage.setIsAppleHedgeMatch(true);
    expect(storage.isApplyHedgeMatch()).toBe(true);
  });

  it('should show error toast when message is not empty', () => {
    const errorMessage = 'Test error';
    toastrService.error = jest.fn();
    
    storage.error(errorMessage);
    
    expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should clear toasts when error message is empty', () => {
    toastrService.clear = jest.fn();

    storage.error('');

    expect(toastrService.clear).toHaveBeenCalled();
  });

  it('should set toastr overlay', () => {
    const mockContainer = {} as ToastContainerDirective;
    storage.setToastrOverlay(mockContainer);
    expect(toastrService.overlayContainer).toBe(mockContainer);
  });

  describe('changeScore', () => {
    beforeEach(() => {
      const mockMatch = {
        matchDetail: {
          halfTimeHomeScore: '1',
          halfTimeAwayScore: '1',
          finalHomeScore: '2',
          finalAwayScore: '2'
        },
        resultDetails: [ { resourceId: ResourceIds.halfTime }, { resourceId: ResourceIds.fullTime } ]
      } as Match;
      storage.setMatch(mockMatch);
    });

    it('should set isScoreInconsistent to true when half time score is greater than full time', () => {
      jest.spyOn(verifyScoreGoalService, 'isEmptyScore').mockReturnValue(false);
      storage.setHaftTimeScore('3', '3');
      storage.setFullTimeScore('2', '2');
      storage.changeScore();
      expect(storage.getMatch().matchDetail.isScoreInconsistent).toBe(true);
    });

    it('should set isScoreInconsistent to false when scores are consistent', () => {
      jest.spyOn(verifyScoreGoalService, 'isEmptyScore').mockReturnValue(false);
      storage.setHaftTimeScore('1', '1');
      storage.setFullTimeScore('2', '2');
      storage.changeScore();
      expect(storage.getMatch().matchDetail.isScoreInconsistent).toBe(false);
    });
  });
});