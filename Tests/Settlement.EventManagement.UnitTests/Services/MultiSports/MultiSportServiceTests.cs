using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Caching;
using Fanex.Data.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Models.MultiSports;
using Settlement.EventManagement.Services.MultiSports;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services.MultiSports
{
    public class MultiSportServiceTests
    {
        private readonly IMultiSportService service;

        private readonly IDynamicRepository repository;

        private readonly IMatchService matchService;

        private readonly ICacheService cacheService;

        private readonly PermissionService permissionService;

        private readonly IMapper mapper;

        private readonly IRefDataService refDataService;

        public MultiSportServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            permissionService = Substitute.For<PermissionService>(null, null, null, null);
            matchService = Substitute.For<IMatchService>();
            cacheService = Substitute.For<ICacheService>();

            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<EventManagementAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            mapper = new Mapper(config);

            var accessor = Substitute.For<IHttpContextAccessor>();
            var context = new DefaultHttpContext
            {
                Connection =
                {
                    RemoteIpAddress = new System.Net.IPAddress(1)
                }
            };
            accessor.HttpContext = context;
            var appSetting = new AppSettingsKey { SiteDbServer = new List<string> { "DB01", "DB02" } };
            var option = Options.Create(appSetting);
            refDataService = Substitute.For<IRefDataService>();
            service = new MultiSportServiceImp(repository, matchService, mapper, cacheService, permissionService, accessor, option);
        }

        //[Fact]
        //public async Task GetWaitingMatches_ExistMatchesOnCache_ReturnNotNullWhenHaveMatchInCache()
        //{
        //    // Arrange
        //    var request = new RefreshMultiSportRequest();
        //    var data = new List<Match>
        //    {
        //        new Match()
        //    };
        //    cacheService.Get<List<Match>>(Arg.Any<string>()).Returns(data);

        //    // Act
        //    var matches = await service.GetWaitingMatches(request);

        //    // Assert
        //    Assert.NotNull(matches);
        //}

        //[Fact]
        //public async Task GetWaitingMatches_NotExistMatchesOnCache_ReturnQuerriedMatches()
        //{
        //    var match = new Match();
        //    match.MatchId = 700000;
        //    match.SportType = 2;
        //    var resultDetail = new ResultDetail();
        //    resultDetail.MatchId = 700000;
        //    resultDetail.ResourceId = "01";
        //    var fakeData = new ValueTuple<IEnumerable<Match>, IEnumerable<ResultDetail>>();
        //    fakeData.Item1 = new List<Match> { match };
        //    fakeData.Item2 = new List<ResultDetail> { resultDetail };
        //    repository.FetchMultipleAsync<Match, ResultDetail>(Arg.Any<ICriteria>()).Returns(fakeData);
        //    refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);
        //    matchService.GetScoreForMatchBySportType(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<int>()).Returns(new List<Match> { match });

        //    var waitingMatches = await service.GetWaitingMatches(new RefreshMultiSportRequest());

        //    Assert.NotNull(waitingMatches);
        //}

        private Match CreateMatch(int matchId, bool isMarkedTicket, int leagueId = 1)
        {
            return new Match
            {
                MatchId = matchId,
                SportType = 2,
                IsExistMarkedTicket = isMarkedTicket,
                LeagueId = leagueId,
                RefDataService = refDataService,
            };
        }

        private MultiSportMatch CreateMultiSportMatch(int matchId, bool isMarkedTicket, int leagueId = 1)
        {
            var match = new Match
            {
                MatchId = matchId,
                SportType = 2,
                IsExistMarkedTicket = isMarkedTicket,
                RefDataService = refDataService,
                LeagueId = leagueId,
            };
            return mapper.Map<Match, MultiSportMatch>(match);
        }

        [Fact]
        public async Task GetSportBook_Always_ReturnMatchInfoFromMultiSide()
        {
            var fakeMatches = new List<Match>
            {
                CreateMatch(1, false)
            };

            var fakeMatchesSite = new List<Match>
            {
                CreateMatch(1, true),
                CreateMatch(2, false)
            };

            repository.FetchAsync<Match>(Arg.Any<SportsbookCriteria>()).Returns(fakeMatches, fakeMatchesSite);
            repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>()).Returns(new List<ResultDetail>());

            var sportBooks = await service.GetSportBook(new FilterMultiSportRequest());
            var actualMatches = sportBooks[0].Leagues[0].Matches;
            var expected = new List<MultiSportMatch>
            {
                CreateMultiSportMatch(1, true),
                CreateMultiSportMatch(2, false)
            };

            AssertExtension.AreEqual(expected, actualMatches);
        }
    }
}