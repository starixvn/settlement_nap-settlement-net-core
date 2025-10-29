import { TicketStatusPipe } from './ticket-status.pipe';
import { ResultDetail } from '../../shared/models/sportsbook-sop';

describe('TicketStatusPipe', () => {
    let pipe: TicketStatusPipe;

    beforeEach(() => {
        pipe = new TicketStatusPipe();
    });

    it('should be created', () => {
        expect(pipe).toBeTruthy();
    });

    describe('transform', () => {
        it('should show items matching ticket status', () => {
            const resultDetails: ResultDetail[] = [
                {
                    resourceId: '01',
                    ticketStatus: 'Running',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '02',
                    ticketStatus: 'Calculated',
                    isShow: false
                } as ResultDetail
            ];

            const result = pipe.transform(resultDetails, 'Running;', resultDetails);

            expect(result.length).toBe(1);
            expect(result[0].resourceId).toBe('01');
            expect(result[0].isShow).toBe(true);
        });

        it('should hide Running items when Running is not in args', () => {
            const resultDetails: ResultDetail[] = [
                {
                    resourceId: '01',
                    ticketStatus: 'Running',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '02',
                    ticketStatus: 'Calculated',
                    isShow: false
                } as ResultDetail
            ];

            const result = pipe.transform(resultDetails, 'Calculated;', resultDetails);

            expect(result.length).toBe(1);
            expect(result[0].resourceId).toBe('02');
            expect(resultDetails[0].isShow).toBe(false);
        });

        it('should show all items when args is null or empty', () => {
            const resultDetails: ResultDetail[] = [
                {
                    resourceId: '01',
                    ticketStatus: 'Running',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '02',
                    ticketStatus: 'Calculated',
                    isShow: false
                } as ResultDetail
            ];

            const result = pipe.transform(resultDetails, '', resultDetails);

            expect(result.length).toBe(2);
            expect(result[0].isShow).toBe(true);
            expect(result[1].isShow).toBe(true);
        });

        it('should filter confirmed trader items by resultStatusId', () => {
            const resultDetails: ResultDetail[] = [
                {
                    resourceId: '01',
                    ticketStatus: 'Other',
                    resultStatusId: 3,
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '02',
                    ticketStatus: 'Other',
                    resultStatusId: 2,
                    isShow: false
                } as ResultDetail
            ];

            const result = pipe.transform(resultDetails, 'Confirmed by Trader', resultDetails);

            expect(result.length).toBe(1);
            expect(result[0].resourceId).toBe('01');
            expect(result[0].isShow).toBe(true);
        });

        it('should show related resources when main resource is shown', () => {
            const resultDetails: ResultDetail[] = [
                {
                    resourceId: '01',
                    ticketStatus: 'Running',
                    relatedCalResources: '02,03',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '02',
                    ticketStatus: 'Calculated',
                    relatedCalResources: '',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '03',
                    ticketStatus: 'Calculated',
                    relatedCalResources: '',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '04',
                    ticketStatus: 'Calculated',
                    relatedCalResources: '',
                    isShow: false
                } as ResultDetail
            ];

            const result = pipe.transform(resultDetails, 'Running;', resultDetails);

            expect(resultDetails[0].isShow).toBe(true);
            expect(resultDetails[1].isShow).toBe(true);
            expect(resultDetails[2].isShow).toBe(true);
            expect(resultDetails[3].isShow).toBe(false);
        });

        it('should handle multiple related resources with different separators', () => {
            const resultDetails: ResultDetail[] = [
                {
                    resourceId: '01',
                    ticketStatus: 'Running',
                    relatedCalResources: '02; 03, 04',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '02',
                    ticketStatus: 'Calculated',
                    relatedCalResources: '',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '03',
                    ticketStatus: 'Calculated',
                    relatedCalResources: '',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '04',
                    ticketStatus: 'Calculated',
                    relatedCalResources: '',
                    isShow: false
                } as ResultDetail
            ];

            pipe.transform(resultDetails, 'Running;', resultDetails);

            expect(resultDetails[1].isShow).toBe(true);
            expect(resultDetails[2].isShow).toBe(true);
            expect(resultDetails[3].isShow).toBe(true);
        });

        it('should not show related resources when main resource is not shown', () => {
            const resultDetails: ResultDetail[] = [
                {
                    resourceId: '01',
                    ticketStatus: 'Running',
                    relatedCalResources: '02,03',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '02',
                    ticketStatus: 'Calculated',
                    relatedCalResources: '',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '03',
                    ticketStatus: 'Calculated',
                    relatedCalResources: '',
                    isShow: false
                } as ResultDetail
            ];

            pipe.transform(resultDetails, 'Calculated;', resultDetails);

            expect(resultDetails[0].isShow).toBe(false);
            expect(resultDetails[1].isShow).toBe(true);
            expect(resultDetails[2].isShow).toBe(true);
        });

        it('should handle empty relatedCalResources', () => {
            const resultDetails: ResultDetail[] = [
                {
                    resourceId: '01',
                    ticketStatus: 'Running',
                    relatedCalResources: '',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '02',
                    ticketStatus: 'Calculated',
                    relatedCalResources: '',
                    isShow: false
                } as ResultDetail
            ];

            pipe.transform(resultDetails, 'Running;', resultDetails);

            expect(resultDetails[0].isShow).toBe(true);
            expect(resultDetails[1].isShow).toBe(false);
        });

        it('should handle null relatedCalResources', () => {
            const resultDetails: ResultDetail[] = [
                {
                    resourceId: '01',
                    ticketStatus: 'Running',
                    relatedCalResources: null,
                    isShow: false
                } as ResultDetail
            ];

            pipe.transform(resultDetails, 'Running;', resultDetails);

            expect(resultDetails[0].isShow).toBe(true);
        });
    });

    describe('parseRelatedResources', () => {
        it('should parse comma-separated resource IDs', () => {
            const result = (pipe as any).parseRelatedResources('R001,R002,R003');

            expect(result).toEqual(['R001', 'R002', 'R003']);
        });

        it('should parse semicolon-separated resource IDs', () => {
            const result = (pipe as any).parseRelatedResources('R001;R002;R003');

            expect(result).toEqual(['R001', 'R002', 'R003']);
        });

        it('should parse mixed separators and whitespace', () => {
            const result = (pipe as any).parseRelatedResources('R001, R002; R003   R004');

            expect(result).toEqual(['R001', 'R002', 'R003', 'R004']);
        });

        it('should handle empty string', () => {
            const result = (pipe as any).parseRelatedResources('');

            expect(result).toEqual([]);
        });

        it('should handle null input', () => {
            const result = (pipe as any).parseRelatedResources(null);

            expect(result).toEqual([]);
        });

        it('should filter out empty IDs', () => {
            const result = (pipe as any).parseRelatedResources('R001,,R002,  ,R003');

            expect(result).toEqual(['R001', 'R002', 'R003']);
        });
    });

    describe('processRelatedResources', () => {
        it('should show related resources for multiple main resources', () => {
            const resultDetails: ResultDetail[] = [
                {
                    resourceId: '01',
                    relatedCalResources: '03,04',
                    isShow: true
                } as ResultDetail,
                {
                    resourceId: '02',
                    relatedCalResources: '04,05',
                    isShow: true
                } as ResultDetail,
                {
                    resourceId: '03',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '04',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '05',
                    isShow: false
                } as ResultDetail,
                {
                    resourceId: '06',
                    isShow: false
                } as ResultDetail
            ];

            (pipe as any).processRelatedResources(resultDetails);

            expect(resultDetails[2].isShow).toBe(true);
            expect(resultDetails[3].isShow).toBe(true);
            expect(resultDetails[4].isShow).toBe(true);
            expect(resultDetails[5].isShow).toBe(false);
        });

        it('should handle overlapping related resources', () => {
            const resultDetails: ResultDetail[] = [
                {
                    resourceId: '01',
                    relatedCalResources: '03',
                    isShow: true
                } as ResultDetail,
                {
                    resourceId: '02',
                    relatedCalResources: '03',
                    isShow: true
                } as ResultDetail,
                {
                    resourceId: '03',
                    isShow: false
                } as ResultDetail
            ];

            (pipe as any).processRelatedResources(resultDetails);

            expect(resultDetails[2].isShow).toBe(true);
        });

        it('should not affect resources without related resources', () => {
            const resultDetails: ResultDetail[] = [
                {
                    resourceId: '01',
                    relatedCalResources: '',
                    isShow: true
                } as ResultDetail,
                {
                    resourceId: '02',
                    isShow: false
                } as ResultDetail
            ];

            (pipe as any).processRelatedResources(resultDetails);

            expect(resultDetails[1].isShow).toBe(false);
        });
    });
});
