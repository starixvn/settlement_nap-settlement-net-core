import { TestBed, fakeAsync } from '@angular/core/testing';
import { RequestService } from './request.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { HttpClientModule } from '@angular/common/http';
import { TimeSettingQuery, GetRemarkQuery, ChangeSettingQuery } from '../models';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery } from '../../shared/models';

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
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getLeagueName - Call exact Url and param', fakeAsync(() => {
        const leagueId = 700000;
        const url = `api/setting/get-league-name?leagueId=${leagueId}`;

        spyOn(httpRequestService, 'getJson');
        service.getLeagueName(leagueId);

        expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
  }));

  it('proceed - Call exact Url and param', fakeAsync(() => {
        const url = 'api/setting/proceed';
        const param = new TimeSettingQuery(7000000, 1, 1);

        spyOn(httpRequestService, 'postJson');
        service.proceed(param);
        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  }));
  it('updateSettingMatch - Call exact Url and param', fakeAsync(() => {
        const url = 'api/setting/update-setting-match';
        const param = new AutoSettingMatchQuery(7000000, 0, false);

        spyOn(httpRequestService, 'postJson');
        service.updateSettingMatch(param);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  }));

  it('updateSettingLeague - Call exact Url and param', fakeAsync(() => {
        const url = 'api/setting/update-setting-league';
        const param = new AutoSettingLeagueQuery(7000000, 0, false, false);

        spyOn(httpRequestService, 'postJson');
        service.updateSettingLeague(param);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  }));

  it('getRemarkInfo - Call exact Url and param', () => {
    const url = 'api/setting/get-remark-info';
    const param: GetRemarkQuery = {
        matchId: '12345'
    };

    spyOn(httpRequestService, 'postJson');
    service.getRemarkInfo('12345');

    expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  });

  describe('changeSetting', () => {
    it('should call exact param and url when setting type is pending', () => {
      const param: ChangeSettingQuery = {
        matchId: '12345',
        type: 1,
        isEnabled: true
      };
      const url = 'api/setting/mark-pending';
      spyOn(httpRequestService, 'postJson');

      service.changeSetting(param);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
    });

    it('should call exact param and url when setting type is not pending', () => {
      const param: ChangeSettingQuery = {
        matchId: '12345',
        type: 2,
        isEnabled: true
      };
      const url = 'api/setting/mark-undecided';
      spyOn(httpRequestService, 'postJson');

      service.changeSetting(param);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
    });
  });
});