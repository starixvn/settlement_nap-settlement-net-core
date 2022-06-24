import { TestBed, getTestBed } from "@angular/core/testing";
import { QueryService } from "./query.service";
import { HttpRequestService, BlockUIService, MessageBoxService } from "../../shared/services";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { GetOutsideSourceQuery, OutsideSource, UpdateLeagueSourceQuery, GetProviderQuery, UpdateProviderQuery } from "../models";

describe('QueryService', () => {
  let injector: TestBed;
  let service: QueryService;
  let httpRequestService: HttpRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QueryService,
        HttpRequestService,
        HttpClient,
        HttpHandler,
        BlockUIService,
        MessageBoxService
      ],
    });

    injector = getTestBed();
    service = TestBed.inject(QueryService);
    service.apiUrl = 'Local';
    httpRequestService = TestBed.inject(HttpRequestService);
    spyOn(httpRequestService, 'postJson');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getScoreSourcePermission - should get with correct param', () => {
    const url = 'Local/api/setting/get-score-source-permission';
    spyOn(httpRequestService, 'getJson');
    service.getScoreSourcePermission();

    expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
  });

  it('getSources - should post with correct param', () => {
    const query = new GetOutsideSourceQuery();
    const url = 'Local/api/setting/get-outside-source';

    service.getSources(query);

    expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('add - should post with correct param', () => {
    const query = new OutsideSource();
    const url = 'Local/api/setting/add-outside-source';

    service.add(query);

    expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('updateOutsideSource - should post with correct param', () => {
    const query = new OutsideSource();
    const url = 'Local/api/setting/update-outside-source';

    service.updateOutsideSource(query);

    expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('updateLeagueSources - should post with correct param', () => {
    const query = new UpdateLeagueSourceQuery();

    const url = 'Local/api/setting/update-league-outside-source';

    service.updateLeagueSources(query);

    expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url, false);
  });

  it('getProviders - should post with correct param', () => {
    const query = new GetProviderQuery();
    const url = 'Local/api/setting/get-provider-source';

    service.getProviders(query);

    expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('push - should post with correct param', () => {
    const query = new UpdateProviderQuery();
    const url = 'Local/api/setting/update-provider-source';

    service.updateProvider(query);

    expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });
});