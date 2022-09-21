import { FastMarketBetType } from '../constants';
import { EventCounter, FastMarketResult, SpecialSession } from '../models';
import { SpecialTimeEventCounterPipe } from './special-time-event-counter-filter.pipe';

describe('Pipe: SpecialTimeEventCounterPipe', () => {
    let pipe: SpecialTimeEventCounterPipe;
    beforeEach(() => {
        pipe = new SpecialTimeEventCounterPipe();
    });

    describe('transform', () => {
        const eventShow = new EventCounter();
        eventShow.position = 10;
        const eventHide = new EventCounter();
        eventHide.position = 45;
        let eventCounters = [];

        beforeEach(() => {
            eventCounters = [eventShow, eventHide];
        });

        describe('filterSuspendedTime', () => {
            it('should filter when resourceId is suspendedTime and position > startMinute - 5 && position < startMinute + 5', () => {
                const session = new SpecialSession('221SUS');
                session.startMinute = 9;
                session.apply = true;

                const result = pipe.transform(eventCounters, session);

                expect(result.filter(x => x.isShow).length).toEqual(1);
            });

            it('should filter when resourceId is suspendedTime', () => {
                const session = new SpecialSession('221SUS');
                session.startMinute = 1;
                session.apply = true;
                const result = pipe.transform(eventCounters, session);

                expect(result.length).toEqual(0);
            });

            
        });

        describe('filterWaterBreak', () => {
            it('should return original when water break is not applied', () => {
                eventCounters = [];
                const waterBreak = new SpecialSession('');
                expect(pipe.transform(eventCounters, waterBreak)).toEqual([]);
            });
    
            it('should filter when water break is applied and start minute equals end minute', () => {
                const waterBreak = new SpecialSession('');
                waterBreak.apply = true;
                waterBreak.startMinute = 10;
                waterBreak.endMinute = 10;
    
                const result = pipe.transform(eventCounters, waterBreak);
    
                expect(result.filter(x => x.isShow).length).toEqual(1);
            });
        });
    })
});