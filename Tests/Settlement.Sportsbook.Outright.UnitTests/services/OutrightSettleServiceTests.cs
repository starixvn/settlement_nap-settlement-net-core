using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Outright;
using Settlement.Outright.Criteria;
using Settlement.Outright.Models;
using Settlement.Outright.Requests;
using Settlement.Outright.Services;

namespace Settlement.Sportsbook.Outright.UnitTests.services;

public class OutrightSettleServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;
    private readonly IRefDataService refDataService;

    private readonly OutrightSettleProcessService outrightSettleProcessService;

    private readonly OutrightPermissionService permission;
    private readonly INapSession currentSession;
    private readonly IBalanceUpService balanceUpService;

    private readonly OutrightSettleService service;

    public OutrightSettleServiceTests()
    {
        refDataService = Substitute.For<IRefDataService>();
        repository = Substitute.For<IDynamicRepository>();
        outrightSettleProcessService = Substitute.For<OutrightSettleProcessService>();
        var permission = Substitute.For<OutrightPermissionService>();
        var currentSession = Substitute.For<INapSession>();
        balanceUpService = Substitute.For<IBalanceUpService>();

        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<OutrightMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        mapper = new Mapper(config);

        service = new OutrightSettleServiceImp(repository, mapper, refDataService, outrightSettleProcessService,
            permission, currentSession, balanceUpService);
    }

    [Fact]
    public async Task GetLeagueInfo_Always_ReturnListTeamSorted()
    {
        var teamOne = new Team { OddsStatus = EventStatus.Completed };
        var teamTwo = new Team { OddsStatus = EventStatus.Running };
        var teamThree = new Team { OddsStatus = EventStatus.Closed };

        balanceUpService.GetBalanceUpDay().Returns(new BalanceUp());
        repository.FetchAsync<Team>(Arg.Any<GetLeagueInfoCriteria>())
            .Returns(new List<Team> { teamOne, teamTwo, teamThree });
        refDataService.GetTeamName(Arg.Any<int>()).Returns("c", "b", "a");

        var actual = await service.GetLeagueInfo(new GetLeagueInfoRequest());

        var teams = actual.Teams.ToList();

        Assert.Equal(3, actual.Teams.Count());
        Assert.Equal(EventStatus.Closed, teams[0].OddsStatus);
        Assert.Equal(EventStatus.Running, teams[1].OddsStatus);
        Assert.Equal(EventStatus.Completed, teams[2].OddsStatus);
        refDataService.Received(1).GetLeagueName(Arg.Any<int>());
        refDataService.Received(1).GetSportName(Arg.Any<int>());
    }

    [Fact]
    public async Task Uncalculate_ValidateRequestFailed_ReturnResultFailed()
    {
        outrightSettleProcessService.ValidateRequest(Arg.Any<string>(), Arg.Any<IEnumerable<InfoValidate>>())
            .Returns(new ResultOutright { ErrCode = 1 });

        var actual = await service.Uncalculate(new OutrightUndoRequest { MatchIds = "1", TeamIds = "1" });

        Assert.False(actual.IsSuccessful);
    }

    [Fact]
    public async Task Uncalculate_ExistExecuteFailed_ReturnResultFailed()
    {
        outrightSettleProcessService.ValidateRequest(Arg.Any<String>(), Arg.Any<IEnumerable<InfoValidate>>())
             .Returns(new ResultOutright());
        outrightSettleProcessService.UpdateResultUndo(Arg.Any<OutrightSettleCriteria>())
            .Returns(new Result { ErrMsg = "test" });
        refDataService.GetTeamName(Arg.Any<string>()).Returns("TeamName");

        var actual = await service.Uncalculate(new OutrightUndoRequest { MatchIds = "100,200", TeamIds = "101, 202" });

        Assert.False(actual.IsSuccessful);
        Assert.Equal("TeamName: TeamName: test<br/><br/>TeamName: TeamName: test<br/><br/>", actual.ErrMsg);
    }

    [Fact]
    public async Task Calculate_ValidateRequestFailed_ReturnResultFailed()
    {
        outrightSettleProcessService.ValidateRequest(Arg.Any<string>(), Arg.Any<IEnumerable<InfoValidate>>())
           .Returns(new ResultOutright { ErrCode = 1 });
        var request = new OutrightCalculateRequest
        {
            Teams = new List<TeamSettleModel>()
        };

        var actual = await service.Calculate(request);

        Assert.False(actual.IsSuccessful);
    }

    [Fact]
    public async Task Calculate_ExistExecuteFailed_ReturnResultFailed()
    {
        outrightSettleProcessService.ValidateRequest(Arg.Any<string>(), Arg.Any<IEnumerable<InfoValidate>>())
            .Returns(new ResultOutright());
        outrightSettleProcessService.UpdateResultCalculate(Arg.Any<OutrightSettleCriteria>())
            .Returns(x => new Result { ErrMsg = "test" });
        refDataService.GetTeamName(Arg.Any<string>()).Returns("TeamName");

        var request = new OutrightCalculateRequest
        {
            DeadHeat = 1,
            Teams = new List<TeamSettleModel>
            {
                new() { TeamId = "1" },
                new() { TeamId = "2" },
            }
        };
        var actual = await service.Calculate(request);

        Assert.False(actual.IsSuccessful);
        Assert.Equal("TeamName: test<br/>TeamName: test<br/>", actual.ErrMsg);
    }
}