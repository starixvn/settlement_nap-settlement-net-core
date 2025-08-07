import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { BettingExchangeComponent } from './betting-exchange.component';
import { RefundStorage } from '../../../../storage/refund.storage';
import { RequestService } from '../../services/request.service';
import { LogicService } from '../../services/logic.service';
import { RefundType } from '../../models/constant.model';
import { BetDaq, BetFair } from '../../../sop-refund/models/match.model';
import { Result } from '../../../../../shared/models/result.model';

describe('BettingExchangeComponent', () => {
  let component: BettingExchangeComponent;
  let fixture: ComponentFixture<BettingExchangeComponent>;
  let dialog: MatDialog;
  let refundStorage: RefundStorage;
  let requestService: RequestService;
  let logicService: LogicService;

  const mockBetDaq: BetDaq = {
    isMoveBetDaq: true,
    isExcludeBetDaq: true,
    isSettleAbandonedMatchBetDaq: true,
    isRefundRunningBetDaq: true,
    excludeTicketsInRefund: false,
    settleDeterminedBetDaq: false
  };

  const mockBetFair: BetFair = {
    isMoveBetFair: true,
    isExcludeBetFair: true,
    isSettleAbandonedMatchBetFair: true,
    isRefundRunningBetFair: true,
    excludeTicketsInRefund: false,
    settleDeterminedBetFair: false
  };

  const mockMatch = {
    matchDetail: {
      matchId: 12345
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BettingExchangeComponent,
        FormsModule
      ],
      providers: [
        {
          provide: MatDialog,
          useValue: {
            open: jest.fn().mockReturnValue({
              afterClosed: () => of({ result: { isSuccessful: true } })
            })
          }
        },
        {
          provide: RefundStorage,
          useValue: {
            clear: jest.fn(),
            getMatch: jest.fn().mockReturnValue(mockMatch),
            getMatchDetail: jest.fn().mockReturnValue(mockMatch.matchDetail),
            error: jest.fn()
          }
        },
        {
          provide: RequestService,
          useValue: {
            refundRunningThirdPartyTickets: jest.fn()
          }
        },
        {
          provide: LogicService,
          useValue: {
            closePopupNotChanged: jest.fn(),
            closePopup: jest.fn(),
            settleDetermineUpdate: jest.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BettingExchangeComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    refundStorage = TestBed.inject(RefundStorage);
    requestService = TestBed.inject(RequestService);
    logicService = TestBed.inject(LogicService);

    component.betDaq = mockBetDaq;
    component.betFair = mockBetFair;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onOpenPopupSpecificBetTypes', () => {
    it('should clear refund storage and open specific bet types dialog', () => {
      // Arrange
      const type = 'BetFair';
      const action = 'ALL';
      const dialogSpy = jest.spyOn(dialog, 'open');

      // Act
      component.onOpenPopupSpecificBetTypes(type, action);

      // Assert
      expect(refundStorage.clear).toHaveBeenCalled();
      expect(dialogSpy).toHaveBeenCalledWith(
        expect.any(Function), // SpecificBettypeComponent
        {
          width: '630px',
          height: '500px',
          data: { type, action },
          hasBackdrop: true
        }
      );
    });
  });

  describe('onOpenPopupMoveBet', () => {
    it('should clear refund storage and open move bet dialog for BetDaq', () => {
      // Arrange
      const isBetDaq = true;
      const dialogSpy = jest.spyOn(dialog, 'open');

      // Act
      component.onOpenPopupMoveBet(isBetDaq);

      // Assert
      expect(refundStorage.clear).toHaveBeenCalled();
      expect(dialogSpy).toHaveBeenCalledWith(
        expect.any(Function), // MoveBetComponent
        {
          width: '630px',
          height: '500px',
          data: {
            matchId: mockMatch.matchDetail.matchId,
            refundType: RefundType.refundBetDaq
          },
          hasBackdrop: true
        }
      );
    });

    it('should clear refund storage and open move bet dialog for BetFair', () => {
      // Arrange
      const isBetDaq = false;
      const dialogSpy = jest.spyOn(dialog, 'open');

      // Act
      component.onOpenPopupMoveBet(isBetDaq);

      // Assert
      expect(refundStorage.clear).toHaveBeenCalled();
      expect(dialogSpy).toHaveBeenCalledWith(
        expect.any(Function), // MoveBetComponent
        {
          width: '630px',
          height: '500px',
          data: {
            matchId: mockMatch.matchDetail.matchId,
            refundType: RefundType.refundBetFair
          },
          hasBackdrop: true
        }
      );
    });

    it('should call closePopupNotChanged when dialog result is successful', () => {
      // Arrange
      const isBetDaq = true;
      const mockDialogRef = {
        afterClosed: () => of({ result: { isSuccessful: true } })
      };
      jest.spyOn(dialog, 'open').mockReturnValue(mockDialogRef as any);

      // Act
      component.onOpenPopupMoveBet(isBetDaq);

      // Assert
      expect(logicService.closePopupNotChanged).toHaveBeenCalled();
    });

    it('should call refundStorage.error when dialog result is not successful', () => {
      // Arrange
      const isBetDaq = true;
      const errorMessage = 'Error occurred';
      const mockDialogRef = {
        afterClosed: () => of({ result: { isSuccessful: false, errMsg: errorMessage } })
      };
      jest.spyOn(dialog, 'open').mockReturnValue(mockDialogRef as any);

      // Act
      component.onOpenPopupMoveBet(isBetDaq);

      // Assert
      expect(refundStorage.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('onSettleDeterminableTicketsChange', () => {
    it('should call logicService.settleDetermineUpdate with the provided value', () => {
      // Arrange
      const settleDeterminableTickets = true;

      // Act
      component.onSettleDeterminableTicketsChange(settleDeterminableTickets);

      // Assert
      expect(refundStorage.getMatch().matchDetail.isSettleDetermined).toBe(true);
      expect(logicService.settleDetermineUpdate).toHaveBeenCalled();
    });
  });

  describe('onRefundRunningThirdPartyTickets', () => {
    it('should refund running BetDaq tickets successfully', async () => {
      // Arrange
      const isBetDaq = true;
      const mockResult: Result = {
        errCode: 0,
        errMsg: '',
        isSuccessful: true,
        childMatchIds: '',
        settledSessionId: '',
        hasResultAmendment: false,
        isOrg: false
      };
      jest.spyOn(requestService, 'refundRunningThirdPartyTickets').mockResolvedValue(mockResult);

      // Act
      await component.onRefundRunningThirdPartyTickets(isBetDaq);

      // Assert
      expect(refundStorage.clear).toHaveBeenCalled();
      expect(requestService.refundRunningThirdPartyTickets).toHaveBeenCalledWith(
        mockMatch.matchDetail.matchId,
        RefundType.refundBetDaq
      );
      expect(logicService.closePopup).toHaveBeenCalled();
    });

    it('should refund running BetFair tickets successfully', async () => {
      // Arrange
      const isBetDaq = false;
      const mockResult: Result = {
        errCode: 0,
        errMsg: '',
        isSuccessful: true,
        childMatchIds: '',
        settledSessionId: '',
        hasResultAmendment: false,
        isOrg: false
      };
      jest.spyOn(requestService, 'refundRunningThirdPartyTickets').mockResolvedValue(mockResult);

      // Act
      await component.onRefundRunningThirdPartyTickets(isBetDaq);

      // Assert
      expect(refundStorage.clear).toHaveBeenCalled();
      expect(requestService.refundRunningThirdPartyTickets).toHaveBeenCalledWith(
        mockMatch.matchDetail.matchId,
        RefundType.refundBetFair
      );
      expect(logicService.closePopup).toHaveBeenCalled();
    });

    it('should handle error when refund fails', async () => {
      // Arrange
      const isBetDaq = true;
      const errorMessage = 'Refund failed';
      const mockResult: Result = {
        errCode: 1,
        errMsg: errorMessage,
        isSuccessful: false,
        childMatchIds: '',
        settledSessionId: '',
        hasResultAmendment: false,
        isOrg: false
      };
      jest.spyOn(requestService, 'refundRunningThirdPartyTickets').mockResolvedValue(mockResult);

      // Act
      await component.onRefundRunningThirdPartyTickets(isBetDaq);

      // Assert
      expect(refundStorage.clear).toHaveBeenCalled();
      expect(requestService.refundRunningThirdPartyTickets).toHaveBeenCalledWith(
        mockMatch.matchDetail.matchId,
        RefundType.refundBetDaq
      );
      expect(refundStorage.error).toHaveBeenCalledWith(errorMessage);
      expect(logicService.closePopup).not.toHaveBeenCalled();
    });
  });
}); 