import { TestBed } from '@angular/core/testing';
import { ConfirmFtNoTicketHandler } from './confirm-ft-noTicket.handler';
import { MessageBoxService } from '../../../../shared/services';
import { RequestService } from '../../../components/calc/services/request.service';
import { Language } from '../../../../shared/language.native';
import { CalculateAction, ResultStatusId, ScoreSourceType } from '../../../../shared/constants';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { AbstractHandler } from '../../abstract.handler.native';
import { CalculateBaseStorage } from '../../../storage/storage.service.native';
import { ExternalResult, ResultDetail } from '../../../../shared/models/sportsbook-sop';
import { ModalDialogMessage } from '../../../../shared/models';
import { ResultByTeamNamePipe } from '../../../../shared/pipes/result-by-team-name.pipe';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';
import { SourceIds } from '../../../../basketball/constants/source-ids';
import { MatchDetailSoccer } from '../../../components/calc/models/match.model';

const mockConfirm = jest.fn(
  (
    dialogModel: ModalDialogMessage,
    func: () => void,
    rejectedFunc: () => void = null
  ) => {
    func();
  }
);

describe('ConfirmFtNoTicketHandler', () => {
  let handler: ConfirmFtNoTicketHandler;
  let messageBoxService: MessageBoxService;
  let requestService: RequestService;
  let storage: CalculateBaseStorage;

  const matchDetail = {
    matchId: 12345
  } as MatchDetailSoccer;

  const match = {
    matchDetail,
    externalResults: []
  } as any;

  const halfTimeResult: ResultDetail = {
    resultStatusId: ResultStatusId.RunningOne,
    checked: false,
    homeValue: '',
    awayValue: '',
    externalScores: []
  } as ResultDetail;

  const fullTimeResult: ResultDetail = {
    resultStatusId: ResultStatusId.RunningOne,
    checked: false,
    homeValue: '',
    awayValue: '',
    externalScores: []
  } as ResultDetail;

  const ticketCounts = [
    { groupResult: '1H', totalTicket: 0 },
    { groupResult: '2H', totalTicket: 0 },
    { groupResult: 'BothHalf', totalTicket: 0 }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        ConfirmFtNoTicketHandler,
        RequestService,
        CalculateStorage,
        ToastrService,
        VerifyScoreGoalService,
        ResultByTeamNamePipe,
        VerificationBaseService,
        {
          provide: MessageBoxService,
          useValue: {
            confirm: mockConfirm,
          },
        }
      ]
    });

    handler = TestBed.inject(ConfirmFtNoTicketHandler);
    messageBoxService = TestBed.inject(MessageBoxService);
    requestService = TestBed.inject(RequestService);
    storage = TestBed.inject(CalculateStorage);
    
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getHalfTimeResult = jest.fn().mockReturnValue(halfTimeResult);
    storage.getFullTimeResult = jest.fn().mockReturnValue(fullTimeResult);
    storage.error = jest.fn();
    storage.setConfirmMessage = jest.fn();
    storage.getConfirmMessage = jest.fn().mockReturnValue(new ModalDialogMessage());
    storage.setIsIgnoreCheckHt = jest.fn();
    storage.setCalculateAction = jest.fn();

    // Reset mock call history
    jest.clearAllMocks();

    // Reset to default values
    halfTimeResult.resultStatusId = ResultStatusId.RunningOne;
    halfTimeResult.checked = false;
    halfTimeResult.homeValue = '';
    halfTimeResult.awayValue = '';
    halfTimeResult.externalScores = [];
    fullTimeResult.resultStatusId = ResultStatusId.RunningOne;
    match.externalResults = [];

    requestService.countTickets = jest.fn().mockResolvedValue(ticketCounts);
  });

  describe('when tickets exist', () => {
    it('should call super.handle when 1H tickets exist', async () => {
      // Arrange
      const ticketsWithFirst = [
        { groupResult: '1H', totalTicket: 5 },
        { groupResult: '2H', totalTicket: 0 },
        { groupResult: 'BothHalf', totalTicket: 0 }
      ];
      requestService.countTickets = jest.fn().mockResolvedValue(ticketsWithFirst);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.countTickets).toHaveBeenCalledWith(matchDetail.matchId);
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
      expect(storage.error).not.toHaveBeenCalled();
      expect(messageBoxService.confirm).not.toHaveBeenCalled();
    });

    it('should call super.handle when 2H tickets exist', async () => {
      // Arrange
      const ticketsWithSecond = [
        { groupResult: '1H', totalTicket: 0 },
        { groupResult: '2H', totalTicket: 3 },
        { groupResult: 'BothHalf', totalTicket: 0 }
      ];
      requestService.countTickets = jest.fn().mockResolvedValue(ticketsWithSecond);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should call super.handle when BothHalf tickets exist', async () => {
      // Arrange
      const ticketsWithBoth = [
        { groupResult: '1H', totalTicket: 0 },
        { groupResult: '2H', totalTicket: 0 },
        { groupResult: 'BothHalf', totalTicket: 2 }
      ];
      requestService.countTickets = jest.fn().mockResolvedValue(ticketsWithBoth);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });
  });

  describe('when half-time is settled or confirmed', () => {
    it('should call super.handle when half-time is auto completed', async () => {
      // Arrange
      halfTimeResult.resultStatusId = ResultStatusId.AutoCompleted;
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should call super.handle when half-time is manually completed', async () => {
      // Arrange
      halfTimeResult.resultStatusId = ResultStatusId.ManualCompleted;
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should call super.handle when half-time result is checked', async () => {
      // Arrange
      halfTimeResult.checked = true;
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should call super.handle when external results contain trader source', async () => {
      // Arrange
      const externalResults: ExternalResult[] = [
        {
          sourceId: ScoreSourceType.trader,
          resultDetails: [{ resourceId: '01' }]
        } as any
      ];
      match.externalResults = externalResults;
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should call super.handle when external results contain SBO source', async () => {
      // Arrange
      const externalResults: ExternalResult[] = [
        {
          sourceId: ScoreSourceType.Sbo,
          resultDetails: [{ resourceId: '01' }]
        } as any
      ];
      match.externalResults = externalResults;
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });
  });

  describe('when no tickets and half-time not settled', () => {
    it('should show confirmation and proceed when FT is confirmed', async () => {
      // Arrange
      fullTimeResult.resultStatusId = ResultStatusId.TraderConfirm;
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.soccer.confirmAutoSelectFtNoTicket);
      expect(messageBoxService.confirm).toHaveBeenCalledWith(
        expect.any(ModalDialogMessage),
        expect.any(Function)
      );
      expect(storage.setIsIgnoreCheckHt).toHaveBeenCalledWith(true);
      expect(storage.setCalculateAction).toHaveBeenCalledWith(CalculateAction.calculate);
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should set half-time values correctly when confirming', async () => {
      // Arrange
      fullTimeResult.resultStatusId = ResultStatusId.TraderConfirm;
      halfTimeResult.externalScores = [
        {
          sourceId: SourceIds.screenshot,
          homeValue: '1',
          awayValue: '1'
        } as any
      ];

      // Act
      await handler.handle(storage);

      // Assert
      expect(halfTimeResult.homeValue).toBe('0');
      expect(halfTimeResult.awayValue).toBe('0');
      expect(halfTimeResult.checked).toBe(true);
      expect(halfTimeResult.externalScores[0].homeValue).toBe('0');
      expect(halfTimeResult.externalScores[0].awayValue).toBe('0');
    });

    it('should handle case when screenshot external score does not exist', async () => {
      // Arrange
      fullTimeResult.resultStatusId = ResultStatusId.TraderConfirm;
      halfTimeResult.externalScores = [
        {
          sourceId: ScoreSourceType.trader,
          homeValue: '1',
          awayValue: '1'
        } as any
      ];

      // Act
      await handler.handle(storage);

      // Assert
      expect(halfTimeResult.homeValue).toBe('0');
      expect(halfTimeResult.awayValue).toBe('0');
      expect(halfTimeResult.checked).toBe(true);
      // Screenshot score should remain unchanged since it doesn't exist
      expect(halfTimeResult.externalScores[0].homeValue).toBe('1');
      expect(halfTimeResult.externalScores[0].awayValue).toBe('1');
    });

    it('should call storage.error when FT is not confirmed', async () => {
      // Arrange
      fullTimeResult.resultStatusId = ResultStatusId.RunningOne;

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeNotSettleYet);
      expect(messageBoxService.confirm).not.toHaveBeenCalled();
    });
  });

  describe('edge cases for external results filtering', () => {
    it('should not consider external results with non-matching source types', async () => {
      // Arrange
      const externalResults: ExternalResult[] = [
        {
          sourceId: ScoreSourceType.screenshot, // Not in sourceTypeIds
          resultDetails: [{ resourceId: '01' }]
        } as any
      ];
      match.externalResults = externalResults;
      fullTimeResult.resultStatusId = ResultStatusId.TraderConfirm;
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      // Should proceed to confirmation since screenshot is not in [trader, Sbo]
      expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.soccer.confirmAutoSelectFtNoTicket);
      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should handle empty result details in external results', async () => {
      // Arrange
      const externalResults: ExternalResult[] = [
        {
          sourceId: ScoreSourceType.trader,
          resultDetails: [] // Empty array
        } as any
      ];
      match.externalResults = externalResults;
      fullTimeResult.resultStatusId = ResultStatusId.TraderConfirm;

      // Act
      await handler.handle(storage);

      // Assert
      // Should proceed to confirmation since resultDetails is empty
      expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.soccer.confirmAutoSelectFtNoTicket);
      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should handle multiple external results with mixed source types', async () => {
      // Arrange
      const externalResults: ExternalResult[] = [
        {
          sourceId: ScoreSourceType.screenshot,
          resultDetails: [{ resourceId: '01' }]
        } as any,
        {
          sourceId: ScoreSourceType.trader,
          resultDetails: [{ resourceId: '02' }]
        } as any
      ];
      match.externalResults = externalResults;
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      // Should call super.handle since trader source has result details
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });
  });

  describe('ticket counting edge cases', () => {
    it('should handle empty ticket counts array', async () => {
      // Arrange
      requestService.countTickets = jest.fn().mockResolvedValue([]);
      fullTimeResult.resultStatusId = ResultStatusId.TraderConfirm;

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.soccer.confirmAutoSelectFtNoTicket);
      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should handle ticket counts with irrelevant group results', async () => {
      // Arrange
      const irrelevantTickets = [
        { groupResult: 'OtherGroup', totalTicket: 10 },
        { groupResult: 'AnotherGroup', totalTicket: 5 }
      ];
      requestService.countTickets = jest.fn().mockResolvedValue(irrelevantTickets);
      fullTimeResult.resultStatusId = ResultStatusId.TraderConfirm;

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.soccer.confirmAutoSelectFtNoTicket);
      expect(messageBoxService.confirm).toHaveBeenCalled();
    });
  });
});
