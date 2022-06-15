import { TestBed } from '@angular/core/testing';
import { TicketStatusPipe } from './ticket-status-filter.pipe';
import { CalculationFilterService } from '../services';
import { Selection } from '../models';
describe('Pipe: TicketStatusPipe', () => {
  let pipe: TicketStatusPipe;
  let calculationFilterService: CalculationFilterService;
  
  
  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            CalculationFilterService,
        ],
    });
  });

  beforeEach(() => {
    calculationFilterService = TestBed.inject(CalculationFilterService);
    pipe = new TicketStatusPipe(calculationFilterService);
  });

  it('should return list selection with ticketStatus = "1".', () => {
    const selection1 = new Selection("Test 1")  ;
    selection1.ticketStatus = "1";

    const selection2 = new Selection("Test 2")  ;
    selection2.ticketStatus = "2";

    const selectedTicketStatus = ["1"];
    const actual = pipe.transform([selection1, selection2], selectedTicketStatus);
    expect(actual).toEqual([selection1]);
  });
});