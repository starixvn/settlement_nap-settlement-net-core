import { TestBed } from '@angular/core/testing';
import { ConfirmFullTimeHandler } from './confirm-fulltime.handler';
import { VerifyActionService } from '../../../components/calc/services/verify-action.service';
import { MessageBoxService } from '../../../../shared/services';
import { Language } from '../../../../shared/language.native';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { RequestService } from '../../../components/calc/services/request.service';
import { ModalDialogMessage } from '../../../../shared/models';
const mockConfirm = jest.fn(
	(
		dialogModel: ModalDialogMessage,
		func: () => void,
		rejectedFunc: () => void = null
	) => {
		func();
	}
);
describe('ConfirmFullTimeHandler', () => {
	let handler: ConfirmFullTimeHandler;
	let verifyActionService: VerifyActionService;
	let messageBoxService: MessageBoxService;
	let storage: CalculateStorage;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule, ToastrModule.forRoot()],
			providers: [
				ConfirmFullTimeHandler,
				VerifyScoreGoalService,
				VerifyActionService,
				CalculateStorage,
				ToastrService,
				RequestService,
				{
					provide: MessageBoxService,
					useValue: {
						confirm: mockConfirm,
					},
				}
			]
		});

		handler = TestBed.inject(ConfirmFullTimeHandler);
		verifyActionService = TestBed.inject(VerifyActionService);
		messageBoxService = TestBed.inject(MessageBoxService);
		storage = TestBed.inject(CalculateStorage);
		storage.setConfirmMessage = jest.fn();
	});

	it('should handle when score is changed full time', async () => {
		const matchDetail = { id: 1 };
		const childMatches = [{ id: 1, checked: true }];
		storage.getMatch = jest.fn().mockReturnValue({ matchDetail, childMatches });
		storage.getIsResettleTicket = jest.fn().mockReturnValue(false);
		verifyActionService.isScoreChangedFullTime = jest.fn().mockReturnValue(Promise.resolve(true));

		storage.setIsResettleTicket = jest.fn();

		await handler.handle(storage);

		expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.recalculateNotification);
		expect(messageBoxService.confirm).toHaveBeenCalled();
		expect(storage.setIsResettleTicket).toHaveBeenCalledWith(true);
	});

	it('should handle when score is not changed full time and child matches are selected', async () => {
		const matchDetail = { id: 1 };
		const childMatches = [{ id: 1, checked: true }];
		storage.getMatch = jest.fn().mockReturnValue({ matchDetail, childMatches });
		storage.getIsResettleTicket = jest.fn().mockReturnValue(false);
		verifyActionService.isScoreChangedFullTime = jest.fn().mockReturnValue(Promise.resolve(false));

		await handler.handle(storage);

		expect(storage.setConfirmMessage).toHaveBeenCalledWith(`${Language.doubleCheckCalculateFullTime}${Language.soccer.confirmAutoRefundChildMatch}`);
		expect(messageBoxService.confirm).toHaveBeenCalled();
	});
});