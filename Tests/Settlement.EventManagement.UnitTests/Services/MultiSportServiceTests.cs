using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Caching;
using Fanex.Data.Repository;
using Newtonsoft.Json;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Match = Settlement.EventManagement.Models.Match;

namespace Settlement.EventManagement.UnitTests.Services
{
    public class MultiSportServiceTests
    {
        private readonly IMultiSportService service;

        private readonly IDynamicRepository repository;

        private readonly IRefDataService refDataService;

        private readonly IMatchService matchService;

        private readonly ICacheService cacheService;

        private readonly PermissionService permissionService;

        private readonly IMapper mapper;

        public MultiSportServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            permissionService = Substitute.For<PermissionService>(null, null, null, null);
            refDataService = Substitute.For<IRefDataService>();
            matchService = Substitute.For<IMatchService>();
            cacheService = Substitute.For<ICacheService>();

            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<EventManagementAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            mapper = new Mapper(config);
            service = new MultiSportServiceImp(repository, refDataService, matchService, mapper, cacheService, permissionService);
        }

        private List<SportTypeModel> fakeSports => new List<SportTypeModel>
        {
            new SportTypeModel { SportType = SportType.OtherSports },
            new SportTypeModel { SportType = SportType.Wrestling},
            new SportTypeModel { SportType = SportType.Badminton }
        };

        private List<LeagueTypeModel> fakeLeagues => new List<LeagueTypeModel>
        {
            new LeagueTypeModel { SportType = SportType.OtherSports},
            new LeagueTypeModel { SportType = SportType.Badminton },
            new LeagueTypeModel { SportType = SportType.OtherSports }
        };

        [Fact]
        public async Task GetSports_Always_ReturnNotNull()
        {
            // Arrange
            var request = new SportRequest();
            repository.FetchAsync<SportTypeModel>(Arg.Any<SportCriteria>()).Returns(fakeSports);

            // Act
            var sports = await service.GetSports(request);

            // Assert
            Assert.NotNull(sports);
        }

        [Fact]
        public async Task GetSports_Always_ReturnAssignedGroupResult()
        {
            // Arrange
            var request = new SportRequest();
            repository.FetchAsync<SportTypeModel>(Arg.Any<SportCriteria>()).Returns(fakeSports);

            // Act
            var sports = await service.GetSports(request);

            // Assert
            Assert.NotNull(sports[0].Group);
            Assert.NotNull(sports[1].Group);
            Assert.NotNull(sports[2].Group);
        }

        [Fact]
        public async Task GetSports_ExistOrtherSport_ReturnWithOrtherSportAtBottomList()
        {
            // Arrange
            var request = new SportRequest();
            repository.FetchAsync<SportTypeModel>(Arg.Any<SportCriteria>()).Returns(fakeSports);

            // Act
            var sports = await service.GetSports(request);

            // Assert
            Assert.Equal(SportType.OtherSports, sports.Last().SportType);
        }

        [Fact]
        public async Task GetSports_ExistPopularSport_ReturnWithPopularSportAtTopList()
        {
            // Arrange
            var request = new SportRequest();
            repository.FetchAsync<SportTypeModel>(Arg.Any<SportCriteria>()).Returns(fakeSports);

            // Act
            var sports = await service.GetSports(request);

            // Assert
            Assert.Equal("All Popular Sports", sports[0].Group);
        }

        [Fact]
        public async Task GetLeagues_Always_ReturnNotNull()
        {
            // Arrange
            var request = new LeagueRequest();
            repository.FetchAsync<LeagueTypeModel>(Arg.Any<LeagueCriteria>()).Returns(fakeLeagues);
            refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);

            // Act
            var leagues = await service.GetLeagues(request);

