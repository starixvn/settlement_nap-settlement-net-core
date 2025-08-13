import { TestBed } from '@angular/core/testing';
import { VerifyStatusHandler } from './verify-status.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RequestService } from '../../../components/sop-refund/services/request.service';
import { LogicService } from '../../../components/sop-refund/services/logic.service';

describe('VerifyStatusHandler', () => {
	let handler: VerifyStatusHandler;
	let storage: RefundBaseStorage;
	let requestServiceMock: { checkNewStatus: jest.Mock };
	let logicServiceMock: { getActionName: jest.Mock };
	let nextHandler: { handle: jest.Mock };

	const match = {
		matchDetail: { matchId: 555, isSettleAbandonedMatchIBC: true }
	} as any;

	beforeEach(() => {
		jest.clearAllMocks();

		requestServiceMock = { checkNewStatus: jest.fn() };
		logicServiceMock = { getActionName: jest.fn().mockReturnValue('REFUND') };

		TestBed.configureTestingModule({
			imports: [ToastrModule.forRoot()],
			providers: [
				VerifyStatusHandler,
				RefundStorage,
				ToastrService,
				{ provide: RequestService, useValue: requestServiceMock },
				{ provide: LogicService, useValue: logicServiceMock }
			]
		});

		handler = TestBed.inject(VerifyStatusHandler);
		storage = TestBed.inject(RefundStorage);

		// Arrange common storage mocks
		(storage.getMatch as any) = jest.fn().mockReturnValue(match);
		(storage.error as any) = jest.fn();

		// Chain next handler
		nextHandler = { handle: jest.fn() };
		handler.setNextHandler(nextHandler as any);
	});

	it('should proceed when checkNewStatus returns success', async () => {
		// Arrange
		requestServiceMock.checkNewStatus.mockResolvedValue({ isSuccessful: true });

		// Act
		await handler.handle(storage);

		// Assert
		expect(requestServiceMock.checkNewStatus).toHaveBeenCalledWith(555, 'REFUND', true);
		expect(nextHandler.handle).toHaveBeenCalledWith(storage);
		expect(storage.error).not.toHaveBeenCalled();
	});

	it('should show error and not proceed when checkNewStatus fails', async () => {
		// Arrange
		requestServiceMock.checkNewStatus.mockResolvedValue({ isSuccessful: false, errMsg: 'Bad status' });

		// Act
		await handler.handle(storage);

		// Assert
		expect(requestServiceMock.checkNewStatus).toHaveBeenCalledWith(555, 'REFUND', true);
		expect(storage.error).toHaveBeenCalledWith('Bad status');
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});
});
