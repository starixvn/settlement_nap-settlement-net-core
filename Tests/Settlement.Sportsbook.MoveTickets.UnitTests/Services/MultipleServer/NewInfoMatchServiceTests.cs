using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services.MultipleServer;

using MoveTickets.Services.MultipleServer;

public class NewInfoMatchServiceTests
{
    private readonly NewInfoMatchService service;

    private readonly SiteMatchService siteMatchService;

    public NewInfoMatchServiceTests()
    {
        siteMatchService = Substitute.For<SiteMatchService>();
        service = new NewInfoMatchServiceImp(siteMatchService);
    }

    [Theory]
    [InlineData(EventStatus.Postponed, true, 0, Background.YellowBlinking)]
    [InlineData(EventStatus.Postponed, false, 0, Background.Yellow)]
    [InlineData(EventStatus.ResultPending, true, 1, Background.BrightYellowBlinking)]
    [InlineData(EventStatus.ResultPending, false, 1, Background.BrightYellow)]
    [InlineData(EventStatus.Running, true, 0, Background.WhiteBlinking)]
    [InlineData(EventStatus.Running, false, 0, "")]
    public void EventStatusColor_EventStatusNotCompleted_ReturnCorrectly(string eventStatus, bool isMarkedTicket, byte isPending, string expected)
    {
        var match = new Match
        {
            EventStatus = eventStatus,
            SettlementStatus = isPending,
            IsExistMarkedTicket = isMarkedTicket
        };

        var result = service.EventStatusColor(match);

        Assert.Equal(expected, result);
    }

    [Fact]
    public void EventStatusColor_EventStatusCompleted_ReturnCorrectly()
    {
        var match = new Match
        {
            EventStatus = EventStatus.Completed,
            IsExistRunningTicket = false
        };

        siteMatchService.GetBackgroundCompletedStatus(Arg.Any<Match>()).Returns("Color");

        var result = service.EventStatusColor(match);

        Assert.Equal("Color", result);
    }

    [Theory]
    [InlineData(2, EventStatus.Running, 1, EventStatus.IrregularTime1H)]
    [InlineData(2, EventStatus.Running, 0, EventStatus.Running)]
    [InlineData(0, EventStatus.Running, 1, EventStatus.Waiting)]
    [InlineData(1, EventStatus.Running, 1, EventStatus.Calculating)]
    public void NewEventStatus_Always_ReturnCorrectValue(int isCalculatingSingle, string eventStatus,
        int eventStatusReason, string newEventStatus)
    {
        var match = new Match
        {
            IsCalculatingSingle = isCalculatingSingle,
            EventStatus = eventStatus,
            EventStatusReason = eventStatusReason
        };

        var result = service.NewEventStatus(match);

        Assert.Equal(newEventStatus, result);
    }

    [Fact]
    public void EarlySettlementStatus_Always_CallRelatedMethod()
    {
        service.EarlySettlementStatus(new Match());

        siteMatchService.Received().EarlySettlementStatus(Arg.Any<Match>());
    }
}