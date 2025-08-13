import { TestBed } from '@angular/core/testing';
import { VerifyScoreFTHandler } from './verify-score-ft.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { VerificationBaseService } from '../../../services/verification-base.service';
import { Language } from '../../../../shared/language.native';

describe('VerifyScoreFTHandler', () => {
	let handler: VerifyScoreFTHandler;
	let storage: RefundBaseStorage;
	let verificationServiceMock: { isEmptyScore: jest.Mock };
	let nextHandler: { handle: jest.Mock };

	const match = { matchDetail: { finalHomeScore: '', finalAwayScore: '' } } as any;
	const fullTime = { homeValue: '1', awayValue: '0', isInvalidValue: false } as any;

	beforeEach(() => {
		jest.clearAllMocks();
		verificationServiceMock = { isEmptyScore: jest.fn() } as any;

		TestBed.configureTestingModule({
			imports: [ToastrModule.forRoot()],
			providers: [
				VerifyScoreFTHandler,
				RefundStorage,
				ToastrService,
				{ provide: VerificationBaseService, useValue: verificationServiceMock }
			]
		});

		handler = TestBed.inject(VerifyScoreFTHandler);
		storage = TestBed.inject(RefundStorage);

		(storage.getMatch as any) = jest.fn().mockReturnValue(match);
		(storage.getFullTimeResult as any) = jest.fn().mockReturnValue(fullTime);
		(storage.error as any) = jest.fn();

		nextHandler = { handle: jest.fn() };
		handler.setNextHandler(nextHandler as any);
	});

	it('should show error when score is invalid', () => {
		// Arrange
		verificationServiceMock.isEmptyScore.mockReturnValueOnce(true).mockReturnValueOnce(false);

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).toHaveBeenCalledWith(Language.warningInputScore);
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});

	it('should set final scores and proceed when score is valid', () => {
		// Arrange
		verificationServiceMock.isEmptyScore.mockReturnValue(false);

		// Act
		handler.handle(storage);

		// Assert
		expect(match.matchDetail.finalHomeScore).toBe('1');
		expect(match.matchDetail.finalAwayScore).toBe('0');
		expect(storage.error).not.toHaveBeenCalled();
		expect(nextHandler.handle).toHaveBeenCalledWith(storage);
	});
});
