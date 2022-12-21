using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Services;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services
{
    public class NewInfoMatchServiceTests
    {
        private readonly SiteMatchService siteMatchService;

        private readonly IGoalIconService goalIconService;

        private readonly NewInfoMatchService service;

        public NewInfoMatchServiceTests()
        {
            siteMatchService = Substitute.For<SiteMatchService>();
            goalIconService = Substitute.For<IGoalIconService>();
            service = new NewInfoMatchServiceImp(siteMatchService, goalIconService);
        }

        [Theory]
        [InlineData(true, EventStatus.PostPoned, 0, Background.YellowBlinking)]
        [InlineData(false, EventStatus.PostPoned, 0, Background.Yellow)]
        [InlineData(true, EventStatus.Running, 0, Background.WhiteBlinking)]
        [InlineData(false, EventStatus.Running, 0, "")]
        [InlineData(true, EventStatus.ResultPending, 1, Background.BrightYellowBlinking)]
        [InlineData(false, EventStatus.ResultPending, 1, Background.BrightYellow)]
        public void EventStatusColor_PostPonedStatus_ReturnCorrectColor(bool existMarkedTickets, string eventStatus,
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

            var result = service.ConfirmScore(new List<ResultDetail> { resultDetail }, "01");

            Assert.Equal(expected, result);
        }

        [Fact]
        public void IsNotConsistentScore_SuspenderIsBlank_ReturnFalse()
        {
            var result = service.IsNotConsistentScore("-", new List<ResultDetail>(), new List<ResultDetail>(), "01");

            Assert.False(result);
        }

        [Theory]
        [InlineData("01", "01", "1", "2", "1", "2", false)]
        [InlineData("01", "01", "2", "2", "1", "2", true)]
        [InlineData("01", "01", "1", "1", "1", "2", true)]
        [InlineData("01", "02", "1", "2", "1", "2", true)]
        [InlineData("02", "01", "1", "2", "1", "2", false)]
        public void IsNotConsistentScore_SuspenderNotBlank_ReturnCorrect(string resourceOfSource, string resourceOfRD,
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
                ResourceId = resourceOfRD,
                HomeValue = home,
                AwayValue = away
            };

            var result = service.IsNotConsistentScore("Test", new List<ResultDetail> { resultDetail },
                new List<ResultDetail> { sourceResultDetail }, "01");

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

            siteMatchService.IsExistMarkedTicketsSingle(Arg.Any<Match>()).Returns(true);
            siteMatchService.IsExistRunningTickets(Arg.Any<Match>()).Returns(true);
            siteMatchService.IsExistMarkedTicketParlay(Arg.Any<Match>()).Returns(true);
            siteMatchService.IsExistRunningTicketParlay(Arg.Any<Match>()).Returns(true);
            siteMatchService.IsCalculating(Arg.Any<int?>(), Arg.Any<List<int?>>()).Returns(1);

            service.TicketInfo(match);

            Assert.True(match.IsExistMarkedTicket && match.IsExistRunningTicket && match.IsExistMarkedTicketParlay && match.IsExistRunningTicketParlay && match.IsCalculatingSingle == 1);
        }

        [Fact]
        public void IsExistsConfirmedEarly_Always_CallRelatedMethod()
        {
            service.IsExistsConfirmedEarly(new Match());

            siteMatchService.Received().IsExistsConfirmedEarly(Arg.Any<Match>());
        }
    }
}