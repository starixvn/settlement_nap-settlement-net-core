using System.Collections.Generic;
using System.Linq;
using System.Security.Policy;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.GetMatch.Services;
using Xunit;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.GetMatch
{
    public class MergeDataServiceTests
    {
        private readonly IMergeDataService service;

        public MergeDataServiceTests()
        {
            service = new MergeDataServiceImp();
        }

        [Theory]
        [InlineData(true, false)]
        [InlineData(false, true)]
        public void MergeSiteMatch_AfterCompareMatch_ReturnCorrectMatchDetail(bool central, bool site)
        {
            //Arrange
            var siteMatch = new SiteMatch
            {
                IsExistResultAndFirstTeamScore = site,
                IsExistFgNg = site,
                IsExistHtFgLg = site,
                IsExistFgLg = site,
                IsEnabledGoalRecordFt = site,
                IsEnabledGoalRecordHt = site,
                IsLive = site
            };

            var centralMatch = new SiteMatch
            {
                IsExistResultAndFirstTeamScore = central,
                IsExistFgNg = central,
                IsExistHtFgLg = central,
                IsExistFgLg = central,
                IsEnabledGoalRecordFt = central,
                IsEnabledGoalRecordHt = central,
                IsLive = central,
            };
            var mainMatch = new MatchDetail { SiteMatch = new List<SiteMatch> { siteMatch, centralMatch } };
            var ticketCounts = new List<TicketCounts>
            {
                new TicketCounts { GroupId = 1 },
                new TicketCounts { GroupId = 2 }
            };

            // act
            var matchDetail = service.MergeSiteMatch(mainMatch, ticketCounts);

            // assert
            Assert.True(matchDetail.IsExistResultAndFirstTeamScore);
            Assert.True(matchDetail.IsExistFgNg);
            Assert.True(matchDetail.IsExistHtFgLg);
            Assert.True(matchDetail.IsExistFgLg);
            Assert.True(matchDetail.IsEnabledGoalRecordFt);
            Assert.True(matchDetail.IsEnabledGoalRecordHt);
            Assert.True(matchDetail.IsLive);
        }

        [Theory]
        [InlineData(0, 0, 0, 0, "No Ticket")]
        [InlineData(1, 1, 0, 0, "Running")]
        [InlineData(1, 0, 1, 0, "Marked")]
        [InlineData(1, 0, 0, 1, "Waiting")]
        [InlineData(1, 0, 0, 0, "Calculated")]
        public void MergeSiteMatch_Always_GenerateStatus(int betCount, int betRunningCount, int betMarkedCount, int betWaitingCount, string status)
        {
            //Arrange
            var mainMatch = new MatchDetail { SiteMatch = new List<SiteMatch>() };
            var ticketCountHt = new TicketCounts
            {
                GroupId = 1,
                BetCount = betCount,
                BetRunningCount = betRunningCount,
                BetMarkedCount = betMarkedCount,
                BetWaitingCount = betWaitingCount
            };

            var ticketCountFt = new TicketCounts
            {
                GroupId = 2,
                BetCount = betCount,
                BetRunningCount = betRunningCount,
                BetMarkedCount = betMarkedCount,
                BetWaitingCount = betWaitingCount
            };

            //act
            var matchDetail =
                service.MergeSiteMatch(mainMatch, new List<TicketCounts> { ticketCountFt, ticketCountHt });

            //assert

            Assert.Equal(status, matchDetail.HtStatus);
            Assert.Equal(status, matchDetail.FtStatus);
        }

        [Fact]
        public void MergeDataChildMatches_Always_ReturnListChildMatch()
        {
            var listChildMatch = new List<ChildMatchModel>
            {
                new ChildMatchModel { MatchId = 123 },
                new ChildMatchModel
                {
                    MatchId = 345,
                    IsExistRunningTicket = false,
                    IsExistMarkedTicket = true,
                }
            };

            var siteMatches = new List<SiteMatch>
            {
                new SiteMatch
                {
                    SiteChildMatches =  new List<ChildMatchTicketInfos> {
                        new ChildMatchTicketInfos
                        {
                            MatchId = 123, IsExistMarkedTicket = true, IsExistRunningTicket = false
                        }
                    }
                },

                new SiteMatch
                {
                    SiteChildMatches = new List<ChildMatchTicketInfos> {
                        new ChildMatchTicketInfos
                        {
                            MatchId = 123, IsExistMarkedTicket = false, IsExistRunningTicket = true
                        }
                        }
                }
            };

            //act
            var actualList = service.MergeDataChildMatches(listChildMatch, siteMatches);

            //assert
            Assert.True(listChildMatch[0].IsExistRunningTicket);
            Assert.True(listChildMatch[0].IsExistMarkedTicket);
            Assert.True(listChildMatch[1].IsExistMarkedTicket);
            Assert.False(listChildMatch[1].IsExistRunningTicket);
        }

        [Theory]
        [InlineData(true, true)]
        [InlineData(false, false)]
        public void MergeBetDaq_Always_MergeCorrectly(bool value, bool expect)
        {
            //arrange
            var listSiteBetDaq = new List<BetDaq>
            {
                new BetDaq { IsMoveBetDaq = value},
                new BetDaq { IsRefundRunningBetDaq = value},
                new BetDaq { IsSettleAbandonedMatchBetDaq = value}
            };

            var betDaq = new BetDaq { IsExcludeBetDaq = value };

            //act
            var actualResult = service.MergeBetDaq(betDaq, listSiteBetDaq);

            //assert
            Assert.Equal(expect, actualResult.IsMoveBetDaq);
            Assert.Equal(expect, actualResult.IsExcludeBetDaq);
            Assert.Equal(expect, actualResult.IsRefundRunningBetDaq);
            Assert.Equal(expect, actualResult.IsSettleAbandonedMatchBetDaq);
        }

        [Theory]
        [InlineData(true, true)]
        [InlineData(false, false)]
        public void MergeBetFair_Always_MergeCorrectly(bool value, bool expect)
        {
            //arrange
            var listSiteBetFair = new List<BetFair>
            {
                new BetFair { IsMoveBetFair = value},
                new BetFair { IsRefundRunningBetFair = value},
                new BetFair { IsSettleAbandonedMatchBetFair = value}
            };

            var betFair = new BetFair { IsExcludeBetFair = value };

            //act
            var actualResult = service.MergeBetFair(betFair, listSiteBetFair);

            //assert
            Assert.Equal(expect, actualResult.IsMoveBetFair);
            Assert.Equal(expect, actualResult.IsExcludeBetFair);
            Assert.Equal(expect, actualResult.IsRefundRunningBetFair);
            Assert.Equal(expect, actualResult.IsSettleAbandonedMatchBetFair);
        }

        [Fact]
        public void MergeTicketCounts_Always_SumAllTicket()
        {
            //arrange
            var listOne = new List<TicketCounts>
            {
                new TicketCounts
                {
                    GroupId = 1, BetCount = 1, BetMarkedCount = 2, BetSettledCount = 3, BetWaitingCount = 4,
                    BetRunningCount = 5
                },
            };

            var listTwo = new List<TicketCounts>
            {
                new TicketCounts
                {
                    GroupId = 1, BetCount = 1, BetMarkedCount = 2, BetSettledCount = 3, BetWaitingCount = 4,
                    BetRunningCount = 5
                },
            };
            var listThree = new List<TicketCounts>
            {
                new TicketCounts
                {
                    GroupId = 2, BetCount = 1, BetMarkedCount = 2, BetSettledCount = 3, BetWaitingCount = 4,
                    BetRunningCount = 5
                },
            };
            var listSiteMatch = new List<SiteMatch>
            {
                new SiteMatch
                {
                    TicketCounts = listOne
                },
                new SiteMatch
                {
                    TicketCounts = listTwo
                },
                new SiteMatch
                {
                    TicketCounts = listThree
                }
            };

            //act
            var list = service.MergeTicketCounts(listSiteMatch);
            var actual = list.First();

            //assert
            Assert.Single(list);
            Assert.Equal(2, actual.BetCount);
            Assert.Equal(4, actual.BetMarkedCount);
            Assert.Equal(6, actual.BetSettledCount);
            Assert.Equal(8, actual.BetWaitingCount);
            Assert.Equal(10, actual.BetRunningCount);
        }

        [Fact]
        public void MergeEarlyTicketDetails_Always_SumAllTicket()
        {
            //arrange
            var ticketCountsOne = new TicketCounts
            {
                GroupId = 1,
                BetCount = 1,
                BetMarkedCount = 2,
                BetSettledCount = 3,
                BetWaitingCount = 4,
                BetRunningCount = 5
            };

            var ticketCountsTwo = new TicketCounts
            {
                GroupId = 1,
                BetCount = 1,
                BetMarkedCount = 2,
                BetSettledCount = 3,
                BetWaitingCount = 4,
                BetRunningCount = 5
            };
            var listSiteMatch = new List<(List<ResultDetailModel>, TicketCounts)>
            {
                (new List<ResultDetailModel>(), ticketCountsOne),
                (new List<ResultDetailModel>(), ticketCountsTwo)
            };

            //act
            var result = service.MergeEarlyTicketDetails(listSiteMatch);
            var actual = result.ticketCounts;

            //assert
            Assert.Equal(2, actual.BetCount);
            Assert.Equal(4, actual.BetMarkedCount);
            Assert.Equal(6, actual.BetSettledCount);
            Assert.Equal(8, actual.BetWaitingCount);
            Assert.Equal(10, actual.BetRunningCount);
        }

        [Fact]
        public void MergeEarlyTicketDetails_Always_SumTicketDetail()
        {
            //arrange
            var ticketDetailOne = new ResultDetailModel
            {
                ResourceId = "01",
                BetCount = 1,
                BetMarkedCount = 2,
                InRunning = 3,
                InWaiting = 4,
            };

            var ticketDetailTwo = new ResultDetailModel
            {
                ResourceId = "02",
                BetCount = 1,
                BetMarkedCount = 2,
                InRunning = 3,
                InWaiting = 4,
            };

            var ticketDetailThree = new ResultDetailModel
            {
                ResourceId = "01",
                BetCount = 1,
                BetMarkedCount = 2,
                InRunning = 3,
                InWaiting = 4,
            };
            var listSiteMatch = new List<(List<ResultDetailModel>, TicketCounts)>
            {
                (new List<ResultDetailModel> {ticketDetailOne, ticketDetailTwo}, new TicketCounts()),
                (new List<ResultDetailModel> {ticketDetailThree}, new TicketCounts())
            };

            //act
            var result = service.MergeEarlyTicketDetails(listSiteMatch);
            var ticketDetailFirst = result.ticketDetails[0];
            var ticketDetailSecond = result.ticketDetails[1];

            //assert
            Assert.Equal(2, result.ticketDetails.Count);
            Assert.Equal(2, ticketDetailFirst.BetCount);
            Assert.Equal(4, ticketDetailFirst.BetMarkedCount);
            Assert.Equal(6, ticketDetailFirst.InRunning);
            Assert.Equal(8, ticketDetailFirst.InWaiting);
            Assert.Equal(1, ticketDetailSecond.BetCount);
            Assert.Equal(2, ticketDetailSecond.BetMarkedCount);
            Assert.Equal(3, ticketDetailSecond.InRunning);
            Assert.Equal(4, ticketDetailSecond.InWaiting);
        }
    }
}