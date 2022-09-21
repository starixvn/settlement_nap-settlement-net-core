import { TestBed } from "@angular/core/testing";
import { BetType, EventCounter, FastMarketResult } from "../models";
import { TimeMachineService } from "./time-machine.service";

describe('TimeMachineService', () => {
    let service: TimeMachineService;
    let interval1: FastMarketResult;
    let interval2: FastMarketResult;
    let interval3: FastMarketResult;
    let timeMachine: BetType;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                TimeMachineService
            ],
        });

        service = TestBed.inject(TimeMachineService);
        interval1 = new FastMarketResult();
        interval1.position = 1;
        interval2 = new FastMarketResult();
        interval2.position = 2;
        interval3 = new FastMarketResult();
        interval3.position = 3;
        timeMachine = new BetType();
        timeMachine.betTypeId = 228;
        interval1.isShow = true;
        interval2.isShow = true;
        interval3.isShow = true;
        timeMachine.fastMarketResults = [interval1, interval2, interval3];
    });

    it('getFirstCheckedPosition - should get first checked intervals position', () => {
        interval2.checked = true;
        interval3.checked = true;

        const result = service.getFirstCheckedPosition(timeMachine);

        expect(result).toBe(2);
    });

    describe('validateBeforeCalculation', () => {
        it('should return false when no time machine bet type', () => {
            const result = service.validateBeforeCalculation([new BetType()], 0);

            expect(result).toBe(false);
        });

        it('should return true when exist previous interval not calculated and not checked', () => {
            interval2.checked = true;
            interval1.resultStatus = 0;
            interval1.checked = false;

            const result = service.validateBeforeCalculation([timeMachine], 0);

            expect(result).toBe(true);
        });

        it('should return false when no previous interval not calculated or not checked', () => {
            interval1.checked = true;
            interval2.checked = true;

            const result = service.validateBeforeCalculation([timeMachine], 0);

            expect(result).toBe(false);
        });

        it('should return false when no calculated check interval', () => {
            interval2.checked = true;
            interval2.resultStatus = 1;

            const result = service.validateBeforeCalculation([timeMachine], 2);

            expect(result).toBe(false);
        });
    });

    describe('validateBeforeRefund', () => {
        it('should return false when no time machine bet type', () => {
            const result = service.validateBeforeRefund([new BetType()], 0);

            expect(result).toBe(false);
        });

        it('should return true when exist previous interval not settled', () => {
            interval2.checked = true;
            interval1.resultStatus = 1;
            interval1.checked = false;
            timeMachine.betTypeId = 229;

            const result = service.validateBeforeRefund([timeMachine], 0);

            expect(result).toBe(true);
        });

        it('should return false when no previous interval not settled', () => {
            interval2.checked = true;
            interval1.resultStatus = 4;

            const result = service.validateBeforeRefund([timeMachine], 0);

            expect(result).toBe(false);
        });

        it('should return true when exist following interval not checked', () => {
            interval2.checked = true;
            timeMachine.betTypeId = 228;

            const result = service.validateBeforeRefund([timeMachine], 1, true);

            expect(result).toBe(true);
        });

        it('should return false when no following interval not checked', () => {
            interval2.checked = true;
            interval3.checked = true;

            const result = service.validateBeforeRefund([timeMachine], 1);

            expect(result).toBe(false);
        });

        it('should return false when verify checked interval', () => {
            interval2.checked = true;
            interval2.resultStatus = 4;
            timeMachine.betTypeId = 229;

            const result = service.validateBeforeRefund([timeMachine], 2);

            expect(result).toBe(false);
        });

        it('should return false when no calculated or checked interval', () => {
            const result = service.validateBeforeRefund([timeMachine], 2);

            expect(result).toBe(false);
        });
    });

    describe('validateBeforeUncalculation', () => {
        it('should return false when no time machine bet type', () => {
            const result = service.validateBeforeUncalculation([new BetType()], 0);

            expect(result).toBe(false);
        });

        it('should return true when exist previous refunded interval', () => {
            interval2.checked = true;
            interval1.resultStatus = 6;

            const result = service.validateBeforeUncalculation([timeMachine], 0);

            expect(result).toBe(true);
        });

        it('should return false when no previous refunded interval', () => {
            interval2.checked = true;
            interval1.resultStatus = 4;

            const result = service.validateBeforeUncalculation([timeMachine], 0);

            expect(result).toBe(false);
        });

        it('should return true when exist following settled interval not checked', () => {
            interval2.checked = true;
            interval3.resultStatus = 4;

            const result = service.validateBeforeUncalculation([timeMachine], 1);

            expect(result).toBe(true);
        });

        it('should return false when no following settled interval not checked', () => {
            interval2.checked = true;
            interval3.resultStatus = 1;

            const result = service.validateBeforeUncalculation([timeMachine], 1);

            expect(result).toBe(false);
        });
    });

    describe('getCorrespondingInterval', () => {
        let event: EventCounter;
        let intervals: FastMarketResult[];
        beforeEach(() => {
            event = new EventCounter();
            intervals = [interval1, interval2, interval3];
        });

        it('should return first half corresponding interval', () => {
            event.position = 9;
            interval3.position = 9;

            const result = service.getCorrespondingInterval(intervals, event);

            expect(result).toEqual(interval3);
        });

        it('should return second half corresponding interval', () => {
            event.position = 69;
            interval3.position = 70;

            const result = service.getCorrespondingInterval(intervals, event);

            expect(result).toEqual(interval3);
        });
    });

    describe('getCorrespondingEventCounter', () => {
        let interval: FastMarketResult;
        const event1 = new EventCounter();
        event1.position = 7;
        const event2 = new EventCounter();
        event2.position = 69;
        const events = [event1, event2];

        beforeEach(() => {
            interval = new FastMarketResult();
        });

        it('should return first half corresponding event counter', () => {
            interval.position = 7;

            const result = service.getCorrespondingEventCounter(events, interval);

            expect(result).toEqual(event1);
        });

        it('should return second half corresponding event counter', () => {
            interval.position = 70;

            const result = service.getCorrespondingEventCounter(events, interval);

            expect(result).toEqual(event2);
        });

        it('should return null when position is 45', () => {
            interval.position = 45;

            const result = service.getCorrespondingEventCounter(events, interval);

            expect(result).toBe(null);
        });
    });
});