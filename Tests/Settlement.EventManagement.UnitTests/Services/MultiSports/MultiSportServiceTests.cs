using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Caching;
using Fanex.Data.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services.MultiSports;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services.MultiSports;

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

    [Fact]
    public async Task GetWaitingMatches_ExistMatchesOnCache_ReturnNotNullWhenHaveMatchInCache()
    {
        // Arrange
        var request = new RefreshMultiSportRequest();
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
        var match = new Match
        {
            MatchId = 700000,
            SportType = 2
        };
        var resultDetail = new ResultDetail
        {
            MatchId = 700000,
            ResourceId = "01"
        };
        var listMatch = new List<Match> { match };
        repository.FetchAsync<Match>(Arg.Any<ICriteria>()).Returns(listMatch);
        repository.FetchAsync<ResultDetail>(Arg.Any<ICriteria>()).Returns(new List<ResultDetail> { resultDetail });
        refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);
        matchService.GetScoreForMatchBySportType(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<int>()).Returns(new List<Match> { match });
        matchService.MergeMatches(Arg.Any<List<Match>>(), Arg.Any<List<Match>>()).Returns(listMatch);
        matchService.SetNewMatchInfo(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>()).Returns(listMatch);
        var waitingMatches = await service.GetWaitingMatches(new RefreshMultiSportRequest());

        Assert.NotNull(waitingMatches);
    }

    [Fact]
    public async Task GetSportBook_Always_ReturnQuerriedMatches()
    {
        var match = new Match
        {
            MatchId = 700000,
            SportType = 2,
            LeagueId = 1,
            RefDataService = refDataService
        };
        var listMatch = new List<Match> { match };
        repository.FetchAsync<Match>(Arg.Any<ICriteria>()).Returns(listMatch);
        repository.FetchAsync<ResultDetail>(Arg.Any<ICriteria>()).Returns(new List<ResultDetail>());
        refDataService.GetLeagueName(Arg.Any<string>()).Returns(string.Empty);
        matchService.GetScoreForMatchBySportType(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<int>()).Returns(new List<Match> { match });
        matchService.MergeMatches(Arg.Any<List<Match>>(), Arg.Any<List<Match>>()).Returns(listMatch);
        matchService.SetNewMatchInfo(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>()).Returns(listMatch);
        matchService.SortingMatches(Arg.Any<List<Match>>()).Returns(new List<Match> { match });
        var sportBooks = await service.GetSportBook(new FilterMultiSportRequest());

        var actualMatches = sportBooks[0].Leagues[0].Matches;

        Assert.NotNull(actualMatches);
    }

    [Fact]
    public async Task Calculate_ValidateFailedAndNotExistIdValid_StopAndReturnError()
    {
        await repository.ExecuteAsync(Arg.Do<ValidateCalculateParlayCriteria>(x =>
        {
            x.ErrCode = 1;
            x.MatchIdsValid = "";
            x.ErrMsg = "ABC";
        }));

        var actual = await service.Calculate(new CalculateParlayRequest());

        Assert.Equal(1, actual.ErrCode);
        Assert.Equal("All matches are being calculated, except following matches ABC Please contact Starix IT for further support!", actual.ErrMsg);
        repository.DidNotReceive().Execute(Arg.Any<ParlayCriteria>());
    }

    [Fact]
    public async Task Calculate_ValidateFailedAndExistIdsValid_SettleIdsValid()
    {
        await repository.ExecuteAsync(Arg.Do<ValidateCalculateParlayCriteria>(x =>
        {
            x.ErrCode = 1;
            x.MatchIdsValid = "123, 456, 789";
            x.ErrMsg = "ABC";
        }));
        await repository.ExecuteAsync(Arg.Do<ValidateTicketParlayCriteria>(x =>
        {
            x.ErrCode = 1;
            x.ErrMsg = "ZYZ";
            x.MatchIdsValid = "123, 456, 789";
        }));

        var actual = await service.Calculate(new CalculateParlayRequest());

        Assert.Equal(1, actual.ErrCode);
        Assert.Equal("All matches are being calculated, except following matches ABCZYZZYZ", actual.ErrMsg);
        repository.Received(2).Execute(Arg.Any<ParlayCriteria>());
    }
}