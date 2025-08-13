import { TestBed } from '@angular/core/testing';
import { VerifyHTStatusHandler } from './verify-ht-status.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ResultStatusId, TicketStatusText } from '../../../../shared/constants';
import { Language } from '../../../../shared/language.native';

describe('VerifyHTStatusHandler', () => {
	let handler: VerifyHTStatusHandler;
	let storage: RefundBaseStorage;
	let nextHandler: { handle: jest.Mock };

	const halfTimeBase = { checked: false, resultStatusId: 0, ticketStatus: '' } as any;

	beforeEach(() => {
		jest.clearAllMocks();
		TestBed.configureTestingModule({
			imports: [ToastrModule.forRoot()],
			providers: [
				VerifyHTStatusHandler,
				RefundStorage,
				ToastrService
			]
		});

		handler = TestBed.inject(VerifyHTStatusHandler);
		storage = TestBed.inject(RefundStorage);
		(storage.getHalfTimeResult as any) = jest.fn().mockReturnValue({ ...halfTimeBase });
		(storage.error as any) = jest.fn();

		nextHandler = { handle: jest.fn() };
		handler.setNextHandler(nextHandler as any);
	});

	it('should proceed when halfTime.checked is true', () => {
		// Arrange
		(storage.getHalfTimeResult as jest.Mock).mockReturnValue({ ...halfTimeBase, checked: true });

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).not.toHaveBeenCalled();
		expect(nextHandler.handle).toHaveBeenCalledWith(storage);
	});

	it('should proceed when resultStatusId is AutoCompleted', () => {
		// Arrange
		(storage.getHalfTimeResult as jest.Mock).mockReturnValue({ ...halfTimeBase, resultStatusId: ResultStatusId.AutoCompleted });

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).not.toHaveBeenCalled();
		expect(nextHandler.handle).toHaveBeenCalledWith(storage);
	});

	it('should proceed when resultStatusId is ManualCompleted', () => {
		// Arrange
		(storage.getHalfTimeResult as jest.Mock).mockReturnValue({ ...halfTimeBase, resultStatusId: ResultStatusId.ManualCompleted });

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).not.toHaveBeenCalled();
		expect(nextHandler.handle).toHaveBeenCalledWith(storage);
	});

	it('should proceed when ticketStatus is noTicket', () => {
		// Arrange
		(storage.getHalfTimeResult as jest.Mock).mockReturnValue({ ...halfTimeBase, ticketStatus: TicketStatusText.noTicket });

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).not.toHaveBeenCalled();
		expect(nextHandler.handle).toHaveBeenCalledWith(storage);
	});

	it('should error when none of the conditions met', () => {
		// Arrange
		(storage.getHalfTimeResult as jest.Mock).mockReturnValue({ ...halfTimeBase, checked: false, resultStatusId: 999, ticketStatus: 'running' });

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeNotSettleYet);
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});
});
