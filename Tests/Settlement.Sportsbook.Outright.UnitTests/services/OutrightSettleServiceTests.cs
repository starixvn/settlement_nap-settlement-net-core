using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Outright;
using Settlement.Outright.Criteria;
using Settlement.Outright.Models;
using Settlement.Outright.Requests;
using Settlement.Outright.Services;

namespace Settlement.Sportsbook.Outright.UnitTests.Services;

public class OutrightSettleServiceTests
{
    private readonly IDynamicRepository repository;
    private readonly IRefDataService refDataService;
    private readonly OutrightSettleProcessService outrightSettleProcessService;
    private readonly IBalanceUpService balanceUpService;
    private readonly OutrightSettleService service;
    private readonly OutrightTicketService outrightTicketService;
    private readonly INapSession currentSession;

    public OutrightSettleServiceTests()
    {
        // Arrange (Fixture)
        refDataService = Substitute.For<IRefDataService>();
        repository = Substitute.For<IDynamicRepository>();
        outrightSettleProcessService = Substitute.For<OutrightSettleProcessService>();
        currentSession = Substitute.For<INapSession>();
        currentSession.UserId.Returns(999);
        balanceUpService = Substitute.For<IBalanceUpService>();
        outrightTicketService = Substitute.For<OutrightTicketService>();

        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<OutrightMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        IMapper mapper = new Mapper(config);

        service = new OutrightSettleServiceImp(repository, mapper, refDataService, outrightSettleProcessService, currentSession, balanceUpService, outrightTicketService);
    }

    [Fact]
    public async Task GetLeagueInfo_Always_ReturnListTeamSorted()
    {
        // Arrange
        var teamOne = new Team { OddsStatus = EventStatus.Completed };
        var teamTwo = new Team { OddsStatus = EventStatus.Running };
        var teamThree = new Team { OddsStatus = EventStatus.Closed };

        balanceUpService.GetBalanceUpDay().Returns(new BalanceUp());
        repository.FetchAsync<Team>(Arg.Any<GetLeagueInfoCriteria>())
            .Returns(new List<Team> { teamOne, teamTwo, teamThree });
        refDataService.GetTeamName(Arg.Any<int>()).Returns("c", "b", "a");
        outrightTicketService.GetTeamsTicketCount(Arg.Any<IEnumerable<Team>>()).Returns(new List<TeamTicketModel>());

        // Act
        var actual = await service.GetLeagueInfo(new GetLeagueInfoRequest());

        // Assert
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
        // Arrange
        outrightSettleProcessService.ValidateRequest(Arg.Any<string>(), Arg.Any<IEnumerable<InfoValidate>>())
            .Returns(new ResultOutright { ErrCode = 1 });

        // Act
        var actual = await service.Uncalculate(new OutrightUndoRequest { MatchIds = "1", TeamIds = "1" });

        // Assert
        Assert.False(actual.IsSuccessful);
    }

    [Fact]
    public async Task Uncalculate_ExistExecuteFailed_ReturnResultFailed()
    {
        // Arrange
        outrightSettleProcessService.ValidateRequest(Arg.Any<string>(), Arg.Any<IEnumerable<InfoValidate>>())
             .Returns(new ResultOutright());
        outrightSettleProcessService.UpdateResultUndo(Arg.Any<OutrightSettleCriteria>())
            .Returns(new Result { ErrMsg = "test" });
        refDataService.GetTeamName(Arg.Any<string>()).Returns("TeamName");
        var request = new OutrightUndoRequest { MatchIds = "100,200", TeamIds = "101, 202" };

        // Act
        var actual = await service.Uncalculate(request);

        // Assert
        Assert.False(actual.IsSuccessful);
        Assert.Equal("TeamName: TeamName: test<br/><br/>TeamName: TeamName: test<br/><br/>", actual.ErrMsg);
    }

    [Fact]
    public async Task Calculate_ValidateRequestFailed_ReturnResultFailed()
    {
        // Arrange
        outrightSettleProcessService.ValidateRequest(Arg.Any<string>(), Arg.Any<IEnumerable<InfoValidate>>())
           .Returns(new ResultOutright { ErrCode = 1 });
        var request = new OutrightCalculateRequest { Teams = new List<TeamSettleModel>() };

        // Act
        var actual = await service.Calculate(request);

        // Assert
        Assert.False(actual.IsSuccessful);
    }

