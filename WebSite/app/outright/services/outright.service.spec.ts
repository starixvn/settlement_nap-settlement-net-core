import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { getTestBed, TestBed } from "@angular/core/testing";
import { BlockUIService, HttpRequestService, MessageBoxService } from "../../shared/services";
import { OutrightService } from "./outright.service";
import { LogRequest } from "../models/log-request.model";
import { SportLeagueRequest } from "../models/filter-request.model";
import { FilterRequest } from "../models/filter-request.model";
import { TeamSettle } from "../models";
import { Team } from "../models";
import { TeamResult } from "../models/team-result";
import { of } from "rxjs";

describe('OutrightService', () => {
    let outrightService: OutrightService    ;
    let injector: TestBed;
    let httpRequestService: HttpRequestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                HttpRequestService,
                OutrightService,
                BlockUIService,
                MessageBoxService,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        injector = getTestBed();
        httpRequestService = TestBed.inject(HttpRequestService);
        outrightService = TestBed.inject(OutrightService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be created', () => {
        expect(outrightService).toBeTruthy();
    });

    describe('getSportLeague', () => {
        it('should call postJson with correct parameters', async () => {
            const sportLeagueRequest: SportLeagueRequest = {
                fromDate: '2023-01-01',
                toDate: '2023-12-31'
            };
            const expectedUrl = '/api/outright/get-sport-league';
            const mockResponse = { leagues: [] };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.getSportLeague(sportLeagueRequest);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(
                sportLeagueRequest, 
                expectedUrl, 
                false
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getFilterView', () => {
        it('should call getJson with correct URL', async () => {
            const expectedUrl = '/api/outright/get-filter-view';
            const mockResponse = { filters: [] };

            jest.spyOn(httpRequestService, 'getJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.getFilterView();

            expect(httpRequestService.getJson).toHaveBeenCalledWith(expectedUrl);
            expect(result).toEqual(mockResponse);
        });
    });


    describe('filter', () => {
        it('should call postJson with correct parameters', async () => {
            const filterRequest: FilterRequest = {
                fromDate: '2023-01-01',
                toDate: '2023-12-31',
                leagueIds: '1,2,3',
                statusId: 2,
                isIncludeTest: false
            };
            const expectedUrl = '/api/outright/filter';
            const mockResponse = { leagues: [] };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.filter(filterRequest);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(filterRequest, expectedUrl);
            expect(result).toEqual(mockResponse);
        });

        it('should handle empty filter request', async () => {
            const filterRequest: FilterRequest = {
                fromDate: '',
                toDate: '',
                leagueIds: '',
                statusId: 0,
                isIncludeTest: false
            };
            const mockResponse = { leagues: [] };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.filter(filterRequest);

            expect(result).toEqual(mockResponse);
        });
    });

    describe('getMatches', () => {
        it('should call postJson with correct parameters', async () => {
            const leagueId = 123;
            const sportType = 1;
            const statusId = 2;
            const expectedQuery = { leagueId, statusId, sportType };
            const expectedUrl = '/api/outright/get-league-info';
            const mockResponse = { matches: [] };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.getMatches(leagueId, sportType, statusId);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expectedUrl);
            expect(result).toEqual(mockResponse);
        });

        it('should handle zero values', async () => {
            const leagueId = 0;
            const sportType = 0;
            const statusId = 0;
            const expectedQuery = { leagueId, statusId, sportType };
            const mockResponse = { matches: [] };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.getMatches(leagueId, sportType, statusId);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String));
            expect(result).toEqual(mockResponse);
        });
    });


    describe('uncalculate', () => {
        it('should call postJson with correct parameters', async () => {
            const matchIds = '1,2,3';
            const teamIds = '10,20,30';
            const expectedQuery = { matchIds, teamIds };
            const expectedUrl = '/api/outright/uncalculate';
            const mockResponse = { success: true };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.uncalculate(matchIds, teamIds);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expectedUrl);
            expect(result).toEqual(mockResponse);
        });

        it('should handle empty strings', async () => {
            const matchIds = '';
            const teamIds = '';
            const expectedQuery = { matchIds, teamIds };
            const mockResponse = { success: false };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.uncalculate(matchIds, teamIds);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String));
            expect(result).toEqual(mockResponse);
        });
    });

    describe('calculate', () => {
        it('should call postJson with correct parameters', async () => {
            const teams: TeamSettle[] = [
                new TeamSettle('1', '1', false, 'Active', '2023-01-01'),
                new TeamSettle('2', '2', false, 'Active', '2023-01-01')
            ];
            const deadHeat = 0;
            const expectedQuery = { teams, deadHeat };
            const expectedUrl = '/api/outright/calculate';
            const mockResponse = { success: true };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.calculate(teams, deadHeat);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expectedUrl);
            expect(result).toEqual(mockResponse);
        });

        it('should handle empty teams array', async () => {
            const teams: TeamSettle[] = [];
            const deadHeat = 1;
            const expectedQuery = { teams, deadHeat };
            const mockResponse = { success: false };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.calculate(teams, deadHeat);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String));
            expect(result).toEqual(mockResponse);
        });

        it('should handle null deadHeat value', async () => {
            const teams: TeamSettle[] = [new TeamSettle('1', '1', true, 'Active', '2023-01-01')];
            const deadHeat = null;
            const expectedQuery = { teams, deadHeat };
            const mockResponse = { success: true };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.calculate(teams, deadHeat);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String));
            expect(result).toEqual(mockResponse);
        });
    });

    describe('saveScore', () => {
        it('should call postJson with correct parameters', async () => {
            const teams: Team[] = [
                { teamId: 1, teamName: 'Team A' } as Team,
                { teamId: 2, teamName: 'Team B' } as Team
            ];
            const expectedQuery = { teams };
            const expectedUrl = '/api/outright/save-score';
            const mockResponse = { success: true };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.saveScore(teams);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expectedUrl);
            expect(result).toEqual(mockResponse);
        });

        it('should handle empty teams array', async () => {
            const teams: Team[] = [];
            const expectedQuery = { teams };
            const mockResponse = { success: false };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.saveScore(teams);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String));
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getLogs', () => {
        it('should call postJson with correct parameters and return Observable', () => {
            const request: LogRequest = {
                matchCode: 'MATCH001',
                leagueId: 123,
                fromDate: '2023-01-01',
                toDate: '2023-12-31'
            };
            const expectedUrl = '/api/outright/get-log';
            const mockResponse = [{ logId: 1, message: 'Test log' }];

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result$ = outrightService.getLogs(request);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(request, expectedUrl, true);
            expect(result$).toBeDefined();
            
            result$.subscribe(result => {
                expect(result).toEqual(mockResponse);
            });
        });

        it('should handle empty log request', () => {
        const request: LogRequest = {
            matchCode: '',
                leagueId: 0,
            fromDate: '',
            toDate: ''
        };
            const mockResponse: any[] = [];

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result$ = outrightService.getLogs(request);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(request, expect.any(String), true);
            
            result$.subscribe(result => {
                expect(result).toEqual(mockResponse);
            });
        });
    });

    describe('saveTraderScore', () => {
        it('should call postJson with correct parameters', async () => {
            const leagueId = 123;
            const teams: TeamResult[] = [
                { orId: '1', teamId: 1, result: 'Win' },
                { orId: '2', teamId: 2, result: 'Lose' }
            ];
            const expectedQuery = { leagueId, teams };
            const expectedUrl = '/api/outright/save-trader-score';
            const mockResponse = { success: true };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.saveTraderScore(leagueId, teams);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expectedUrl);
            expect(result).toEqual(mockResponse);
        });

        it('should handle zero leagueId', async () => {
            const leagueId = 0;
            const teams: TeamResult[] = [];
            const expectedQuery = { leagueId, teams };
            const mockResponse = { success: false };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.saveTraderScore(leagueId, teams);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String));
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateDeatHeat', () => {
        it('should call postJson with correct parameters for true deadHeat', async () => {
            const leagueId = 123;
            const deadHeat = true;
            const expectedQuery = { leagueId, deadHeat };
            const expectedUrl = '/api/outright/update-deadheat-setting';
            const mockResponse = { success: true };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.updateDeatHeat(leagueId, deadHeat);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expectedUrl, true);
            expect(result).toEqual(mockResponse);
        });

        it('should call postJson with correct parameters for false deadHeat', async () => {
            const leagueId = 123;
            const deadHeat = false;
            const expectedQuery = { leagueId, deadHeat };
            const mockResponse = { success: true };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.updateDeatHeat(leagueId, deadHeat);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String), true);
            expect(result).toEqual(mockResponse);
        });

        it('should call postJson with correct parameters for null deadHeat', async () => {
            const leagueId = 123;
            const deadHeat = null;
            const expectedQuery = { leagueId, deadHeat };
            const mockResponse = { success: true };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.updateDeatHeat(leagueId, deadHeat);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String), true);
            expect(result).toEqual(mockResponse);
        });

        it('should handle zero leagueId', async () => {
            const leagueId = 0;
            const deadHeat = true;
            const expectedQuery = { leagueId, deadHeat };
            const mockResponse = { success: false };

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.updateDeatHeat(leagueId, deadHeat);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String), true);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('checkVoidTickets', () => {
        it('should call postJson with correct parameters', async () => {
            const orId = 123;
            const expectedQuery = { orId };
            const expectedUrl = '/api/outright/check-void-tickets';
            const mockResponse = true;

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.checkVoidTickets(orId);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expectedUrl);
            expect(result).toEqual(mockResponse);
        });

        it('should handle zero orId', async () => {
            const orId = 0;
            const expectedQuery = { orId };
            const mockResponse = false;

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.checkVoidTickets(orId);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String));
            expect(result).toEqual(mockResponse);
        });

        it('should handle negative orId', async () => {
            const orId = -1;
            const expectedQuery = { orId };
            const mockResponse = false;

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.checkVoidTickets(orId);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String));
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getDeadHeatSetting', () => {
        it('should call postJson with correct parameters', async () => {
            const leagueId = 123;
            const expectedQuery = { leagueId };
            const expectedUrl = '/api/outright/get-deadheat-setting';
            const mockResponse = 2;

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.getDeadHeatSetting(leagueId);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expectedUrl);
            expect(result).toEqual(mockResponse);
        });

        it('should handle null response', async () => {
            const leagueId = 123;
            const expectedQuery = { leagueId };
            const mockResponse = null;

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.getDeadHeatSetting(leagueId);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String));
            expect(result).toEqual(mockResponse);
        });

        it('should handle zero leagueId', async () => {
            const leagueId = 0;
            const expectedQuery = { leagueId };
            const mockResponse = null;

            jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

            const result = await outrightService.getDeadHeatSetting(leagueId);

            expect(httpRequestService.postJson).toHaveBeenCalledWith(expectedQuery, expect.any(String));
            expect(result).toEqual(mockResponse);
        });
    });
});