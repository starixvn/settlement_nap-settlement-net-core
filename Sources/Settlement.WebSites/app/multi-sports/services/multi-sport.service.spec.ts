import { FilterRequest, ParlayQuery, GetRemarkQuery } from '../models';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { TestBed, getTestBed, fakeAsync } from '@angular/core/testing';
import { MultiSportService } from './multi-sport.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ApiKeys, SportType } from '../../shared/constants';
import { Match, MoreScore, Score } from '../../shared/models';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery } from '../../shared/models';

describe('MultiSport - MultiSportService', () => {
  let injector: TestBed;
  let httpRequestService: HttpRequestService;
  let service: MultiSportService;
  const matchBadminton = new Match();
  matchBadminton.sportType = SportType.badminton;
  matchBadminton.moreScores = new MoreScore();
  matchBadminton.moreScores.sets = [new Score('1', '0', '')];
  const matchIceHockey = new Match();
  matchIceHockey.sportType = SportType.iceHockey;
  matchIceHockey.betStatus = 'Refund;1-0,2-0,2-0,2-0';
  const matchFootball = new Match();
  matchFootball.sportType = SportType.football;
  matchFootball.betStatus = '1-0,2-0,0-0,1-0,0-0';
  matchFootball.isHalfTimeCal = true;
  matchFootball.isCalculated = true;
  const matchBaseball = new Match();
  matchBaseball.sportType = SportType.baseBall;
  matchBaseball.betStatus = '1-0,2-0,1-0,3-0,1-0';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        HttpRequestService,
        MultiSportService,
        BlockUIService,
        MessageBoxService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    injector = getTestBed();
    httpRequestService = TestBed.inject(HttpRequestService);
    service = TestBed.inject(MultiSportService);
    service.apiUrl = "local";
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it(`getSport - Call right Url and param`, () => {
        const url = `local/api/multi-sports/getSport`;
        const param = {
          apikey: ApiKeys.MultiSportGetCombobox,
        };

        spyOn(httpRequestService, 'postJson');
        service.getSport(param);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url, false);
  });

  it(`getLeague - Call right Url and param`, () => {
    const url = `local/api/multi-sports/getLeague`;
    const param = {
      apikey: ApiKeys.MultiSportGetCombobox,
    };

    spyOn(httpRequestService, 'postJson');
    service.getLeague(param);

    expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url, false);
  });

  it('getDate - Call right Url', () => {
        const url = "local/api/multi-sports/get-date";
        spyOn(httpRequestService, 'getJson');
        service.getDate();

        expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
  });

  it('filter - Call right Url and param', () => {
        const param: FilterRequest = {
          fromDate: "22/03/2019",
          toDate: "30/03/2019",
          ticketStatus: '',
          matchCode: '',
          matchStatus: '',
          leagueIds: '',
          sportTypes: '',
          isIncludeTest: true,
          autoPayout: 0,
          holdStatus: '',
          overStatus: ''
        };

        spyOn(httpRequestService, 'postMessagePack');
        service.filter(param);

        expect(httpRequestService.postMessagePack)
          .toHaveBeenCalledWith(param, "local/api/multi-sports/filter");
    }
  );

  it('calculateMixParlay - should call exact param and url', fakeAsync(() => {
    const param: ParlayQuery = {
      matchIds: '12345,1234',
    };
    const url = 'api/calculation/calculate-mix-parlay';
    spyOn(httpRequestService, 'postJson');

    service.calculateMixParlay(param);

    expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url, false);
  }));

  it('getRemarkInfo - Call exact Url and param', () => {
    const url = 'local/api/setting/get-remark-info';
    const param: GetRemarkQuery = {
        matchId: '12345'
    };

    spyOn(httpRequestService, 'postJson');
    service.getRemarkInfo('12345');

    expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  });

  it('updateSettingMatch - should post with correct param', () => {
    const query = {} as AutoSettingMatchQuery;

    const url = 'local/api/setting/update-setting-match';
    spyOn(httpRequestService, 'postJson');
    service.updateSettingMatch(query);

    expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('updateSettingLeague - should post with correct param', () => {
    const query = {} as AutoSettingLeagueQuery;

    const url = 'local/api/setting/update-setting-league';
    spyOn(httpRequestService, 'postJson');
    service.updateSettingLeague(query);

    expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });
});
