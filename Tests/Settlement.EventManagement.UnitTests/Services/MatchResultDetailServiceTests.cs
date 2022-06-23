using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.SpecificService.Tennis;
using Xunit;
using Match = Settlement.EventManagement.Models.Match;

namespace Settlement.EventManagement.UnitTests.Services
{
    public class MatchResultDetailServiceTests
    {
        private readonly ITennisService tennisService;

        private readonly IRefDataService refDataService;

        private readonly IExternalScoreService externalScoreService;

        private readonly EventManagement.Services.IScoreService scoreService;

        private readonly IMatchResultDetailService service;

        public MatchResultDetailServiceTests()
        {
            tennisService = Substitute.For<ITennisService>();
            refDataService = Substitute.For<IRefDataService>();
            externalScoreService = Substitute.For<IExternalScoreService>();
            scoreService = Substitute.For<EventManagement.Services.IScoreService>();
            service = new MatchResultDetailServiceImp(tennisService, refDataService, externalScoreService,
                scoreService);
        }

        private static MoreScores FakedScore => new MoreScores
        {
            HalfTimeScore = new Score("1", "2"),
            FinalScore = new Score("3", "4")
        };

        private static List<Match> Matches => new List<Match> {
            new Match { MatchId = 1 }
        };

        private List<Match> ExpectedMatches => new List<Match>
        {
            new Match { MatchId = 1, MoreScores = FakedScore, RefDataService = refDataService }
        };

        private static List<ResultDetail> ResultDetail => new List<ResultDetail>();

        private readonly Permission permission = new Permission();

        [Fact]
        public void TennisResultDetail_EmptyMatch_ReturnsEmpty()
        {
            // Act
            var actual = service.TennisResultDetail(new List<Match>(), ResultDetail, permission);

            // Assert
            Assert.Empty(actual);
        }

        [Fact]
        public void TennisResultDetail_HasMatches_ReturnsCorrectTennisScoreFromTennisService()
        {
            // Arrange
            var matches = Matches;

            tennisService.ScoreLoader(matches[0], Arg.Any<List<ResultDetail>>(), permission).Returns(FakedScore);

            // Act
            var actualMatches = service.TennisResultDetail(matches, ResultDetail, permission);

            // Assert
            AssertExtension.AreEqual(ExpectedMatches, actualMatches);
        }

        [Fact]
        public void BasketballResultDetail_EmptyMatch_ReturnsEmpty()
        {
            // Act
            var actual = service.BasketballResultDetail(new List<Match>(), ResultDetail, permission);

            // Assert
            Assert.Empty(actual);
        }

        [Fact]
        public void ESportsResultDetail_EmptyMatch_ReturnsEmpty()
        {
            // Act
            var actual = service.ESportsResultDetail(new List<Match>(), ResultDetail, permission);

            // Assert
            Assert.Empty(actual);
        }

        [Fact]
        public void CricketResultDetail_Match_ReturnsListItem()
        {
            // Arrange
            var matches = new List<Match>
            {
                new Match()
                {
                    MatchId = 1
                },
                new Match()
                {
                    MatchId = 2
                }
            };

            var resultDetail = new List<ResultDetail>
            {
                new ResultDetail()
                {
                    MatchId = 1,
                    SourceId = 0,
                    ResourceId = "00"
                }
            };

            // Act
            var actual = service.CricketResultDetail(matches, resultDetail, permission);

            // Assert
            Assert.True(actual.Count > 0);
        }

        [Fact]
        public void BeachVolleyballResultDetail_Always_ReturnsListItem()
        {
            // Arrange
            var matches = new List<Match>
            {
                new Match()
                {
                    MatchId = 1
                },
                new Match()
                {
                    MatchId = 2
                }
            };

            var resultDetail = new List<ResultDetail>
            {
                new ResultDetail()
                {
                    MatchId = 1,
                    SourceId = 0,
                    ResourceId = "00"
                }
            };

            // Act
            var actual = service.BeachVolleyballResultDetail(matches, resultDetail, permission);

            // Assert
            Assert.True(actual.Count > 0);
        }

