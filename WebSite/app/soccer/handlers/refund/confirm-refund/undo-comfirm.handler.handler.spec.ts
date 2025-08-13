import { TestBed } from '@angular/core/testing';
import { UndoConfirmHandler } from './undo-comfirm.handler.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Language } from '../../../../shared/language.native';

describe('UndoConfirmHandler', () => {
	let handler: UndoConfirmHandler;
	let storage: RefundBaseStorage;
	let nextHandler: { handle: jest.Mock };

	const selected = (flags: Array<{ sdt?: boolean; normal?: boolean }>) =>
		flags.map((f, idx) => ({
			resourceId: idx.toString().padStart(2, '0'),
			resultSettingData: {
				isConfirmedRefund: !!f.normal,
				isConfirmedRefundSdt: !!f.sdt
			}
		})) as any[];

	beforeEach(() => {
		jest.clearAllMocks();
		TestBed.configureTestingModule({
			imports: [ToastrModule.forRoot()],
			providers: [
				UndoConfirmHandler,
				RefundStorage,
				ToastrService
			]
		});

		handler = TestBed.inject(UndoConfirmHandler);
		storage = TestBed.inject(RefundStorage);
		(storage.getSelectedResource as any) = jest.fn();
		(storage.error as any) = jest.fn();

		nextHandler = { handle: jest.fn() };
		handler.setNextHandler(nextHandler as any);
	});

	it('should proceed when all selected are confirmed', () => {
		// Arrange
		(storage.getSelectedResource as any).mockReturnValue(selected([{ normal: true },{ sdt: true }]))

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).not.toHaveBeenCalled();
		expect(nextHandler.handle).toHaveBeenCalledWith(storage);
	});

	it('should show error when any selected is not confirmed', () => {
		// Arrange
		(storage.getSelectedResource as any).mockReturnValue(selected([{ normal: true },{ }]))

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.differentStates);
		expect(nextHandler.handle).not.toHaveBeenCalled();
	});
});