    [Fact]
    public async Task Calculate_ExistExecuteFailed_ReturnResultFailed()
    {
        // Arrange
        outrightSettleProcessService.ValidateRequest(Arg.Any<string>(), Arg.Any<IEnumerable<InfoValidate>>())
            .Returns(new ResultOutright());
        outrightSettleProcessService.UpdateResultCalculate(Arg.Any<OutrightSettleCriteria>())
            .Returns(_ => new Result { ErrMsg = "test" });
        refDataService.GetTeamName(Arg.Any<string>()).Returns("TeamName");
        var request = new OutrightCalculateRequest
        {
            DeadHeat = 1,
            Teams = new List<TeamSettleModel>
            {
                new() { TeamId = "1" },
                new() { TeamId = "2" }
            }
        };

        // Act
        var actual = await service.Calculate(request);

        // Assert
        Assert.False(actual.IsSuccessful);
        Assert.Equal("TeamName: test<br/>TeamName: test<br/>", actual.ErrMsg);
    }

    [Fact]
    public async Task SaveScore_ValidRequest_ExecutesSaveAndLog()
    {
        // Arrange
        var request = new SaveScoreRequest
        {
            Teams = new List<TeamExternalResult>
            {
                new() { OrId = 1, TeamId = 101, LeagueId = 201, ScreenShot = "screenshot1" }
            }
        };
        outrightSettleProcessService.CreateScoreResources(Arg.Any<IEnumerable<TeamExternalResult>>()).Returns("resources");

        // Act
        var result = await service.SaveScore(request);

        // Assert
        Assert.True(result.IsSuccessful);
        await repository.Received(1).ExecuteAsync(Arg.Any<SaveScoreCriteria>());
        await repository.Received(1).ExecuteAsync(Arg.Any<InsertLogOutRightCriteria>());
    }

    [Fact]
    public async Task UpdateDeadHeatSetting_Executes_WithAdminId()
    {
        // Arrange
        var request = new UpdateDeadHeatSettingRequest { LeagueId = 55, DeadHeat = true };

        // Act
        await service.UpdateDeadHeatSetting(request);

        // Assert
        await repository.Received(1).ExecuteAsync(Arg.Is<UpdateDeadHeatSettingCriteria>(c => c.LeagueId == 55 && c.AdminId == 999));
    }

    [Fact]
    public async Task GetDeadHeadLeagueSetting_ReturnsValue()
    {
        // Arrange
        repository.GetAsync<byte?>(Arg.Any<GetDeadHeatLeagueSettingCriteria>()).Returns((byte?)5);
        var request = new GetDeadHeadLeagueSettingRequest { LeagueId = 77 };

        // Act
        var result = await service.GetDeadHeadLeagueSetting(request);

        // Assert
        Assert.Equal((byte?)5, result);
        await repository.Received(1).GetAsync<byte?>(Arg.Is<GetDeadHeatLeagueSettingCriteria>(c => c.LeagueId == 77));
    }

    [Fact]
    public async Task SaveTraderScore_ValidRequest_ExecutesSaveAndLogs()
    {
        // Arrange
        var request = new SaveTraderScoreRequest
        {
            LeagueId = 88,
            Teams = new List<TeamResult>
            {
                new() { OrId = 1001, TeamId = 2001, Result = "R1" },
                new() { OrId = 1002, TeamId = 2002, Result = "R2" }
            }
        };
        outrightSettleProcessService.CreateResourceXmlByTeamResult(Arg.Any<List<DeadheatResourcesOutright>>()).Returns("xmlData");

        // Act
        var result = await service.SaveTraderScore(request);

        // Assert
        Assert.True(result.IsSuccessful);
        await repository.Received(1).ExecuteAsync(Arg.Is<SaveTraderScoreCriteria>(c => c.LeagueId == 88 && c.SelectedResources == "xmlData"));
        await repository.Received(2).ExecuteAsync(Arg.Any<InsertLogOutRightCriteria>());
    }
}