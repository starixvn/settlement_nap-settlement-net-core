using Settlement.Core.Constants;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.OtherSports.UnitTests.Services
{
    public class MergeDataServiceTests
    {
        private readonly MergeDataService service = new MergeDataServiceImp();

        [Theory]
        [InlineData(0, 0, 0, 0, TicketStatus.NoTicket)]
        [InlineData(1, 1, 0, 0, TicketStatus.Running)]
        [InlineData(1, 0, 1, 0, TicketStatus.Marked)]
        [InlineData(2, 1, 0, 1, TicketStatus.Running)]
        [InlineData(2, 0, 1, 1, TicketStatus.Marked)]
        [InlineData(1, 0, 0, 1, TicketStatus.Waiting)]
        [InlineData(1, 0, 0, 0, TicketStatus.Calculated)]
        public void MergeMatchDetail_Always_ReturnCorrectly(int betCount, int betRunning, int betMarket, int betWaiting, string expected)
        {
            var ticketCounts = new List<TicketCounts>
            {
                new()
                {
                    BetCount = betCount,
                    BetMarkedCount = betMarket,
                    BetRunningCount = betRunning,
                    BetWaitingCount = betWaiting,
                    GroupId = 1
                }
            };

            var matchDetail = new MatchDetail();

            service.MergeMatchDetail(matchDetail, ticketCounts);

            Assert.Equal(expected, matchDetail.HtStatus);
            Assert.Equal(TicketStatus.NoTicket, matchDetail.FtStatus);
        }

        [Fact]
        public void MergeTicketCounts_Always_SumListTicket()
        {
            var ticketCounts = new List<TicketCounts>
            {
                new()
                {
                    BetRunningCount = 1,
                    BetMarkedCount = 2,
                    BetSettledCount = 3,
                    BetWaitingCount = 4,
                    BetCount = 10,
                    GroupId = 1
                },
                new()
                {
                    BetRunningCount = 1,
                    BetMarkedCount = 2,
                    BetSettledCount = 3,
                    BetWaitingCount = 4,
                    BetCount = 10,
                    GroupId = 2
                }
            };

            var ticketCountSite = new List<TicketCounts>
            {
                new()
                {
                    BetRunningCount = 1,
                    BetMarkedCount = 2,
                    BetSettledCount = 3,
                    BetWaitingCount = 4,
                    BetCount = 10,
                    GroupId = 1
                }
            };

            var listTicketCounts = new List<List<TicketCounts>> { ticketCounts, ticketCountSite };

            var result = service.MergeTicketCounts(listTicketCounts);

            Assert.True(result[0].BetRunningCount == 2 &&
                        result[0].BetMarkedCount == 4 &&
                        result[0].BetSettledCount == 6 &&
                        result[0].BetWaitingCount == 8 &&
                        result[0].BetCount == 20);
            Assert.True(result[1].BetRunningCount == 1 &&
                        result[1].BetMarkedCount == 2 &&
                        result[1].BetSettledCount == 3 &&
                        result[1].BetWaitingCount == 4 &&
                        result[1].BetCount == 10);
        }

        [Fact]
        public void GroupTicketCount_Always_SumTicket()
        {
            var ticketCounts = new List<TicketCounts>
            {
                new()
                {
                    BetRunningCount = 1,
                    BetMarkedCount = 2,
                    BetSettledCount = 3,
                    BetWaitingCount = 4,
                    BetCount = 10,
                    GroupId = 1
                },
                new()
                {
                    BetRunningCount = 1,
                    BetMarkedCount = 2,
                    BetSettledCount = 3,
                    BetWaitingCount = 4,
                    BetCount = 10,
                    GroupId = 2
                }
            };

            service.GroupTicketCount(ticketCounts);

            Assert.True(ticketCounts[0].BetRunningCount == 2 &&
                        ticketCounts[0].BetMarkedCount == 4 &&
                        ticketCounts[0].BetSettledCount == 6 &&
                        ticketCounts[0].BetWaitingCount == 8 &&
                        ticketCounts[0].BetCount == 20 &&
                        ticketCounts[0].GroupId == 0);
        }
    }
}