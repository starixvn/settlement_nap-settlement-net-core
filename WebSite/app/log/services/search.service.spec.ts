import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { SearchService } from './search.service';
import { LogQuery } from '../models';
describe('Log - SearchService', () => {
    let service: SearchService = null;
    let httpRequestService: HttpRequestService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                HttpClientModule,
            ],
            providers: [
                HttpRequestService,
                BlockUIService,
                MessageBoxService,
                SearchService,
            ],
        });

        service = TestBed.inject(SearchService);
        httpRequestService = TestBed.inject(HttpRequestService);
    });

    beforeEach(inject([SearchService], (searchService: SearchService) => {
        service = searchService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    it('filter - Call exact Url',
        fakeAsync(() => {
            // Arrange
            const expectedUrl = 'api/log/filter';

            // Act
            spyOn(httpRequestService, 'getJson');
            service.filter();
            tick();

            // Assert
            expect(httpRequestService.getJson).toHaveBeenCalledWith(expectedUrl);
    }));

    it('search - Call exact Url and param',
    fakeAsync(() => {
        // Arrange
        const expectedUrl = 'api/log/getLog';
        const param = new LogQuery('700000', '', '2020-01-01', '2020-01-02');

        // Act
        spyOn(httpRequestService, 'postJson');
        service.search(param);
        tick();

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, expectedUrl);
  }));
});