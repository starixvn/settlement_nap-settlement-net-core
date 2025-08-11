import { TestBed, fakeAsync } from '@angular/core/testing';
import { RequestService } from './request.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { HttpClientModule } from '@angular/common/http';
import { TimeSettingQuery, GetRemarkQuery, ChangeSettingQuery } from '../models';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery } from '../../shared/models';
import { of } from 'rxjs';

describe('Auto Setting Service', () => {
  let service: RequestService = null;
  let httpRequestService: HttpRequestService;

  beforeEach(() => TestBed.configureTestingModule({
      providers: [
        HttpRequestService,
        RequestService,
        BlockUIService,
        MessageBoxService,
      ],
      imports : [
        HttpClientModule,
      ],
  }));

  beforeEach(() => {
    service = TestBed.inject(RequestService);
    httpRequestService = TestBed.inject(HttpRequestService);
    // Mock the HTTP service methods to prevent actual HTTP calls
    jest.spyOn(httpRequestService, 'getJson').mockReturnValue(of({}));
    jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of({}));
  });

  beforeEach(() => {
    service = TestBed.inject(RequestService);
    httpRequestService = TestBed.inject(HttpRequestService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getLeagueName - Call exact Url and param', fakeAsync(() => {
        const leagueId = 700000;
        const url = `/api/setting/get-league-name?leagueId=${leagueId}`;

        jest.spyOn(httpRequestService, 'getJson');
        service.getLeagueName(leagueId);

        expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
  }));

  it('proceed - Call exact Url and param', fakeAsync(() => {
        const url = '/api/setting/proceed';
        const param = new TimeSettingQuery(7000000, 1, 1);

        jest.spyOn(httpRequestService, 'postJson');
        service.proceed(param);
        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  }));
  it('updateSettingMatch - Call exact Url and param', fakeAsync(() => {
        const url = '/api/setting/update-setting-match';
        const param = new AutoSettingMatchQuery(7000000, 0, false);

        jest.spyOn(httpRequestService, 'postJson');
        service.updateSettingMatch(param);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  }));

  it('updateSettingLeague - Call exact Url and param', fakeAsync(() => {
        const url = '/api/setting/update-setting-league';
        const param = new AutoSettingLeagueQuery(7000000, 0, false, false);

        jest.spyOn(httpRequestService, 'postJson');
        service.updateSettingLeague(param);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  }));

  it('getRemarkInfo - Call exact Url and param', () => {
    const url = '/api/setting/get-remark-info';
    const param: GetRemarkQuery = {
        matchId: '12345'
    };

    jest.spyOn(httpRequestService, 'postJson');
    service.getRemarkInfo('12345');

    expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  });
});