using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.MultiSports;
using System.Collections.Generic;
using Xunit;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services.MultiSports
{
    public class MatchServiceTests
    {
        private readonly IMatchResultDetailService matchResultDetailService;

        private readonly IRefDataService refDataService;

        private readonly IMatchService service;

        private readonly ScaleOutSettleService scaleOutSettleService;

        private readonly NewInfoMatchService newInfoMatchService;

        private readonly CompareMatchService compareMatchService;

        public MatchServiceTests()
        {
            matchResultDetailService = Substitute.For<IMatchResultDetailService>();
            refDataService = Substitute.For<IRefDataService>();
            scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
            newInfoMatchService = Substitute.For<NewInfoMatchService>();
            compareMatchService = Substitute.For<CompareMatchService>();

            service = new MatchServiceImp(refDataService, matchResultDetailService, compareMatchService, newInfoMatchService, scaleOutSettleService);
        }

        [Fact]
        public void GetScoreForMatchBySportType_IsTennis_InvokeTennisResultDetailMethodOnMatchResultDetailService()
        {
            // Act
            service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), SportType.Tennis);

            // Assert
            matchResultDetailService.Received().TennisResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        }

        [Fact]
        public void GetScoreForMatchBySportType_IsBasketBall_InvokeBasketballResultDetailMethodOnMatchResultDetailService()
        {
            // Act
            service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), SportType.BasketBall);

            // Assert
            matchResultDetailService.Received().BasketballResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        }

        [Fact]
        public void GetScoreForMatchBySportType_IsESports_InvokeESportsResultDetailMethodOnMatchResultDetailService()
        {
            // Act
            service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), SportType.ESports);

            // Assert
            matchResultDetailService.Received().ESportsResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        }

        [Fact]
        public void GetScoreForMatchBySportType_IsBadminton_InvokeBadmintonResultDetailMethodOnMatchResultDetailService()
        {
            // Act
            service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), SportType.Badminton);

            // Assert
            matchResultDetailService.Received().BadmintonResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        }

        [Fact]
        public void GetScoreForMatchBySportType_IsOtherSport_ReturnsDefaultMatchesData()
        {
            // Arrange
            var matches = new List<Match>
            {
                new Match { MatchId = 1 },
                new Match { MatchId = 2 }
            };

            // Act
            var newMatches = service.GetScoreForMatchBySportType(matches, new List<ResultDetail>(), 90);

            // Assert
            Assert.True(matches.Count == newMatches.Count);
        }

        [Fact]
        public void GetScoreForMatchBySportType_IsIceHockey_ReturnsDefaultMatchesData()
        {
            // Arrange
            var matches = new List<Match>
            {
                new Match { MatchId = 1 },
                new Match { MatchId = 2 }
            };
            matchResultDetailService.OtherSportsResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), false).Returns(matches);

            // Act
            var newMatches = service.GetScoreForMatchBySportType(matches, new List<ResultDetail>(), 4);

            // Assert
            Assert.True(matches.Count == newMatches.Count);
        }

        [Fact]
        public void GetScoreForMatchBySportType_IsFootball_ReturnsDefaultMatchesData()
        {
            // Arrange
            var matches = new List<Match>
            {
                new Match { MatchId = 1 },
                new Match { MatchId = 2 }
            };
            matchResultDetailService.OtherSportsResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), true).Returns(matches);

            // Act
            var newMatches = service.GetScoreForMatchBySportType(matches, new List<ResultDetail>(), 3);

            // Assert
            Assert.True(matches.Count == newMatches.Count);
        }

        [Fact]
        public void MergeMatches_Always_InfoSiteMatch()
        {
            var baseMatches = new List<Match>
            {
                new Match { MatchId = 123 }
            };

            var siteMatches = new List<Match>
            {
                new Match { MatchId = 123 },
                new Match {MatchId = 456}
            };

            compareMatchService.GetDifferentMatchSiteInfo(Arg.Any<Match>(), Arg.Any<List<Match>>())
                .Returns(new SiteMatch { IsCalculatingSingle = 1 });

            var listMatch = service.MergeMatches(baseMatches, siteMatches);

            Assert.Equal(2, listMatch.Count);
            Assert.Equal(1, listMatch[0].SiteMatch[0].IsCalculatingSingle);
        }

        [Fact]
        public void UpdateMatchInfo_Always_CallServiceSacleOut()
        {
            service.UpdateMatchInfo(new UpdateMatchInfoRequest());

            scaleOutSettleService.Received().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
        }
    }
}