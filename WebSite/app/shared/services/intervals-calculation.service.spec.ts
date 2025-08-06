import { inject, TestBed } from "@angular/core/testing";
import { ResultDetail } from "../../shared/models/sportsbook-sop";
import { IntervalCalculationService } from "./intervals-calculation.service";

describe('Tennis -  IntervalCalculationService', () => {
    const completedStatus = "Complete (Manual)";
    let service: IntervalCalculationService = null;
    const set1 = new ResultDetail();
    set1.resourceId = "0101";
    const set2 = new ResultDetail();
    set2.resourceId = "0102";
    const set3 = new ResultDetail();
    set3.resourceId = "0103";
    const set4 = new ResultDetail();
    set4.resourceId = "0104";
    const set5 = new ResultDetail();
    set5.resourceId = "0105";
    const totalSet = new ResultDetail();
    totalSet.resourceId = "00";

    const resultDetails: ResultDetail[] = [set1, set2, set3, set4, set5, totalSet];

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [
        ],
        providers: [
            IntervalCalculationService,
        ],
        imports: [
        ],
      })

      service = TestBed.inject(IntervalCalculationService);
    });

    beforeEach(inject([IntervalCalculationService], (intervalCalculationService: IntervalCalculationService) => {
      service = intervalCalculationService;
    }));

    it('should create a service', () => {
      expect(service).toBeTruthy();
    });

    describe('isMatchNotCheckedWhenChangingIntervals', () => {
        it('should return false when no set is checked', () => {
            const result = service.isMatchNotCheckedWhenChangingIntervals(resultDetails, '00', '01');

            expect(result).toBe(false);
        });

        it('should return false when match is not calculated', () => {
            set1.checked = true;
            const result = service.isMatchNotCheckedWhenChangingIntervals(resultDetails, '00', '01');

            expect(result).toBe(false);
        });

        it('should return false when no interval is changed', () => {
            totalSet.resultStatus = completedStatus;
            const result = service.isMatchNotCheckedWhenChangingIntervals(resultDetails, '00', '01');

            expect(result).toBe(false);
        });

        it('should return false when match is checked', () => {
            set1.originalHomeValue = "0";
            set1.originalAwayValue = "0";
            set1.homeValue = "1";
            set1.awayValue = "2";
            totalSet.checked = true;
            const result = service.isMatchNotCheckedWhenChangingIntervals(resultDetails, '00', '01');

            expect(result).toBe(false);
        });

        it('should return true when all conditions are passed', () => {
            totalSet.checked = false;
            const result = service.isMatchNotCheckedWhenChangingIntervals(resultDetails, '00', '01');

            expect(result).toBe(true);
        })
    });

    describe('isIntervalNotCheckedWhenCalculateMatch', () => {
        beforeEach(() => {
            set1.checked = false;
            set2.checked = false;
            totalSet.checked = true;
        });

        it('should return false when match is not checked', () => {
            totalSet.checked = false;
            const result = service.isIntervalNotCheckedWhenCalculateMatch(resultDetails, false, '00', '01');

            expect(result).toBe(false);
        });

        it('should return false when score direct', () => {
            const result = service.isIntervalNotCheckedWhenCalculateMatch(resultDetails, true, '00', '01');

            expect(result).toBe(false);
        });

        it('should return true when exist set within match score not checked and not calculated',() => {
            totalSet.homeValue = "2";
            totalSet.awayValue = "0";
            const result = service.isIntervalNotCheckedWhenCalculateMatch(resultDetails, false, '00', '01');

            expect(result).toBe(true);
        });

        it('should return false when all sets within match score are checked', () => {
            set1.checked = true;
            set2.checked = true;
            const result = service.isIntervalNotCheckedWhenCalculateMatch(resultDetails, false, '00', '01');

            expect(result).toBe(false);
        });

        it('should return false when all sets within match score are calculated', () => {
            set1.resultStatus = completedStatus;
            set2.resultStatus = completedStatus;
            const result = service.isIntervalNotCheckedWhenCalculateMatch(resultDetails, false, '00', '01');

            expect(result).toBe(true);
        });
    });

    describe('isNonCheckedIntervalsConsistent', () => {
        beforeEach(() => {
            set1.checked = true;
            set2.checked = true;
            totalSet.homeValue = "2";
            totalSet.awayValue = "0";
            totalSet.checked = true;
        });

        it('should return false when match is not checked', () => {
            totalSet.checked = false;
            const result = service.isNonCheckedIntervalsConsistent(resultDetails, false, '00', '01');

            expect(result).toBe(false);
        });

        it('should return false when score direct', () => {
            const result = service.isNonCheckedIntervalsConsistent(resultDetails, true, '00', '01');

            expect(result).toBe(false);
        });

        it('should return false when there is no other interval', () => {
            totalSet.homeValue = "3";
            totalSet.awayValue = "2";
            const result = service.isNonCheckedIntervalsConsistent(resultDetails, false, '00', '01');

            expect(result).toBe(false);
        });

        it('should return true when exist other interval calculated', () => {
            set3.resultStatus = completedStatus;
            const result = service.isNonCheckedIntervalsConsistent(resultDetails, false, '00', '01');

            expect(result).toBe(true);
        });

        it('should return true when exist interval has tickets and not refunded', () => {
            set3.resultStatus = "Running";
            set4.ticketStatus = "Running";
            set4.resultStatus = "Running";
            const result = service.isNonCheckedIntervalsConsistent(resultDetails, false, '00', '01');

            expect(result).toBe(true);
        });

        it('should return false when all other intervals are refunded and have no tickets', () => {
            set3.resultStatus = "Refund";
            set3.ticketStatus = "No Ticket";
            set4.resultStatus = "Refund";
            set4.ticketStatus = "No Ticket";
            set5.resultStatus = "Refund";
            set5.ticketStatus = "No Ticket";
            const result = service.isNonCheckedIntervalsConsistent(resultDetails, false, '00', '01');

            expect(result).toBe(false);
        });
    })
});