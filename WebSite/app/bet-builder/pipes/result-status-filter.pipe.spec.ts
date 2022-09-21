import { TestBed } from '@angular/core/testing';
import { ResultStatusPipe } from './result-status-filter.pipe';
import { CalculationFilterService } from '../services';
import { Selection } from '../models';
describe('Pipe: ResultStatusPipe', () => {
  let pipe: ResultStatusPipe;
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
    pipe = new ResultStatusPipe(calculationFilterService);
  });

  it('should return list selection with resultStatusId = "1".', () => {
    const selection1 = new Selection("Test 1")  ;
    selection1.resultStatusId = 1;

    const selection2 = new Selection("Test 2")  ;
    selection2.resultStatusId = 2;

    const selectedResultStatus = ["1"];
    const actual = pipe.transform([selection1, selection2], selectedResultStatus);
    expect(actual).toEqual([selection1]);
  });
});