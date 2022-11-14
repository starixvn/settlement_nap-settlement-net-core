import { TestBed } from '@angular/core/testing';
import { AutoCalculateService } from './auto-calculate.service';
describe("AutoCalculateService", () => {
    let service: AutoCalculateService;
    beforeEach(() => TestBed.configureTestingModule({
        providers:[
            AutoCalculateService
        ]
    }));
    beforeEach(() => {
        service = TestBed.inject(AutoCalculateService);
      });

      it('should be created', () => {
        expect(service).toBeTruthy();
      });

      it('Always return correct value', () => {

        const actual = service.createAutoPayoutFilter();

        expect(actual.length).toEqual(3);
      });
})