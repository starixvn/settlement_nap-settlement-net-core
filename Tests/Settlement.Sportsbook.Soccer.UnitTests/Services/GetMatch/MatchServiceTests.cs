using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.GetMatch.Services;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Xunit;
using Match = Settlement.Sportsbook.Soccer.Models.Match;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.GetMatch;

public class MatchServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly PermissionService permission;

    private readonly IRefDataService refDataService;

    private readonly IGoalIconService goalIconService;

    private readonly IFetchDataService fetchDataService;
    private readonly IMatchService service;

    public MatchServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        permission = Substitute.For<PermissionService>(null, null, null, null);
        refDataService = Substitute.For<IRefDataService>();
        goalIconService = Substitute.For<IGoalIconService>();
        fetchDataService = Substitute.For<IFetchDataService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SoccerAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        service = new MatchServiceImp(repository, permission, mapper, refDataService, goalIconService, fetchDataService);
    }

    [Fact]
    public void GetBetStatus_IsNotExistMatchId_ReturnsEmpty()
    {
        // Act
        var actualBetStatus = service.GetBetStatus(123);

        // Assert
        Assert.Empty(actualBetStatus);
    }

    [Fact]
    public void GetBetStatus_IsExistMatchId_ReturnsBetStatus()
    {
        // Arrange
        repository.Get<MatchDetail>(Arg.Any<GetMatchInfoCriteria>())
            .Returns(new MatchDetail { BetStatus = "12345" });
        // Act
        var actualBetStatus = service.GetBetStatus(123);

        // Assert
        Assert.Equal("12345", actualBetStatus);
    }

    [Fact]
    public async Task MatchDetail_Always_ReturnsCorrectMatch()
    {
        // Arrange
        var match = new Match
        {
            MatchDetail = new MatchDetail { MatchId = 123 },
            TicketCounts = new List<TicketCounts>(),
            ChildMatches = new List<ChildMatchModel>()
        };
        var goalIcon = new GoalIcon
        {
            AwayGoal = "1",
            HomeGoal = "2"
        };
        var hedgeMatch = new HedgeMatchDetail { MatchId = 1234 };
        fetchDataService.GetMatchInfo(Arg.Any<GetMatchRequest>()).Returns(match);
        goalIconService.GetGoalIcon(Arg.Any<GoalIconQueryModel>()).Returns(goalIcon);
        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>()).Returns(new List<ResultDetail>());
        repository.GetAsync<HedgeMatchDetail>(Arg.Any<GetHedgeMatchCriteria>()).Returns(hedgeMatch);

        // Act
        var actualMatch = await service.GetMatch(new GetMatchRequest { MatchId = 1 });

        // Assert
        Assert.Equal(123, actualMatch.MatchDetail.MatchId);
        Assert.Equal("2", actualMatch.MatchDetail.GoalIcon.HomeGoal);
        Assert.Equal("1", actualMatch.MatchDetail.GoalIcon.AwayGoal);
        Assert.Equal(1234, actualMatch.HedgeMatchDetail.MatchId);
    }

    [Fact]
    public async Task MatchDetail_FantasySoccerMatch_ReturnMatchWithRelatedMatchesAsync()
    {
        // Arrange
        var match = new Match
        {
            MatchDetail = new MatchDetail { MatchId = 123, LeagueId = 16371 },
            TicketCounts = new List<TicketCounts>(),
            ChildMatches = new List<ChildMatchModel>()
        };

        fetchDataService.GetMatchInfo(Arg.Any<GetMatchRequest>()).Returns(match);
        goalIconService.GetGoalIcon(Arg.Any<GoalIconQueryModel>()).Returns(new GoalIcon());
        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>()).Returns(new List<ResultDetail>());
        repository.GetAsync<HedgeMatchDetail>(Arg.Any<GetHedgeMatchCriteria>()).Returns(new HedgeMatchDetail());
        var fantasyResult = (Substitute.For<IEnumerable<FantasyMatchDetail>>(), new List<FantasyRelatedMatch> { new FantasyRelatedMatch() });
        repository.FetchMultipleAsync<FantasyMatchDetail, FantasyRelatedMatch>(Arg.Any<CriteriaBase>()).Returns(fantasyResult);

        // Act
        var actualMatch = await service.GetMatch(new GetMatchRequest { MatchId = 1 });

        // Assert
        Assert.Single(actualMatch.FantasyMatch.RelatedMatches);
    }

    [Fact]
    public async Task MatchDetail_ExternalResultDetail_ReturnMatchExternalScore()
    {
        // Arrange
        var resultDetail = new List<ResultDetail>
        {
            new ResultDetail { ResourceId = "01", AwayValue = "1", HomeValue = "2", SourceId = SourceType.SBO}
        };

        var match = new Match
        {
            MatchDetail = new MatchDetail { MatchId = 123 },
            TicketCounts = new List<TicketCounts>(),
            ChildMatches = new List<ChildMatchModel>()
        };

        fetchDataService.GetMatchInfo(Arg.Any<GetMatchRequest>()).Returns(match);
        goalIconService.GetGoalIcon(Arg.Any<GoalIconQueryModel>()).Returns(new GoalIcon());
        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>()).Returns(resultDetail);
        repository.GetAsync<HedgeMatchDetail>(Arg.Any<GetHedgeMatchCriteria>()).Returns(new HedgeMatchDetail());
        // Act
        var actualMatch = await service.GetMatch(new GetMatchRequest { MatchId = 1 });

        // Assert
        Assert.Equal(1, actualMatch.MatchDetail.ExHTAwayScore);
        Assert.Equal(2, actualMatch.MatchDetail.ExHTHomeScore);
    }

    [Fact]
    public async Task GetMatchRefund_Always_ReturnsCorrectMatch()
    {
        // Arrange
        var match = new Match
        {
            MatchDetail = new MatchDetail { MatchId = 123 },
            TicketCounts = new List<TicketCounts>(),
            ChildMatches = new List<ChildMatchModel>()
        };
        var goalIcon = new GoalIcon
        {
            AwayGoal = "1",
            HomeGoal = "2"
        };
        var hedgeMatch = new HedgeMatchDetail { MatchId = 1234 };
        var betDaq = new BetDaq { IsMoveBetDaq = true };
        var betFair = new BetFair { IsMoveBetFair = true };
        fetchDataService.GetMatchInfo(Arg.Any<GetMatchRequest>()).Returns(match);
        goalIconService.GetGoalIcon(Arg.Any<GoalIconQueryModel>()).Returns(goalIcon);
        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>()).Returns(new List<ResultDetail>());
        repository.GetAsync<HedgeMatchDetail>(Arg.Any<GetHedgeMatchCriteria>()).Returns(hedgeMatch);
        fetchDataService.IsDeterminedHedgeMatch(Arg.Any<int>()).Returns(true);
        fetchDataService.GetMultiServersBetDaq(Arg.Any<BetDaqCheckingCriteria>()).Returns(betDaq);
        fetchDataService.GetMultiServersBetFair(Arg.Any<BetFairCheckingCriteria>()).Returns(betFair);

        // Act
        var actualMatch = await service.GetMatchRefund(new GetMatchRequest { MatchId = 1 });

        // Assert
        Assert.Equal(123, actualMatch.MatchDetail.MatchId);
        Assert.Equal("2", actualMatch.MatchDetail.GoalIcon.HomeGoal);
        Assert.Equal("1", actualMatch.MatchDetail.GoalIcon.AwayGoal);
        Assert.Equal(1234, actualMatch.HedgeMatchDetail.MatchId);
        Assert.True(actualMatch.HedgeMatchDetail.IsDeterminedHedgeMatch);
        Assert.True(actualMatch.BetDaq.IsMoveBetDaq);
        Assert.True(actualMatch.BetFair.IsMoveBetFair);
    }

    [Fact]
    public async Task GetLastestMatchDetail_Always_ReturnMatchDetail()
    {
        // Arrange
        repository.GetAsync<MatchDetail>(Arg.Any<GetLastestMatchDetailCriteria>())
            .Returns(new MatchDetail { MatchId = 123 });

        //act
        var match = await service.GetLastestMatchDetail(new GetLastestMatchDetailRequest());

        // Assert
        Assert.Equal(123, match.MatchId);
        Assert.Equal(refDataService, match.RefDataService);
    }

    [Fact]
    public async Task GetSpecificBetTypes_Always_ListBetTypeName()
    {
        // Arrange
        repository.FetchAsync<int>(Arg.Any<SpecificBetTypesCriteria>())
            .Returns(new List<int> { 1, 2, 3 });
        refDataService.GetBetTypeName(Arg.Any<string>()).Returns("1", "2", "3");

        //act
        var list = await service.GetSpecificBetTypes(new GetSpecificBetTypeRequest());

        // Assert
        Assert.Equal(new List<string> { "1", "2", "3" }, list);
        refDataService.Received(3).GetBetTypeName(Arg.Any<string>());
    }

    [Fact]
    public async Task GetSpecificBetTypes_Always_ListMatch()
    {
        // Arrange
        var matches = new List<MatchMoveBetTicket>
        {
            new MatchMoveBetTicket { MatchId = 123 },
            new MatchMoveBetTicket {MatchId = 456}
        };
        repository.FetchAsync<MatchMoveBetTicket>(Arg.Any<GetMatchDetailThirdPartyBetTicketCriteria>()).Returns(matches);

        //act
        var list = await service.GetMatchDetailThirdPartyBetTicket(new GetMatchDetailThirdPartyBetTicketsRequest());

        // Assert
        Assert.Equal(2, list.Count);
    }
}