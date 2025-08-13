import { TestBed } from '@angular/core/testing';
import { VerifyScoreHandler } from './verify-score.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { LogicService } from '../../../components/sop-refund/services/logic.service';
import { CalculateAction, SettlementStatusId } from '../../../../shared/constants';
import { RefundType } from '../../../constants';

describe('VerifyScoreHandler', () => {
	let handler: VerifyScoreHandler;
	let storage: RefundBaseStorage;
	let logicServiceMock: {
		getActionName: jest.Mock,
		setDisableRefund: jest.Mock,
		setDisableSubRefundAll: jest.Mock,
		setDisableSubRefundFT: jest.Mock
	};
	let nextHandler: { handle: jest.Mock };

	const createResult = (overrides: any = {}) => ({
		settlementStatusId: SettlementStatusId.Abandoned1H,
		homeValue: '1',
		awayValue: '0',
		originalHomeValue: '1',
		originalAwayValue: '0',
		...overrides
	}) as any;

	const match = {
		matchDetail: {
			matchId: 1001,
			isSettleDetermined: false
		}
	} as any;

	beforeEach(() => {
		jest.clearAllMocks();

		logicServiceMock = {
			getActionName: jest.fn().mockReturnValue(CalculateAction.refund),
			setDisableRefund: jest.fn().mockReturnValue([false, false, false]),
			setDisableSubRefundAll: jest.fn().mockReturnValue(''),
			setDisableSubRefundFT: jest.fn().mockReturnValue('')
		};

		TestBed.configureTestingModule({
			imports: [ToastrModule.forRoot()],
			providers: [
				VerifyScoreHandler,
				RefundStorage,
				ToastrService,
				{ provide: LogicService, useValue: logicServiceMock }
			]
		});

		handler = TestBed.inject(VerifyScoreHandler);
		storage = TestBed.inject(RefundStorage);

		(storage.getMatch as any) = jest.fn().mockReturnValue(match);
		(storage.getHalfTimeResult as any) = jest.fn().mockReturnValue(createResult());
		(storage.getFullTimeResult as any) = jest.fn().mockReturnValue(createResult());
		(storage.error as any) = jest.fn();

		nextHandler = { handle: jest.fn() };
		handler.setNextHandler(nextHandler as any);
	});

	it('should show error and stop when action is blocked by setDisableRefund', () => {
		// Arrange
		logicServiceMock.setDisableRefund = jest.fn().mockReturnValue([true, true, true]);

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).toHaveBeenCalled();
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});

	it('should show error when SDT block for refund all with isSettleDetermined=true', () => {
		// Arrange
		match.matchDetail.isSettleDetermined = true;
		logicServiceMock.getActionName.mockReturnValue(CalculateAction.refund);
		logicServiceMock.setDisableSubRefundAll.mockReturnValue(RefundType.sdt);

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).toHaveBeenCalled();
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});

	it('should show error when NORMAL block for refund all with isSettleDetermined=false', () => {
		// Arrange
		match.matchDetail.isSettleDetermined = false;
		logicServiceMock.getActionName.mockReturnValue(CalculateAction.refund);
		logicServiceMock.setDisableSubRefundAll.mockReturnValue(RefundType.normal);

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).toHaveBeenCalled();
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});

	it('should show scoreChanged error when determined and score changed on HT', () => {
		// Arrange
		match.matchDetail.isSettleDetermined = true;
		(storage.getHalfTimeResult as any).mockReturnValue(createResult({
			settlementStatusId: SettlementStatusId.Abandoned1H,
			originalHomeValue: '0'
		}));

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).toHaveBeenCalled();
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});

	it('should proceed to next when not blocked and scores not changed', () => {
		// Arrange
		match.matchDetail.isSettleDetermined = false;

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).not.toHaveBeenCalled();
		expect(nextHandler.handle).toHaveBeenCalledWith(storage);
	});
});
