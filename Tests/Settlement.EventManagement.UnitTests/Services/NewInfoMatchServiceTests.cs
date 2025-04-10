using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Services;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services;

using Settlement.Core.Services.SpecificService;

public class NewInfoMatchServiceTests
{
    private readonly SiteMatchService siteMatchService;

    private readonly GoalIconService goalIconService;

    private readonly NewInfoMatchService service;

    private readonly EventStatusService eventStatusService;

    private readonly AdjustEventStatusService adjustEventStatusService;

    private readonly IDynamicRepository repository;
    private readonly PermissionService permissionService;

    public NewInfoMatchServiceTests()
    {
        siteMatchService = Substitute.For<SiteMatchService>();
        goalIconService = Substitute.For<GoalIconService>();
        eventStatusService = Substitute.For<EventStatusService>();
        adjustEventStatusService = Substitute.For<AdjustEventStatusService>();
        repository = Substitute.For<IDynamicRepository>();
        permissionService = Substitute.For<PermissionService>();

        service = new NewInfoMatchServiceImp(siteMatchService, goalIconService, eventStatusService, adjustEventStatusService, repository, permissionService);
    }

    [Theory]
    [InlineData(true, EventStatus.Postponed, 0, Background.YellowBlinking)]
    [InlineData(false, EventStatus.Postponed, 0, Background.Yellow)]
    [InlineData(true, EventStatus.Running, 0, Background.WhiteBlinking)]
    [InlineData(false, EventStatus.Running, 0, "")]
    [InlineData(true, EventStatus.ResultPending, 1, Background.BrightYellowBlinking)]
    [InlineData(false, EventStatus.ResultPending, 1, Background.BrightYellow)]
    public void EventStatusColor_PostponedStatus_ReturnCorrectColor(bool existMarkedTickets, string eventStatus,
        int settlementStatus, string color)
    {
        var match = new Match { EventStatus = eventStatus, SettlementStatus = (byte)settlementStatus };

        siteMatchService.IsExistMarkedTickets(Arg.Any<Match>()).Returns(existMarkedTickets);

        var actual = service.EventStatusColor(match);

        Assert.Equal(color, actual);
    }

    [Fact]
    public void EventStatusColor_MatchCompleted_ReturnBackgroundFromService()
    {
        var match = new Match { EventStatus = EventStatus.Completed };

        siteMatchService.GetBackgroundCompletedStatus(Arg.Any<Match>()).Returns("Red");

        var actual = service.EventStatusColor(match);

        Assert.Equal("Red", actual);
    }

    [Fact]
    public void NewEventStatus_MatchSupportSDT_CallRelateFunction()
    {
        service.NewEventStatus(new Match { SportType = SportType.BasketBall });

        adjustEventStatusService.Received()
            .EventStatusAbandoned(Arg.Any<string>(), Arg.Any<IEnumerable<ResultDetail>>(), Arg.Any<int>());
        eventStatusService.Received()
            .CheckProcessingStatus(Arg.Any<string>(), Arg.Any<Match>());
    }

    [Fact]
    public void NewEventStatus_MatchDoNotSupportSDT_NotCallRelateFunction()
    {
        service.NewEventStatus(new Match { SportType = SportType.Badminton });

        adjustEventStatusService.DidNotReceive()
            .EventStatusAbandoned(Arg.Any<string>(), Arg.Any<IEnumerable<ResultDetail>>(), Arg.Any<int>());
        eventStatusService.Received()
            .CheckProcessingStatus(Arg.Any<string>(), Arg.Any<Match>());
    }

    [Fact]
    public void EarlySettlementStatus_Always_CallRelatedMethod()
    {
        service.EarlySettlementStatus(new Match());

        siteMatchService.Received().EarlySettlementStatus(Arg.Any<Match>());
    }

    [Fact]
    public void FastMarketStatus_Always_CallRelatedMethod()
    {
        service.FastMarketStatus(new Models.Calculation.Match());

        siteMatchService.Received().FastMarketStatus(Arg.Any<Models.Calculation.Match>());
    }

