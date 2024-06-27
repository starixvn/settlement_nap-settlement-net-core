using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Services;
using ResultDetail = Settlement.Sportsbook.Aio.Models.ResultDetail;

namespace Settlement.Sportsbook.Aio.UnitTests.Services;

public class MergeDataServiceTests
{
    private readonly MergeDataService service = new MergeDataServiceImp();

    [Fact]
    public void MergeTicketDetails_Always_SumBetTypeOnResultDetail()
    {
        var data = new List<(List<ResultDetail>, TicketCounts)>();
        var listResultDetail = new List<ResultDetail>
        {
            new()
            {
                ResourceId = "00",
                InWaiting = 1,
                InRunning = 2,
                BetMarkedCount = 3,
                BetSettledCount = 4,
                BetRefundedCount = 5,
                BetCount = 15
            }
        };

        var listResultDetailSecond = new List<ResultDetail>
        {
            new()
            {
                ResourceId = "00",
                InWaiting = 1,
                InRunning = 1,
                BetMarkedCount = 1,
                BetSettledCount = 1,
                BetRefundedCount = 1,
                BetCount = 5
            }
        };

        data.Add((listResultDetail, new TicketCounts()));
        data.Add((listResultDetailSecond, new TicketCounts()));

        var result = service.MergeTicketDetails(data);

        Assert.Equal(2, result.ticketDetails[0].InWaiting);
        Assert.Equal(3, result.ticketDetails[0].InRunning);
        Assert.Equal(4, result.ticketDetails[0].BetMarkedCount);
        Assert.Equal(5, result.ticketDetails[0].BetSettledCount);
        Assert.Equal(6, result.ticketDetails[0].BetRefundedCount);
        Assert.Equal(20, result.ticketDetails[0].BetCount);
    }

    [Fact]
    public void MergeTicketDetails_Always_SumTicketCount()
    {
        var data = new List<(List<ResultDetail>, TicketCounts)>();
        var ticketCounts = new TicketCounts
        {
            BetRunningCount = 1,
            BetMarkedCount = 2,
            BetSettledCount = 3
        };

        var ticketCountsSecond = new TicketCounts
        {
            BetRunningCount = 1,
            BetMarkedCount = 1,
            BetSettledCount = 1
        };

        data.Add(([], ticketCounts));
        data.Add(([], ticketCountsSecond));

        var result = service.MergeTicketDetails(data);

        Assert.Equal(2, result.ticketCounts.BetRunningCount);
        Assert.Equal(3, result.ticketCounts.BetMarkedCount);
        Assert.Equal(4, result.ticketCounts.BetSettledCount);
    }
}