import { TicketStatusPipe } from './ticket-status.pipe';
import { ResultDetail } from '../models/sportsbook-sop';

describe('TicketStatusPipe', () => {
  let pipe: TicketStatusPipe;

  beforeEach(() => {
    pipe = new TicketStatusPipe();
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform method', () => {
    it('should return all items when args is null', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'Running', isShow: false } as ResultDetail,
        { ticketStatus: 'Calculated', isShow: false } as ResultDetail,
        { ticketStatus: 'Pending', isShow: false } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, null);

      // Assert
      expect(result.length).toBe(3);
      expect(resultDetails[0].isShow).toBe(true);
      expect(resultDetails[1].isShow).toBe(true);
      expect(resultDetails[2].isShow).toBe(true);
    });

    it('should return all items when args is undefined', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'Running', isShow: false } as ResultDetail,
        { ticketStatus: 'Calculated', isShow: false } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, undefined);

      // Assert
      expect(result.length).toBe(2);
      expect(resultDetails[0].isShow).toBe(true);
      expect(resultDetails[1].isShow).toBe(true);
    });

    it('should return all items when args is empty string', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'Running', isShow: false } as ResultDetail,
        { ticketStatus: 'Calculated', isShow: false } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, '');

      // Assert
      expect(result.length).toBe(2);
      expect(resultDetails[0].isShow).toBe(true);
      expect(resultDetails[1].isShow).toBe(true);
    });

    it('should filter items by matching ticketStatus', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'Running', isShow: false } as ResultDetail,
        { ticketStatus: 'Calculated', isShow: false } as ResultDetail,
        { ticketStatus: 'Pending', isShow: false } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, 'Calculated');

      // Assert
      expect(result.length).toBe(1);
      expect(result[0].ticketStatus).toBe('Calculated');
      expect(resultDetails[0].isShow).toBe(false);
      expect(resultDetails[1].isShow).toBe(true);
      expect(resultDetails[2].isShow).toBe(false);
    });

    it('should filter items by multiple ticketStatus values', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'Running', isShow: false } as ResultDetail,
        { ticketStatus: 'Calculated', isShow: false } as ResultDetail,
        { ticketStatus: 'Pending', isShow: false } as ResultDetail,
        { ticketStatus: 'Rejected', isShow: false } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, 'Calculated,Pending');

      // Assert
      expect(result.length).toBe(2);
      expect(resultDetails[0].isShow).toBe(false);
      expect(resultDetails[1].isShow).toBe(true);
      expect(resultDetails[2].isShow).toBe(true);
      expect(resultDetails[3].isShow).toBe(false);
    });

    it('should exclude "Running" status when args does not include "Running;" and args is not empty', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'Running', isShow: false } as ResultDetail,
        { ticketStatus: 'Calculated', isShow: false } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, 'Running');

      // Assert
      expect(result.length).toBe(0);
      expect(resultDetails[0].isShow).toBe(false);
    });

    it('should include "Running" status when args includes "Running;"', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'Running', isShow: false } as ResultDetail,
        { ticketStatus: 'Calculated', isShow: false } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, 'Running;');

      // Assert
      expect(result.length).toBe(1);
      expect(result[0].ticketStatus).toBe('Running');
      expect(resultDetails[0].isShow).toBe(true);
    });

    it('should handle "Confirmed by Trader" filter with resultStatusId === 3', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'Calculated', resultStatusId: 3, isShow: false } as ResultDetail,
        { ticketStatus: 'Calculated', resultStatusId: 1, isShow: false } as ResultDetail,
        { ticketStatus: 'Pending', resultStatusId: 3, isShow: false } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, 'Confirmed by Trader');

      // Assert
      expect(result.length).toBe(2);
      expect(resultDetails[0].isShow).toBe(true);
      expect(resultDetails[1].isShow).toBe(false);
      expect(resultDetails[2].isShow).toBe(true);
    });

    it('should exclude "No Ticket" items when betType is not in allowNoTicketStatus', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'No Ticket', betType: 'TypeA', isShow: false } as ResultDetail,
        { ticketStatus: 'No Ticket', betType: 'TypeB', isShow: false } as ResultDetail,
        { ticketStatus: 'Calculated', betType: 'TypeC', isShow: false } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, 'No Ticket', ['TypeB']);

      // Assert
      expect(result.length).toBe(1);
      expect(result[0].betType).toBe('TypeB');
      expect(resultDetails[0].isShow).toBe(false);
      expect(resultDetails[1].isShow).toBe(true);
      expect(resultDetails[2].isShow).toBe(false);
    });

    it('should include all "No Ticket" items when allowNoTicketStatus includes all betTypes', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'No Ticket', betType: 'TypeA', isShow: false } as ResultDetail,
        { ticketStatus: 'No Ticket', betType: 'TypeB', isShow: false } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, 'No Ticket', ['TypeA', 'TypeB']);

      // Assert
      expect(result.length).toBe(2);
      expect(resultDetails[0].isShow).toBe(true);
      expect(resultDetails[1].isShow).toBe(true);
    });

    it('should handle complex filtering with multiple conditions', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'Calculated', betType: 'TypeA', isShow: false } as ResultDetail,
        { ticketStatus: 'Pending', betType: 'TypeB', isShow: false } as ResultDetail,
        { ticketStatus: 'Running', betType: 'TypeC', isShow: false } as ResultDetail,
        { ticketStatus: 'No Ticket', betType: 'TypeD', isShow: false } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, 'Calculated,Pending,No Ticket', ['TypeD']);

      // Assert
      expect(result.length).toBe(3);
      expect(resultDetails[0].isShow).toBe(true);
      expect(resultDetails[1].isShow).toBe(true);
      expect(resultDetails[2].isShow).toBe(false);
      expect(resultDetails[3].isShow).toBe(true);
    });

    it('should handle empty resultDetails array', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [];

      // Act
      const result = pipe.transform(resultDetails, 'Calculated');

      // Assert
      expect(result.length).toBe(0);
    });

    it('should set isShow to false for filtered out items', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'Calculated', isShow: true } as ResultDetail,
        { ticketStatus: 'Pending', isShow: true } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, 'Calculated');

      // Assert
      expect(result.length).toBe(1);
      expect(resultDetails[0].isShow).toBe(true);
      expect(resultDetails[1].isShow).toBe(false);
    });

    it('should handle combination of "Running;" and other statuses', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [
        { ticketStatus: 'Running', isShow: false } as ResultDetail,
        { ticketStatus: 'Calculated', isShow: false } as ResultDetail,
        { ticketStatus: 'Pending', isShow: false } as ResultDetail
      ];

      // Act
      const result = pipe.transform(resultDetails, 'Running;,Calculated');

      // Assert
      expect(result.length).toBe(2);
      expect(resultDetails[0].isShow).toBe(true);
      expect(resultDetails[1].isShow).toBe(true);
      expect(resultDetails[2].isShow).toBe(false);
    });
  });
});