        [Fact]
        public void BeachVolleyballResultDetail_EmptyMatch_ReturnsEmpty()
        {
            // Act
            var actual = service.BeachVolleyballResultDetail(new List<Match>(), ResultDetail, permission);

            // Assert
            Assert.Empty(actual);
        }

        [Fact]
        public void CricketResultDetail_EmptyMatch_ReturnsEmpty()
        {
            // Act
            var actual = service.CricketResultDetail(new List<Match>(), ResultDetail, permission);

            // Assert
            Assert.Empty(actual);
        }

        [Fact]
        public void BadmintonResultDetail_EmptyMatch_ReturnsEmpty()
        {
            // Act
            var actual = service.BadmintonResultDetail(new List<Match>(), ResultDetail, permission);

            // Assert
            Assert.Empty(actual);
        }

        [Fact]
        public void BadmintonResultDetail_HasMatches_ReturnsExpectedMatch()
        {
            // Arrange
            scoreService.ScoreLoader(Arg.Any<int>(), Arg.Any<List<ResultDetail>>(), Arg.Any<List<string>>(), Arg.Any<Permission>()).Returns(FakedScore);

            // Act
            var actualMatches = service.BadmintonResultDetail(Matches, ResultDetail, permission);

            // Assert
            AssertExtension.AreEqual(ExpectedMatches, actualMatches);
        }

        [Fact]
        public void OtherSportsResultDetail_EmptyMatch_ReturnsEmpty()
        {
            // Act
            var actual = service.OtherSportsResultDetail(new List<Match>(), ResultDetail, false);

            // Assert
            Assert.Empty(actual);
        }

        [Fact]
        public void ESportsResultDetail_HasMatches_ReturnsExpectedMatch()
        {
            // Arrange
            scoreService.ScoreLoader(Arg.Any<int>(), Arg.Any<List<ResultDetail>>(), Arg.Any<List<string>>(), Arg.Any<Permission>()).Returns(FakedScore);

            // Act
            var actualMatches = service.ESportsResultDetail(Matches, ResultDetail, permission);

            // Assert
            AssertExtension.AreEqual(ExpectedMatches, actualMatches);
        }

        [Fact]
        public void ESportsResultDetail_HasMatchBOM30_CallServiceWithCorrectParam()
        {
            // Arrange
            Matches[0].SportType = SportType.ESports;
            Matches[0].BestOfMap = 11;
            var match = new Match
            {
                SportType = SportType.ESports,
                BestOfMap = 11,
                MatchId = 1
            };
            var resources = new List<string> { "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11" };
            // Act
            service.ESportsResultDetail(new List<Match> { match }, ResultDetail, permission);

            // Assert
            scoreService.Received().ScoreLoader(SportType.ESports, Arg.Any<List<ResultDetail>>(), Arg.Is<List<string>>(x => Enumerable.SequenceEqual(x, resources)), permission);
        }

        [Fact]
        public void BasketballResultDetail_HasMatches_ReturnsExpectedMatches()
        {
            //Arrange
            scoreService.ScoreLoader(Arg.Any<int>(), Arg.Any<List<ResultDetail>>(), Arg.Any<List<string>>(), Arg.Any<Permission>()).Returns(FakedScore);
            Matches[0].SportType = SportType.BasketBall;
            var resultDetail = new List<ResultDetail>
            {
                new ResultDetail()
                {
                    MatchId = 1,
                    SourceId = 0,
                    ResourceId = "00"
                }
            };

            //Act
            var actualMatches = service.BasketballResultDetail(Matches, resultDetail, permission);

            //Assert
            AssertExtension.AreEqual(ExpectedMatches, actualMatches);
        }
    }
}