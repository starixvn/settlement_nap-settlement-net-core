import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { QueryService } from './query.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { SettleQuery, GetMatchesQuery, Ball } from '../models';

describe('QueryService', () => {
  let service: QueryService = null;
  let httpRequestService: HttpRequestService;
  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
          QueryService,
          HttpRequestService,
          BlockUIService,
          MessageBoxService,
        ],
        imports: [
          HttpClientModule,
        ],
    });

    service = TestBed.inject(QueryService);
    httpRequestService = TestBed.inject(HttpRequestService);
});

  beforeEach(inject([QueryService], (queryService: QueryService) => {
      service = queryService;
  }));

  it('should create a service', () => {
      expect(service).toBeTruthy();
  });

  it('search - Call exact Url and param', fakeAsync(() => {
      const url = 'Local/api/happy5/search';
      const param = new GetMatchesQuery('700000', '', '2020-01-01', '2020-01-02');

      spyOn(httpRequestService, 'postJson');
      service.search(param);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  }));

  it('filter - Call exact Url', fakeAsync(() => {
      const url = 'Local/api/happy5/filter-default';

      spyOn(httpRequestService, 'getJson');
      service.filter();

      expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
  }));

  it('getBallsByMatchId - Call exact Url', fakeAsync(() => {
      const matchId = 123456;
      const url = `Local/api/happy5/get-ball?matchId=${matchId}`;

      spyOn(httpRequestService, 'getJson');
      service.getBallsByMatchId(matchId);

      expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
  }));

  it('settle - Call exact Url and param', fakeAsync(() => {
      const url = 'Local/api/happy5/settle';
      const balls: Ball[] = [new Ball(700000, 1, 1)];
      const param = new SettleQuery(700000, balls, "");

      spyOn(httpRequestService, 'postJson');
      service.settle(param);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  }));

  it('getBalls - should return list balls', async() => {
    const listBalls: Ball[] = [];
    listBalls.push(new Ball(12345, 1, 0));
    listBalls.push(new Ball(12345, 2, 10));
    spyOn(httpRequestService, 'getJson').and.returnValue(of(listBalls));

    const actualBalls = await service.getBalls(1) ;

    const expectedBalls: Ball[] = [];
    expectedBalls.push(new Ball(12345, 1, null));
    expectedBalls.push(new Ball(12345, 2, 10));
    expect(actualBalls).toEqual(expectedBalls);
});
});
