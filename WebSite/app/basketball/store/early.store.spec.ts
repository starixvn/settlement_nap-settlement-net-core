import { TestBed } from '@angular/core/testing';
import { EarlyStore } from './early.store';
import { MatchDetail, ResultDetail, Permission } from "../../shared/models/sportsbook-sop";

describe('EarlyStore', () => {
  let store: EarlyStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EarlyStore],
    });

    store = TestBed.inject(EarlyStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {
    it('should initialize matchDetail signal as null', () => {
      expect(store.matchDetail()).toBeNull();
    });

    it('should initialize permission signal as null', () => {
      expect(store.permission()).toBeNull();
    });

    it('should initialize maxProviderCol signal as 0', () => {
      expect(store.maxProviderCol()).toBe(0);
    });

    it('should initialize resultDetails signal as empty array', () => {
      expect(store.resultDetails()).toEqual([]);
    });

    it('should initialize finalResult signal as null', () => {
      expect(store.finalResult()).toBeNull();
    });
  });

  describe('setState', () => {
    it('should update all signals with provided values', () => {
      const matchDetail = createMockMatchDetail();
      const resultDetails = [createMockResultDetail('R001'), createMockResultDetail('R002')];
      const permission = createMockPermission();
      const maxProviderCol = 5;
      const finalResult = createMockResultDetail('R003');

      store.setState(matchDetail, resultDetails, permission, maxProviderCol, finalResult);

      expect(store.matchDetail()).toBe(matchDetail);
      expect(store.resultDetails()).toBe(resultDetails);
      expect(store.permission()).toBe(permission);
      expect(store.maxProviderCol()).toBe(maxProviderCol);
      expect(store.finalResult()).toBe(finalResult);
    });

    it('should update signals with null values', () => {
      store.setState(null, [], null, 0, null);

      expect(store.matchDetail()).toBeNull();
      expect(store.resultDetails()).toEqual([]);
      expect(store.permission()).toBeNull();
      expect(store.maxProviderCol()).toBe(0);
      expect(store.finalResult()).toBeNull();
    });

    it('should update signals multiple times', () => {
      const firstMatchDetail = createMockMatchDetail('Team A', 'Team B');
      const secondMatchDetail = createMockMatchDetail('Team C', 'Team D');

      store.setState(firstMatchDetail, [], null, 0, null);
      expect(store.matchDetail()).toBe(firstMatchDetail);

      store.setState(secondMatchDetail, [], null, 0, null);
      expect(store.matchDetail()).toBe(secondMatchDetail);
    });

    it('should update resultDetails with different arrays', () => {
      const firstResults = [createMockResultDetail('R001')];
      const secondResults = [createMockResultDetail('R002'), createMockResultDetail('R003')];

      store.setState(null, firstResults, null, 0, null);
      expect(store.resultDetails()).toBe(firstResults);
      expect(store.resultDetails().length).toBe(1);

      store.setState(null, secondResults, null, 0, null);
      expect(store.resultDetails()).toBe(secondResults);
      expect(store.resultDetails().length).toBe(2);
    });

    it('should update maxProviderCol with different values', () => {
      store.setState(null, [], null, 3, null);
      expect(store.maxProviderCol()).toBe(3);

      store.setState(null, [], null, 10, null);
      expect(store.maxProviderCol()).toBe(10);
    });
  });

  describe('getHomeTeam', () => {
    it('should return homeName from matchDetail', () => {
      const matchDetail = createMockMatchDetail('Home Team', 'Away Team');
      store.setState(matchDetail, [], null, 0, null);

      const homeTeam = store.getHomeTeam();

      expect(homeTeam).toBe('Home Team');
    });

    it('should return empty string when matchDetail is null', () => {
      store.setState(null, [], null, 0, null);

      const homeTeam = store.getHomeTeam();

      expect(homeTeam).toBeUndefined();
    });

    it('should return empty string when homeName is empty', () => {
      const matchDetail = createMockMatchDetail('', 'Away Team');
      store.setState(matchDetail, [], null, 0, null);

      const homeTeam = store.getHomeTeam();

      expect(homeTeam).toBe('');
    });

    it('should return updated homeName after setState', () => {
      const firstMatchDetail = createMockMatchDetail('First Home', 'Away');
      const secondMatchDetail = createMockMatchDetail('Second Home', 'Away');

      store.setState(firstMatchDetail, [], null, 0, null);
      expect(store.getHomeTeam()).toBe('First Home');

      store.setState(secondMatchDetail, [], null, 0, null);
      expect(store.getHomeTeam()).toBe('Second Home');
    });
  });

  describe('getAwayTeam', () => {
    it('should return awayName from matchDetail', () => {
      const matchDetail = createMockMatchDetail('Home Team', 'Away Team');
      store.setState(matchDetail, [], null, 0, null);

      const awayTeam = store.getAwayTeam();

      expect(awayTeam).toBe('Away Team');
    });

    it('should return undefined when matchDetail is null', () => {
      store.setState(null, [], null, 0, null);

      const awayTeam = store.getAwayTeam();

      expect(awayTeam).toBeUndefined();
    });

    it('should return empty string when awayName is empty', () => {
      const matchDetail = createMockMatchDetail('Home Team', '');
      store.setState(matchDetail, [], null, 0, null);

      const awayTeam = store.getAwayTeam();

      expect(awayTeam).toBe('');
    });

    it('should return updated awayName after setState', () => {
      const firstMatchDetail = createMockMatchDetail('Home', 'First Away');
      const secondMatchDetail = createMockMatchDetail('Home', 'Second Away');

      store.setState(firstMatchDetail, [], null, 0, null);
      expect(store.getAwayTeam()).toBe('First Away');

      store.setState(secondMatchDetail, [], null, 0, null);
      expect(store.getAwayTeam()).toBe('Second Away');
    });
  });

  describe('signal reactivity', () => {
    it('should reflect changes when signals are updated', () => {
      const matchDetail = createMockMatchDetail();
      const resultDetails = [createMockResultDetail('R001')];
      const permission = createMockPermission();

      store.setState(matchDetail, resultDetails, permission, 3, null);

      expect(store.matchDetail()).toBe(matchDetail);
      expect(store.resultDetails()).toBe(resultDetails);
      expect(store.permission()).toBe(permission);
      expect(store.maxProviderCol()).toBe(3);
    });

    it('should allow direct signal updates', () => {
      const matchDetail = createMockMatchDetail();
      store.matchDetail.set(matchDetail);

      expect(store.matchDetail()).toBe(matchDetail);
    });

    it('should allow updating resultDetails directly', () => {
      const resultDetails = [createMockResultDetail('R001')];
      store.resultDetails.set(resultDetails);

      expect(store.resultDetails()).toBe(resultDetails);
    });
  });

  describe('edge cases', () => {
    it('should handle empty resultDetails array', () => {
      store.setState(null, [], null, 0, null);

      expect(store.resultDetails()).toEqual([]);
      expect(store.resultDetails().length).toBe(0);
    });

    it('should handle large resultDetails array', () => {
      const resultDetails = Array.from({ length: 100 }, (_, i) => createMockResultDetail(`R${i}`));
      store.setState(null, resultDetails, null, 0, null);

      expect(store.resultDetails().length).toBe(100);
    });

    it('should handle negative maxProviderCol', () => {
      store.setState(null, [], null, -1, null);

      expect(store.maxProviderCol()).toBe(-1);
    });

    it('should handle zero maxProviderCol', () => {
      store.setState(null, [], null, 0, null);

      expect(store.maxProviderCol()).toBe(0);
    });
  });

  function createMockMatchDetail(homeName: string = 'Home Team', awayName: string = 'Away Team'): MatchDetail {
    return {
      matchId: 1,
      matchCode: 'MATCH001',
      kickOffTime: '2024-01-01T10:00:00',
      leagueName: 'Test League',
      leagueId: 1,
      homeName,
      awayName,
      homeId: 1,
      awayId: 2,
      playTime: 90,
      bestOfMap: 1,
      gameSession: 1,
      sessionTime: 0,
      map: null,
      isSavedScore: false,
      betStatus: 'Running',
      confirmFT: 0,
      confirmHT: 0,
      eventStatus: 'Live',
      sportName: 'Basketball',
      sportType: 1,
      externalSourceName: 'Source 1',
      leagueGroupId: 1,
      gameType: 1,
      parentId: 0,
      autoSetting: 0,
      isFantasy: false,
      isSupportCopyScore: false,
      leagueType: 1,
      providerCount: 1,
    } as MatchDetail;
  }

  function createMockResultDetail(resourceId: string = 'R001'): ResultDetail {
    return {
      resourceId,
      homeValue: '',
      awayValue: '',
      resourceName: '',
      resultStatusId: 1,
      settlementStatusId: 1,
      resultStatus: '',
      resultStatusColor: '',
      isInvalidValue: false,
    } as ResultDetail;
  }

  function createMockPermission(): Permission {
    return {
      canEdit: true,
      canDelete: false,
    } as unknown as Permission;
  }
});
