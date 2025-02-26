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
import { Storage } from '../../../storage/storage.service.native';

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
        MatchSettledHandler.prototype.handle = jest.fn();

        service.copyScore();

        expect(MatchSettledHandler.prototype.handle).toHaveBeenCalledWith(storage);
    });

    it('should call handle on verifySettledResultHandler when saveScore is called', () => {
        VerifySettledResultHandler.prototype.handle = jest.fn();

        service.saveScore();

        expect(VerifySettledResultHandler.prototype.handle).toHaveBeenCalledWith(storage);
    });

    it('should set calculate action to calculateHalfTime and call handle on verifyHalfTimeHandler when calculateHalfTime is called', () => {
        VerifyFirstHalfHandler.prototype.handle = jest.fn();
        service.calculateHalfTime();
        expect(storage.getCalculateAction()).toBe(CalculateAction.calculateHalfTime);
        expect(VerifyFirstHalfHandler.prototype.handle).toHaveBeenCalledWith(storage);
    });

    it('should set calculate action to calculate and call handle on verifyAllHandler when calculateALL is called', () => {
        VerifyAllHandler.prototype.handle = jest.fn();
        service.calculateALL();
        expect(storage.getCalculateAction()).toBe(CalculateAction.calculate);
        expect(VerifyAllHandler.prototype.handle).toHaveBeenCalledWith(storage);
    });

    it('should set calculate action to calculateFullTime and call handle on verifyFullTimeHandler when calculateFullTime is called', () => {
        VerifyFulltimeHandler.prototype.handle = jest.fn();
        service.calculateFullTime();
        expect(storage.getCalculateAction()).toBe(CalculateAction.calculateFullTime);
        expect(VerifyFulltimeHandler.prototype.handle).toHaveBeenCalledWith(storage);
    });

    it('should call handle on uncalculateHandler when uncalculateAll is called', () => {
        UncalculateHandler.prototype.handle = jest.fn();
        service.uncalculateAll();
        expect(UncalculateHandler.prototype.handle).toHaveBeenCalledWith(storage);
    });

    it('should call handle on checkBetStatusHandler when uncalculateFT is called', () => {
        CheckBetStatusHandler.prototype.handle = jest.fn();
        service.uncalculateFT();
        expect(CheckBetStatusHandler.prototype.handle).toHaveBeenCalledWith(storage);
    });

    it('should call handle on verifyScoreInstant when unCalcInstant is called', () => {
        VerifyScoreInstantHandler.prototype.handle = jest.fn().mockResolvedValue(undefined);
        service.unCalcInstant();
        expect(VerifyScoreInstantHandler.prototype.handle).toHaveBeenCalledWith(storage);
    });
});