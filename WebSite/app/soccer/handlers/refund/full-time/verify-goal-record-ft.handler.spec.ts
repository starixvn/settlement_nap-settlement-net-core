import { TestBed } from '@angular/core/testing';
import { VerifyGoalRecordFTHandler } from './verify-goal-record-ft.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { VerificationBaseService } from '../../../services/verification-base.service';
import { VerifyService } from '../../../components/sop-refund/services/verify.service';
import { Language } from '../../../../shared/language.native';

describe('VerifyGoalRecordFTHandler', () => {
	let handler: VerifyGoalRecordFTHandler;
	let storage: RefundBaseStorage;
	let verificationServiceMock: any;
	let verifyServiceMock: any;
	let nextHandler: { handle: jest.Mock };

	const match = { matchDetail: { applyGoalRecord: false, isScoreInconsistent: false } } as any;

	beforeEach(() => {
		jest.clearAllMocks();
		verificationServiceMock = {
			goalRecordExistSemicolon: jest.fn().mockReturnValue(false),
			goalRecordNotExistSemicolon: jest.fn().mockReturnValue(false),
			isFullTimeGoalRecordInvalid: jest.fn().mockReturnValue(false),
			isHTGoalRecordConsistent: jest.fn().mockReturnValue(false)
		};
		verifyServiceMock = { isRefundHalfTimeBetStatus: jest.fn().mockReturnValue(false) };

		TestBed.configureTestingModule({
			imports: [ToastrModule.forRoot()],
			providers: [
				VerifyGoalRecordFTHandler,
				RefundStorage,
				ToastrService,
				{ provide: VerificationBaseService, useValue: verificationServiceMock },
				{ provide: VerifyService, useValue: verifyServiceMock }
			]
		});

		handler = TestBed.inject(VerifyGoalRecordFTHandler);
		storage = TestBed.inject(RefundStorage);

		(storage.getMatch as any) = jest.fn().mockReturnValue(match);
		(storage.error as any) = jest.fn();

		nextHandler = { handle: jest.fn() };
		handler.setNextHandler(nextHandler as any);
	});

	it('should error when semicolon exists and is refund half-time bet status', () => {
		// Arrange
		verifyServiceMock.isRefundHalfTimeBetStatus.mockReturnValue(true);
		verificationServiceMock.goalRecordExistSemicolon.mockReturnValue(true);

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).toHaveBeenCalledWith(Language.soccer.noNeedSemicolonOnGoalRecord);
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});

	it('should error when semicolon is needed and not refund half-time bet status', () => {
		// Arrange
		verifyServiceMock.isRefundHalfTimeBetStatus.mockReturnValue(false);
		verificationServiceMock.goalRecordNotExistSemicolon.mockReturnValue(true);

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).toHaveBeenCalledWith(Language.soccer.needSemicolonOnGoalRecord);
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});

	it('should error when full-time goal record invalid and set warning flag', () => {
		// Arrange
		verificationServiceMock.isFullTimeGoalRecordInvalid.mockReturnValue(true);

		// Act
		handler.handle(storage);

		// Assert
		expect((match.matchDetail as any).isWarningGoalRecord).toBe(true);
		expect(storage.error).toHaveBeenCalledWith(Language.soccer.goalRecordNotConsistent);
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});

	it('should error when applyGoalRecord and HT goal record not consistent', () => {
		// Arrange
		match.matchDetail.applyGoalRecord = true;
		verificationServiceMock.isHTGoalRecordConsistent.mockReturnValue(true);

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeGoalRecordNotConsistent);
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});

	it('should error when score inconsistent', () => {
		// Arrange
		match.matchDetail.applyGoalRecord = false;
		match.matchDetail.isScoreInconsistent = true;

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).toHaveBeenCalledWith(Language.soccer.confirmWithInconsistentScore);
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});

	it('should proceed when all validations pass', () => {
		// Arrange
		match.matchDetail.applyGoalRecord = false;
		match.matchDetail.isScoreInconsistent = false;

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).not.toHaveBeenCalled();
		expect(nextHandler.handle).toHaveBeenCalledWith(storage);
	});
});
