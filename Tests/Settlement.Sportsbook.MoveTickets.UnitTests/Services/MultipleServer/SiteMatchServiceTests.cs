using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services.MultipleServer;

using MoveTickets.Services.MultipleServer;

public class SiteMatchServiceTests
{
    private readonly SiteMatchService service = new SiteMatchServiceImp();

    //[Theory]
    //[InlineData(true, false, true)]
    //[InlineData(false, true, true)]
    //[InlineData(false, false, false)]
    //public void IsExistRunningTickets_Always_ReturnCorrect(bool main, bool site, bool expected)
    //{
    //    var match = new Match
    //    {
    //        IsExistRunningTicket = main,
    //        SiteMatch = [new SiteMatch { IsExistRunningTicket = site }]
    //    };

    //    var result = service.IsExistRunningTickets(match);

    //    Assert.Equal(expected, result);
    //}

    [Theory]
    [InlineData(CalculateStatus.IsWaiting, null, CalculateStatus.IsWaiting)]
    [InlineData(null, CalculateStatus.IsWaiting, CalculateStatus.IsWaiting)]
    [InlineData(CalculateStatus.IsCalculating, null, CalculateStatus.IsCalculating)]
    [InlineData(null, CalculateStatus.IsCalculating, CalculateStatus.IsCalculating)]
    [InlineData(CalculateStatus.IsFailed, null, CalculateStatus.IsFailed)]
    [InlineData(null, CalculateStatus.IsFailed, CalculateStatus.IsFailed)]
    [InlineData(CalculateStatus.IsSuccess, CalculateStatus.IsSuccess, CalculateStatus.IsSuccess)]
    [InlineData(null, CalculateStatus.IsSuccess, null)]
    [InlineData(CalculateStatus.IsSuccess, null, null)]
    [InlineData(CalculateStatus.IsWaiting, CalculateStatus.IsCalculating, CalculateStatus.IsWaiting)]
    [InlineData(CalculateStatus.IsWaiting, CalculateStatus.IsFailed, CalculateStatus.IsWaiting)]
    [InlineData(CalculateStatus.IsWaiting, CalculateStatus.IsSuccess, CalculateStatus.IsWaiting)]
    [InlineData(CalculateStatus.IsCalculating, CalculateStatus.IsFailed, CalculateStatus.IsCalculating)]
    [InlineData(CalculateStatus.IsCalculating, CalculateStatus.IsSuccess, CalculateStatus.IsCalculating)]
    [InlineData(CalculateStatus.IsFailed, CalculateStatus.IsSuccess, CalculateStatus.IsFailed)]
    [InlineData(null, null, null)]
    public void IsCalculatingSingle_Always_ReturnCorrect(int? mainStatus, int? siteStatus, int? expected)
    {
        var match = new Match
        {
            IsCalculatingSingle = mainStatus,
            SiteMatch = [new SiteMatch { IsCalculatingSingle = siteStatus }]
        };

        var result = service.IsCalculatingSingle(match);

        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(true, false, Background.WhiteBlinking)]
    [InlineData(true, true, Background.PinkBlinking)]
    [InlineData(false, true, Background.Pink)]
    [InlineData(false, false, "")]
    public void GetBackgroundCompletedStatus_Always_ReturnCorrect(bool markedTicket, bool runningTicket, string expected)
    {
        var match = new Match
        {
            IsExistMarkedTicket = markedTicket,
            IsExistRunningTicket = runningTicket
        };

        var result = service.GetBackgroundCompletedStatus(match);

        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(1, false, TicketStatus.Normal)]
    [InlineData(1, true, TicketStatus.NoTicket)]
    [InlineData(202, false, TicketStatus.NoTicket)]
    public void EarlySettlementStatus_MatchNotExistEarly_ReturnCorrectly(int childMatchType,
        bool isOpenOdds, string expected)
    {
        var match = new Match
        {
            SiteMatch = [new SiteMatch()],
            ChildMatchType = childMatchType,
            IsOpenOdds = isOpenOdds
        };

        var result = service.EarlySettlementStatus(match);

        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(true, TicketStatus.Running)]
    public void EarlySettlementStatus_MatchExistRunningEarly_ReturnCorrectly(bool isRunningEarlyBetTypesMain, string expected)
    {
        var match = new Match
        {
            IsExistEarlyBetTypes = true,
            IsRunningEarlyBetTypes = isRunningEarlyBetTypesMain
        };

        var result = service.EarlySettlementStatus(match);

        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(true, TicketStatus.Waiting)]
    public void EarlySettlementStatus_MatchExistWaitingEarlyAndNotExistRunningTicket_ReturnCorrectly(bool isWaitingEarlyBetTypesSite, string expected)
    {
        var match = new Match
        {
            IsExistEarlyBetTypes = true,
            IsWaitingEarlyBetTypes = isWaitingEarlyBetTypesSite
        };

        var result = service.EarlySettlementStatus(match);

        Assert.Equal(expected, result);
    }
}