            // Assert
            Assert.NotNull(leagues);
        }

        [Fact]
        public async Task GetLeagues_ExistOtherSportLeague_ReturnWithGroupOtherSportAtBottomList()
        {
            // Arrange
            var request = new LeagueRequest();
            repository.FetchAsync<LeagueTypeModel>(Arg.Any<LeagueCriteria>()).Returns(fakeLeagues);
            refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);

            // Act
            var leagues = await service.GetLeagues(request);

            // Assert

            Assert.Equal(SportType.OtherSports, leagues[1].SportType);
            Assert.Equal(SportType.OtherSports, leagues[2].SportType);
        }

        [Fact]
        public async Task GetLeagues_ExistPoppularSportLeague_ReturnWithGroupPopularSportAtTopList()
        {
            // Arrange
            var request = new LeagueRequest();
            repository.FetchAsync<LeagueTypeModel>(Arg.Any<LeagueCriteria>()).Returns(fakeLeagues);
            refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);

            // Act
            var leagues = await service.GetLeagues(request);

            // Assert
            Assert.Equal(SportType.Badminton, leagues.First().SportType);
        }

        [Fact]
        public async Task GetWaitingMatches_ExistMatchesOnCache_ReturnNotNullWhenHaveMatchInCache()
        {
            // Arrange
            var request = new RefreshMatchesRequest();
            var data = new List<Match>
            {
                new Match()
            };
            cacheService.Get<List<Match>>(Arg.Any<string>()).Returns(data);

            // Act
            var matches = await service.GetWaitingMatches(request);

            // Assert
            Assert.NotNull(matches);
        }

        [Fact]
        public async Task GetWaitingMatches_NotExistMatchesOnCache_ReturnQuerriedMatches()
        {
            var match = new Match();
            match.MatchId = 700000;
            match.SportType = 2;
            var resultDetail = new ResultDetail();
            resultDetail.MatchId = 700000;
            resultDetail.ResourceId = "01";
            var fakeData = new ValueTuple<IEnumerable<Match>, IEnumerable<ResultDetail>>();
            fakeData.Item1 = new List<Match> { match };
            fakeData.Item2 = new List<ResultDetail> { resultDetail };
            repository.FetchMultipleAsync<Match, ResultDetail>(Arg.Any<ICriteria>()).Returns(fakeData);
            refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);
            matchService.GetScoreForMatchBySportType(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<int>(), Arg.Any<int>()).Returns(new List<Match> { match });

            var waitingMatches = await service.GetWaitingMatches(new RefreshMatchesRequest());

            Assert.NotNull(waitingMatches);
        }

        private Match CreateMatch(int matchId, string eventStatus, bool isMarkedTicket, int leagueId = 1)
        {
            return new Match
            {
                MatchId = matchId,
                SportType = 2,
                EventStatus = eventStatus,
                IsExistMarkedTicket = isMarkedTicket,
                LeagueId = leagueId,
                RefDataService = refDataService,
            };
        }

        private MultiSportMatch CreateMultiSportMatch(int matchId, string eventStatus, bool isMarkedTicket, int leagueId = 1)
        {
            var match = new Match
            {
                MatchId = matchId,
                SportType = 2,
                EventStatus = eventStatus,
                IsExistMarkedTicket = isMarkedTicket,
                RefDataService = refDataService,
                LeagueId = leagueId,
            };
            return mapper.Map<Match, MultiSportMatch>(match);
        }

        [Fact]
        public async Task GetSportBook_Always_ReturnsExpectedOrderMatch()
        {
            // Arrange
            var resultDetail = new ResultDetail();
            resultDetail.MatchId = 1;
            resultDetail.ResourceId = "01";
            var fakeMatches = new List<Match> {
                CreateMatch(1, "Completed", false),
                CreateMatch(2, "Completed", true),
                CreateMatch(3, "Result Pending", false),
                CreateMatch(4, "Closed", false),
                CreateMatch(5, "Refund FT", false),
                CreateMatch(6, "Refund HT", false),
                CreateMatch(7, "Refund", false),
                CreateMatch(8, "Running", false),
                CreateMatch(9, "Postponed", false),
                CreateMatch(10, "Internal", false),
            };

            var fakeData = new ValueTuple<IEnumerable<Match>, IEnumerable<ResultDetail>>();

            fakeData.Item1 = fakeMatches;
            fakeData.Item2 = new List<ResultDetail> { resultDetail };
            repository.FetchMultipleAsync<Match, ResultDetail>(Arg.Any<ICriteria>()).Returns(fakeData);
            refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);
            matchService.GetScoreForMatchBySportType(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<int>(), Arg.Any<int>()).Returns(fakeMatches);

            // Act
            var sportBooks = await service.GetSportBook(new FilterMultiSportRequest());
            var actualMatches = sportBooks[0].Leagues[0].Matches;

            // Assert
            var expectedMatches = new List<MultiSportMatch> {
                CreateMultiSportMatch(1, "Completed", false),
                CreateMultiSportMatch(2, "Completed", true),
                CreateMultiSportMatch(3, "Result Pending", false),
                CreateMultiSportMatch(4, "Closed", false),
                CreateMultiSportMatch(5, "Refund FT", false),
                CreateMultiSportMatch(6, "Refund HT", false),
                CreateMultiSportMatch(7, "Refund", false),
                CreateMultiSportMatch(8, "Running", false),
                CreateMultiSportMatch(9, "Postponed", false),
                CreateMultiSportMatch(10, "Internal", false),
            };

            AssertExtension.AreEqual(expectedMatches, actualMatches);
        }
    }
}