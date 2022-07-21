import { TestBed, getTestBed } from "@angular/core/testing";
import { GenerateFilterService } from "./generate-filter.service";

describe('MultiSport - MultiSportService', () => {
    let injector: TestBed;
    let service: GenerateFilterService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
            GenerateFilterService
        ],
      });

      injector = getTestBed();
      service = TestBed.inject(GenerateFilterService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('renderGames - should return 5 items select', () => {
      const result = service.renderGames();

      expect(result.length).toEqual(6);
    });

    it('renderStatus - should return 2 items select', () => {
      const result = service.renderStatus();

      expect(result.length).toEqual(2);
    });
});