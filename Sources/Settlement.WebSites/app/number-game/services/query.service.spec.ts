import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { QueryService } from './query.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { SettleQuery, GetMatchesQuery, Ball } from '../models';

describe('NumberGameService', () => {
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
    service.apiUrl = 'Local';
    httpRequestService = TestBed.inject(HttpRequestService);
});

  beforeEach(inject([QueryService], (queryService: QueryService) => {
      service = queryService;
  }));

  it('should create a service', () => {
      expect(service).toBeTruthy();
  });

  it('getBallsByMatchId - Call exact Url', fakeAsync(() => {
    const matchId = 123456;
    const url = `Local/api/number-game/get-ball?matchId=${matchId}`;

    spyOn(httpRequestService, 'getJson');
    service.getBallsByMatchId(matchId);

    expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
  }));

  it('search - Call exact Url and param', fakeAsync(() => {
      const url = 'Local/api/number-game/search';
      const param = new GetMatchesQuery('700000', '', '2020-01-01', '2020-01-02');

      spyOn(httpRequestService, 'postJson');
      service.search(param);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  }));

  it('filter - Call exact Url', fakeAsync(() => {
      const url = 'Local/api/number-game/filter-default';

      spyOn(httpRequestService, 'getJson');
      service.filter();

      expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
  }));

  it('settle - Call exact Url and param', fakeAsync(() => {
      const url = 'Local/api/number-game/settle';
      const balls: Ball[] = [new Ball(700000, 1, 1)];
      const param = new SettleQuery(700000, balls);

      spyOn(httpRequestService, 'postJson');
      service.settle(param);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  }));
});
