using Settlement.Core.Models;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.FastMarkets.UnitTests.Services;

public class MergeDataServiceTests
{
    private readonly MergeDataService service;

    public MergeDataServiceTests()
    {
        service = new MergeDataServiceImp();
    }

    [Fact]
    public void MergeFastMarketTicketDetail_Always_SumValueTicketDetail()
    {
        var fmResult = new List<FastMarketResult>
        {
            new ()
            {
                BetType = 1,
                Position = 1,
                TicketRunning = 1,
                TicketMarked = 2,
                TicketCount = 3
            }
        };
        var fmResultSecond = new List<FastMarketResult>
        {
            new ()
            {
                BetType = 1,
                Position = 1,
                TicketRunning = 1,
                TicketMarked = 2,
                TicketCount = 3
            }
        };

        var data = new List<(List<FastMarketResult>, TicketCounts)>
        {
            (fmResult, new TicketCounts()),
            (fmResultSecond, new TicketCounts()),
        };

        var result = service.MergeFastMarketTicketDetail(data);

        Assert.True(result.Item1[0].TicketMarked == 4 && result.Item1[0].TicketRunning == 2 && result.Item1[0].TicketCount == 6);
    }

    [Fact]
    public void MergeFastMarketTicketDetail_Always_SumValueTicketCount()
    {
        var ticketCount = new TicketCounts
        {
            BetRunningCount = 1,
            BetMarkedCount = 2,
            BetSettledCount = 3,
            BetWaitingCount = 4,
            BetCount = 10
        };
        var ticketCountSecond = new TicketCounts
        {
            BetRunningCount = 1,
            BetMarkedCount = 2,
            BetSettledCount = 3,
            BetWaitingCount = 4,
            BetCount = 10
        };

        var data = new List<(List<FastMarketResult>, TicketCounts)>
        {
            (new List<FastMarketResult>(), ticketCount),
            (new List<FastMarketResult>(), ticketCountSecond),
        };

        var result = service.MergeFastMarketTicketDetail(data);

        Assert.True(result.Item2.BetRunningCount == 2
                    && result.Item2.BetMarkedCount == 4
                    && result.Item2.BetSettledCount == 6
                    && result.Item2.BetWaitingCount == 8
                    && result.Item2.BetCount == 20);
    }
}