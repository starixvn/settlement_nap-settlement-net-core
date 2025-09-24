import { BetStatusService } from './betstatus.service';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
import { ResourceID } from '../../constants';
import { SettlementStatusId } from '../../../shared/constants';

describe('BetStatusService', () => {
  let service: BetStatusService;

  beforeEach(() => {
    service = new BetStatusService();
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('createBetStatusRefund', () => {
    const createMockResultDetail = (resourceId: string, settlementStatusId: number): ResultDetail => {
      return {
        resourceId,
        settlementStatusId,
        homeValue: '1',
        awayValue: '0'
      } as ResultDetail;
    };

    it('should return "Refund;" when final result is selected', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated)
      ];
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated);

      // Act
      const result = service.createBetStatusRefund(selectedResults, finalResult);

      // Assert
      expect(result).toBe('Refund;');
    });

    it('should return "Refund;" when final result is selected regardless of settlement status', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.Final, SettlementStatusId.Refund)
      ];
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Refund);

      // Act
      const result = service.createBetStatusRefund(selectedResults, finalResult);

      // Assert
      expect(result).toBe('Refund;');
    });

    it('should return "Refund;" when first half is selected and final result has Refund status', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated)
      ];
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Refund);

      // Act
      const result = service.createBetStatusRefund(selectedResults, finalResult);

      // Assert
      expect(result).toBe('Refund;');
    });

    it('should return "Refund HT;" when first half is selected and final result does not have Refund status', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated)
      ];
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated);

      // Act
      const result = service.createBetStatusRefund(selectedResults, finalResult);

      // Assert
      expect(result).toBe('Refund HT;');
    });

    it('should return empty string when neither first half nor final result is selected', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.Et, SettlementStatusId.Calculated)
      ];
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated);

      // Act
      const result = service.createBetStatusRefund(selectedResults, finalResult);

      // Assert
      expect(result).toBe('');
    });

    it('should return empty string when selectedResults is empty', () => {
      // Arrange
      const selectedResults: ResultDetail[] = [];
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated);

      // Act
      const result = service.createBetStatusRefund(selectedResults, finalResult);

      // Assert
      expect(result).toBe('');
    });

    it('should prioritize final result over first half when both are selected', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated),
        createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated)
      ];
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated);

      // Act
      const result = service.createBetStatusRefund(selectedResults, finalResult);

      // Assert
      expect(result).toBe('Refund;');
    });
  });

  describe('createBetStatusCalc', () => {
    const createMockResultDetail = (resourceId: string, settlementStatusId: number): ResultDetail => {
      return {
        resourceId,
        settlementStatusId,
        homeValue: '1',
        awayValue: '0'
      } as ResultDetail;
    };

    it('should return "Refund;" when first half is selected but final is not, and final result has Refund status', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated)
      ];
      const firstHalfResult = createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated);
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Refund);

      // Act
      const result = service.createBetStatusCalc(selectedResults, firstHalfResult, finalResult);

      // Assert
      expect(result).toBe('Refund;');
    });

    it('should return empty string when first half is selected but final is not, and final result does not have Refund status', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated)
      ];
      const firstHalfResult = createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated);
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated);

      // Act
      const result = service.createBetStatusCalc(selectedResults, firstHalfResult, finalResult);

      // Assert
      expect(result).toBe('');
    });

    it('should return "Refund HT;" when final is selected but first half is not, and first half result has Refund status', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated)
      ];
      const firstHalfResult = createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Refund);
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated);

      // Act
      const result = service.createBetStatusCalc(selectedResults, firstHalfResult, finalResult);

      // Assert
      expect(result).toBe('Refund HT;');
    });

    it('should return empty string when final is selected but first half is not, and first half result does not have Refund status', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated)
      ];
      const firstHalfResult = createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated);
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated);

      // Act
      const result = service.createBetStatusCalc(selectedResults, firstHalfResult, finalResult);

      // Assert
      expect(result).toBe('');
    });

    it('should return empty string when both first half and final are selected', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated),
        createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated)
      ];
      const firstHalfResult = createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated);
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated);

      // Act
      const result = service.createBetStatusCalc(selectedResults, firstHalfResult, finalResult);

      // Assert
      expect(result).toBe('');
    });

    it('should return empty string when neither first half nor final is selected', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.Et, SettlementStatusId.Calculated)
      ];
      const firstHalfResult = createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated);
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated);

      // Act
      const result = service.createBetStatusCalc(selectedResults, firstHalfResult, finalResult);

      // Assert
      expect(result).toBe('');
    });

    it('should return empty string when selectedResults is empty', () => {
      // Arrange
      const selectedResults: ResultDetail[] = [];
      const firstHalfResult = createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated);
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Calculated);

      // Act
      const result = service.createBetStatusCalc(selectedResults, firstHalfResult, finalResult);

      // Assert
      expect(result).toBe('');
    });

    it('should handle different settlement status IDs correctly', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated)
      ];
      const firstHalfResult = createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated);
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.Running);

      // Act
      const result = service.createBetStatusCalc(selectedResults, firstHalfResult, finalResult);

      // Assert
      expect(result).toBe('');
    });

    it('should handle RefundHalfTime and RefundFullTime status IDs', () => {
      // Arrange
      const selectedResults = [
        createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated)
      ];
      const firstHalfResult = createMockResultDetail(ResourceID.FirstHalf, SettlementStatusId.Calculated);
      const finalResult = createMockResultDetail(ResourceID.Final, SettlementStatusId.RefundHalfTime);

      // Act
      const result = service.createBetStatusCalc(selectedResults, firstHalfResult, finalResult);

      // Assert
      expect(result).toBe('');
    });
  });
});
