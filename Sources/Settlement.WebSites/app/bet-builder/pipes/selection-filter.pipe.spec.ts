import { TestBed } from '@angular/core/testing';
import { SelectionPipe } from './selection-filter.pipe';
import { CalculationFilterService } from '../services';
import { GroupSelection } from '../models';
describe('Pipe: SelectionPipe', () => {
  let pipe: SelectionPipe;
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
    pipe = new SelectionPipe(calculationFilterService);
  });

  it('should return list group name = "Test 1".', () => {
    const group1 = new GroupSelection("Test 1", [])  ;
    const group2 = new GroupSelection("Test 2", [])  ;

    const groupName = ["Test 1"];
    const actual = pipe.transform([group1, group2], groupName);
    expect(actual).toEqual([group1]);
  });
});