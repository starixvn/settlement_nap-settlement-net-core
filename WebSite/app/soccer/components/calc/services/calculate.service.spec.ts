import { TestBed } from '@angular/core/testing';
import { CalculateAction } from "../../../../shared/constants";
import { UncalculateHandler } from "../../../handlers/calculate/all/uncalculate.handler";
import { VerifyAllHandler } from "../../../handlers/calculate/all/verify-all.handler";
import { MatchSettledHandler } from "../../../handlers/calculate/copy-score/match-settled.handler";
import { VerifyFirstHalfHandler } from "../../../handlers/calculate/first-half/verify-firsthalf.handler";
import { CheckBetStatusHandler } from "../../../handlers/calculate/full-time/check-betstatus.handler";
import { VerifyFulltimeHandler } from "../../../handlers/calculate/full-time/verify-fulltime.handler";
import { VerifySettledResultHandler } from "../../../handlers/calculate/save-score/verify-settled-result.handler";
import { VerifyScoreInstantHandler } from "../../../handlers/calculate/uncalc-instant/verify-score-instant.handler";
import { CalculateStorage } from "../../../storage/calculate.storage";
import { CalculateService } from "./calculate.service";
import { VerifyScoreGoalService } from './verify-score-goal.service';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RequestService } from './request.service';
import { ScoreService } from './score.service';
import { VerifyActionService } from './verify-action.service';
import { ClosePopupService } from '../../../../shared/services';

describe('CalculateService', () => {
  let service: CalculateService;
  let storage: CalculateStorage;

  beforeEach(() => {

    TestBed.configureTestingModule({
    imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        CalculateService,
        CalculateStorage,
        MatchSettledHandler,
        VerifySettledResultHandler,
        VerifyFirstHalfHandler,
        VerifyAllHandler,
        VerifyFulltimeHandler,
        UncalculateHandler,
        CheckBetStatusHandler,
        VerifyScoreInstantHandler,
        VerifyScoreGoalService,
        ToastrService,
        RequestService,
        ScoreService,
        VerifyActionService,
        ClosePopupService
      ]
    });

      storage = TestBed.inject(CalculateStorage);
      service = TestBed.inject(CalculateService);

  });

  it('should call handle on matchSettledHandler when copyScore is called', () => {
      const spy = jest.spyOn(MatchSettledHandler.prototype, 'handle').mockImplementation(() => {});

      service.copyScore();

      expect(spy).toHaveBeenCalledWith(storage);
  });

  it('should call handle on verifySettledResultHandler when saveScore is called', () => {
      const spy = jest.spyOn(VerifySettledResultHandler.prototype, 'handle').mockImplementation(() => {});
    
      service.saveScore();

      expect(spy).toHaveBeenCalledWith(storage);
  });

  it('should set calculate action to calculateHalfTime and call handle on verifyHalfTimeHandler when calculateHalfTime is called', () => {
      const spy = jest.spyOn(VerifyFirstHalfHandler.prototype, 'handle').mockImplementation(() => Promise.resolve());
      service.calculateHalfTime();
      expect(storage.getCalculateAction()).toBe(CalculateAction.calculateHalfTime);
      expect(spy).toHaveBeenCalledWith(storage);
  });

  it('should set calculate action to calculate and call handle on verifyAllHandler when calculateALL is called', () => {
      const spy = jest.spyOn(VerifyAllHandler.prototype, 'handle').mockImplementation(() => Promise.resolve());
      service.calculateALL();
      expect(storage.getCalculateAction()).toBe(CalculateAction.calculate);
      expect(spy).toHaveBeenCalledWith(storage);
  });

  it('should set calculate action to calculateFullTime and call handle on verifyFullTimeHandler when calculateFullTime is called', () => {
      const spy = jest.spyOn(VerifyFulltimeHandler.prototype, 'handle').mockImplementation(() => Promise.resolve());
      service.calculateFullTime();
      expect(storage.getCalculateAction()).toBe(CalculateAction.calculateFullTime);
      expect(spy).toHaveBeenCalledWith(storage);
  });

  it('should call handle on uncalculateHandler when uncalculateAll is called', () => {
      const spy = jest.spyOn(UncalculateHandler.prototype, 'handle').mockImplementation(() => {});
      service.uncalculateAll();
      expect(spy).toHaveBeenCalledWith(storage);
  });

  it('should call handle on checkBetStatusHandler when uncalculateFT is called', () => {
      const spy = jest.spyOn(CheckBetStatusHandler.prototype, 'handle').mockImplementation(() => {});
      service.uncalculateFT();
      expect(spy).toHaveBeenCalledWith(storage);
  });

  it('should call handle on verifyScoreInstant when unCalcInstant is called', () => {
      const spy = jest.spyOn(VerifyScoreInstantHandler.prototype, 'handle').mockImplementation(() => Promise.resolve());
      service.unCalcInstant();
      expect(spy).toHaveBeenCalledWith(storage);
  });
});