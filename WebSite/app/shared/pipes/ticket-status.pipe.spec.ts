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

  it('should show related resources when resultDetail is shown', () => {
    // Arrange
    const resultDetails: ResultDetail[] = [
      {
        resourceId: '01',
        ticketStatus: 'Running',
        relatedCalResource: '02,03',
        isShow: true
      } as ResultDetail,
      {
        resourceId: '02',
        ticketStatus: 'Calculated',
        relatedCalResource: '',
        isShow: false
      } as ResultDetail,
      {
        resourceId: '03',
        ticketStatus: 'Calculated',
        relatedCalResource: '',
        isShow: false
      } as ResultDetail,
      {
        resourceId: '04',
        ticketStatus: 'Calculated',
        relatedCalResource: '',
        isShow: false
      } as ResultDetail
    ];

    // Act
    const result = pipe.transform(resultDetails, 'Running');

    // Assert
    expect(resultDetails[0].isShow).toBe(true); // Resource 01 should be shown
    expect(resultDetails[1].isShow).toBe(true); // Resource 02 should be shown (related to 01)
    expect(resultDetails[2].isShow).toBe(true); // Resource 03 should be shown (related to 01)
    expect(resultDetails[3].isShow).toBe(false); // Resource 04 should not be shown (not related)
  });

  it('should handle multiple related resources with different separators', () => {
    // Arrange
    const resultDetails: ResultDetail[] = [
      {
        resourceId: '01',
        ticketStatus: 'Running',
        relatedCalResource: '02; 03, 04',
        isShow: true
      } as ResultDetail,
      {
        resourceId: '02',
        ticketStatus: 'Calculated',
        relatedCalResource: '',
        isShow: false
      } as ResultDetail,
      {
        resourceId: '03',
        ticketStatus: 'Calculated',
        relatedCalResource: '',
        isShow: false
      } as ResultDetail,
      {
        resourceId: '04',
        ticketStatus: 'Calculated',
        relatedCalResource: '',
        isShow: false
      } as ResultDetail
    ];

    // Act
    pipe.transform(resultDetails, 'Running');

    // Assert
    expect(resultDetails[1].isShow).toBe(true); // Resource 02 should be shown
    expect(resultDetails[2].isShow).toBe(true); // Resource 03 should be shown
    expect(resultDetails[3].isShow).toBe(true); // Resource 04 should be shown
  });

  it('should not show related resources when main resource is not shown', () => {
    // Arrange
    const resultDetails: ResultDetail[] = [
      {
        resourceId: '01',
        ticketStatus: 'Running',
        relatedCalResource: '02,03',
        isShow: false
      } as ResultDetail,
      {
        resourceId: '02',
        ticketStatus: 'Calculated',
        relatedCalResource: '',
        isShow: false
      } as ResultDetail,
      {
        resourceId: '03',
        ticketStatus: 'Calculated',
        relatedCalResource: '',
        isShow: false
      } as ResultDetail
    ];

    // Act
    pipe.transform(resultDetails, 'Calculated'); // Filter for Calculated only

    // Assert
    expect(resultDetails[0].isShow).toBe(false); // Resource 01 should not be shown
    expect(resultDetails[1].isShow).toBe(false); // Resource 02 should not be shown (01 is not shown)
    expect(resultDetails[2].isShow).toBe(false); // Resource 03 should not be shown (01 is not shown)
  });

  it('should handle empty relatedCalResource', () => {
    // Arrange
    const resultDetails: ResultDetail[] = [
      {
        resourceId: '01',
        ticketStatus: 'Running',
        relatedCalResource: '',
        isShow: true
      } as ResultDetail,
      {
        resourceId: '02',
        ticketStatus: 'Calculated',
        relatedCalResource: '',
        isShow: false
      } as ResultDetail
    ];

    // Act
    pipe.transform(resultDetails, 'Running');

    // Assert
    expect(resultDetails[0].isShow).toBe(true); // Resource 01 should be shown
    expect(resultDetails[1].isShow).toBe(false); // Resource 02 should not be shown (no relation)
  });
});