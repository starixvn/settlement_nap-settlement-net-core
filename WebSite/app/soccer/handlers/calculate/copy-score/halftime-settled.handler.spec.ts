import { HalfTimeSettledHandler } from './halftime-settled.handler';
import { Storage } from '../../../storage/storage.service.native';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { ScoreService } from '../../../components/calc/services/score.service';
import { Language } from '../../../../shared/language.native';
import { CalculateAction } from '../../../../shared/constants';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MessageBoxService } from '../../../../shared/services';
import { RequestService } from '../../../components/calc/services/request.service';
import { AbstractHandler } from '../../abstract.handler.native';


describe('HalfTimeSettledHandler', () => {
	let handler: HalfTimeSettledHandler;
	let storage: CalculateStorage;
	let verifyScoreGoalService: VerifyScoreGoalService;
	let scoreService: ScoreService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule, ToastrModule.forRoot()],
			providers: [
				HalfTimeSettledHandler,
				MessageBoxService,
				VerifyScoreGoalService,
				RequestService,
				CalculateStorage,
				ToastrService,
				ScoreService
			]
		});

		handler = TestBed.inject(HalfTimeSettledHandler);
		verifyScoreGoalService = TestBed.inject(VerifyScoreGoalService);
		scoreService = TestBed.inject(ScoreService);
		storage = TestBed.inject(CalculateStorage);
	});

	it('should confirm copy score if half-time is settled and external FT score is valid', () => {
		const matchDetail = { exFTHomeScore: 1, exFTAwayScore: 1 };
		storage.getMatch = jest.fn().mockReturnValue({ matchDetail });
		verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(true);
		verifyScoreGoalService.isHalfTimeSettled = jest.fn().mockReturnValue(true);

		scoreService.confirmCopyScore = jest.fn();

		handler.handle(storage);

		expect(scoreService.confirmCopyScore).toHaveBeenCalledWith(Language.soccer.confirmCopyFinalScore, CalculateAction.copyFTScore);
	});

	it('should log error if half-time is settled and external FT score is invalid', () => {
		const matchDetail = { exFTHomeScore: 1, exFTAwayScore: 1 };
		storage.getMatch = jest.fn().mockReturnValue({ matchDetail });
		verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(false);
		verifyScoreGoalService.isHalfTimeSettled = jest.fn().mockReturnValue(true);
		
		storage.error = jest.fn();

		handler.handle(storage);

		expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeAlreadySettled);
	});

	it('should call super handle if half-time is not settled', () => {
		const matchDetail = { exFTHomeScore: 1, exFTAwayScore: 1 };
		storage.getMatch = jest.fn().mockReturnValue({ matchDetail });
		verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(true);
		verifyScoreGoalService.isHalfTimeSettled = jest.fn().mockReturnValue(false);

		AbstractHandler.prototype.handle = jest.fn();

		handler.handle(storage);

		expect(AbstractHandler.prototype.handle ).toHaveBeenCalledWith(storage);
	});
});