    [Theory]
    [InlineData("01", "1", "2", "Test", "(Test: 1-2)")]
    [InlineData("02", "1", "2", "Test", "")]
    [InlineData("01", "", "2", "Test", "")]
    [InlineData("01", "1", "", "Test", "")]
    public void ConfirmScore_Always_ReturnCorrectValue(string resource, string home, string away, string sourceName,
        string expected)
    {
        var resultDetail = new ResultDetail
        {
            ResourceId = resource,
            HomeValue = home,
            AwayValue = away,
            SourceName = sourceName
        };

        var result = service.ConfirmScore([resultDetail], "01");

        Assert.Equal(expected, result);
    }

    [Fact]
    public void IsNotConsistentScore_SuspenderIsBlank_ReturnFalse()
    {
        var result = service.IsInconsistentScore("-", [], [], "01");

        Assert.False(result);
    }

    [Theory]
    [InlineData("01", "01", "1", "2", "1", "2", false)]
    [InlineData("01", "01", "2", "2", "1", "2", true)]
    [InlineData("01", "01", "1", "1", "1", "2", true)]
    [InlineData("01", "02", "1", "2", "1", "2", true)]
    [InlineData("02", "01", "1", "2", "1", "2", false)]
    public void IsNotConsistentScore_SuspenderNotBlank_ReturnCorrect(string resourceOfSource, string resourceOfResultDetail,
        string homeSource, string awaySource,
        string home, string away, bool expected)
    {
        var sourceResultDetail = new ResultDetail
        {
            ResourceId = resourceOfSource,
            HomeValue = homeSource,
            AwayValue = awaySource
        };

        var resultDetail = new ResultDetail
        {
            ResourceId = resourceOfResultDetail,
            HomeValue = home,
            AwayValue = away
        };

        var result = service.IsInconsistentScore("Test", [resultDetail],
            [sourceResultDetail], "01");

        Assert.Equal(expected, result);
    }

    [Fact]
    public void GoalIcon_Always_CallRelatedMethod()
    {
        service.GoalIcon(new Models.Calculation.Match());

        goalIconService.Received().GetGoalIcon(Arg.Any<GoalIconQueryModel>());
    }

    [Fact]
    public void TicketInfo_Always_ReturnCorrect()
    {
        var match = new Match();

        siteMatchService.IsExistMarkedTickets(Arg.Any<Match>()).Returns(true);
        siteMatchService.IsExistRunningTickets(Arg.Any<Match>()).Returns(true);
        siteMatchService.IsCalculating(Arg.Any<int?>(), Arg.Any<List<int?>>()).Returns(1);

        service.TicketInfo(match);

        Assert.True(match.IsExistMarkedTicket && match is { IsExistRunningTicket: true, IsCalculatingSingle: 1 });
    }

    [Fact]
    public void IsExistsConfirmedEarly_Always_CallRelatedMethod()
    {
        service.IsExistsConfirmedEarly(new Match());

        siteMatchService.Received().IsExistsConfirmedEarly(Arg.Any<Match>());
    }

    [Fact]
    public void GetAutoSetting_Always_MapDataIntoList()
    {
        var matches = new List<Match>
        {
            new()
            {
                MatchId = 1
            },
            new()
            {
                MatchId = 2
            }
        };

        var matchStatuses = new List<MatchStatusModel>
        {
            new ()
            {
                MatchId = 1,
                HasAutoPayoutFail = true,
                InstantStatus = 1
            },
            new ()
            {
            MatchId = 2,
            HasInstantFail = true,
            AutoPayoutStatus = 2
        }
        };

        repository.FetchAsync<MatchStatusModel>(Arg.Any<GetAutoStatusCriteria>()).Returns(matchStatuses);
        service.GetAutoSetting(matches);

        Assert.Equal(3, matches[0].AutoPayoutStatus);
        Assert.Equal(2, matches[1].AutoPayoutStatus);
        Assert.Equal(1, matches[0].AutoInstantStatus);
        Assert.Equal(3, matches[1].AutoInstantStatus);
    }
}