import { TestBed } from '@angular/core/testing';
import { DoubleCheckConfirmRefundHandler } from './double-check-confirm-refund.handler.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { LogicService } from '../../../components/sop-refund/services/logic.service';
import { Language } from '../../../../shared/language.native';

describe('DoubleCheckConfirmRefundHandler', () => {
	let handler: DoubleCheckConfirmRefundHandler;
	let storage: RefundBaseStorage;
	let logicServiceMock: { showConfirmMessage: jest.Mock };
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
		logicServiceMock = { showConfirmMessage: jest.fn(cb => cb()) } as any; // run callback immediately

		TestBed.configureTestingModule({
			imports: [ToastrModule.forRoot()],
			providers: [
				DoubleCheckConfirmRefundHandler,
				RefundStorage,
				ToastrService,
				{ provide: LogicService, useValue: logicServiceMock }
			]
		});

		handler = TestBed.inject(DoubleCheckConfirmRefundHandler);
		storage = TestBed.inject(RefundStorage);
		(storage.setConfirmMessage as any) = jest.fn();
		(storage.getSelectedResource as any) = jest.fn();

		nextHandler = { handle: jest.fn() };
		handler.setNextHandler(nextHandler as any);
	});

	it('should set confirmRefund when none selected are confirmed and proceed', () => {
		// Arrange
		(storage.getSelectedResource as any).mockReturnValue(selected([{},{ }]))

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.confirmRefund.confirmRefund);
		expect(nextHandler.handle).toHaveBeenCalledWith(storage);
	});

	it('should set undoConfirm when any selected is confirmed and proceed', () => {
		// Arrange
		(storage.getSelectedResource as any).mockReturnValue(selected([{ normal: true },{ }]))

		// Act
		handler.handle(storage);

		// Assert
		expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.confirmRefund.undoConfirm);
		expect(nextHandler.handle).toHaveBeenCalledWith(storage);
	});
});
