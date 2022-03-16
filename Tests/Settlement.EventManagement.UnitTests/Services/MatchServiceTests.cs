using Settlement.EventManagement.Services;
using System.Collections.Generic;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Services;
using Xunit;
using Settlement.Core.Models;
using Match = Settlement.EventManagement.Models.Match;

namespace Settlement.EventManagement.UnitTests.Services
{
    public class MatchServiceTests
    {
        private readonly IMatchResultDetailService matchResultDetailService;

        private readonly IRefDataService refDataService;

        private readonly IMatchService service;

        public MatchServiceTests()
        {
            matchResultDetailService = Substitute.For<IMatchResultDetailService>();
            refDataService = Substitute.For<IRefDataService>();
            service = new MatchServiceImp(refDataService, matchResultDetailService);
        }

        [Fact]
        public void GetScoreForMatchBySportType_IsTennis_InvokeTennisResultDetailMethodOnMatchResultDetailService()
        {
            // Act
            service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), SportType.Tennis, 4);

            // Assert
            matchResultDetailService.Received().TennisResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        }

        [Fact]
        public void GetScoreForMatchBySportType_IsBasketBall_InvokeBasketballResultDetailMethodOnMatchResultDetailService()
        {
            // Act
            service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), SportType.BasketBall, 12);

            // Assert
            matchResultDetailService.Received().BasketballResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        }

        [Fact]
        public void GetScoreForMatchBySportType_IsESports_InvokeESportsResultDetailMethodOnMatchResultDetailService()
        {
            // Act
            service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), SportType.ESports, 9);

            // Assert
            matchResultDetailService.Received().ESportsResultDetail(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<Permission>());
        }

        [Fact]
        public void GetScoreForMatchBySportType_IsBadminton_InvokeBadmintonResultDetailMethodOnMatchResultDetailService()
        {
            // Act
            service.GetScoreForMatchBySportType(new List<Match>(), new List<ResultDetail>(), SportType.Badminton, 10);

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
            var newMatches = service.GetScoreForMatchBySportType(matches, new List<ResultDetail>(), 90, 11);

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
            var newMatches = service.GetScoreForMatchBySportType(matches, new List<ResultDetail>(), 4, 11);

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
            var newMatches = service.GetScoreForMatchBySportType(matches, new List<ResultDetail>(), 3, 11);

            // Assert
            Assert.True(matches.Count == newMatches.Count);
        }
    }
}