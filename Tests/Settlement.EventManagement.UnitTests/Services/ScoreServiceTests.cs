using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.EventManagement.Services;
using Xunit;

namespace Settlement.EventManagement.UnitTests.Services
{
    public class ScoreServiceTests
    {
        private readonly IScoreService service;

        private readonly IScoreSetService scoreSetService;

        public ScoreServiceTests()
        {
            scoreSetService = Substitute.For<IScoreSetService>();
            service = new ScoreServiceImp(scoreSetService);
        }

        private static List<ResultDetail> EmptyResultDetail => new List<ResultDetail>();
        private static List<string> Resources => new List<string> { "00", "01" };
        private readonly Permission permission = new Permission();

        [Fact]
        public void ScoreOfSets_EmptyResultDetail_ReturnsHyphenOnAllQuarter()
        {
            // Arrange
            var expectedQuarter = new Score[2].Select(n => new Score("-")).ToArray();

            // Act
            var actualQuarter = service.ScoreOfSets(EmptyResultDetail, Resources, permission);

            // Assert
            AssertExtension.AreEqual(expectedQuarter, actualQuarter);
        }

        [Fact]
        public void ScoreOfSets_HasResultDetail_ReturnsCorrectScoreGetFromScoreSetService()
        {
            // Arrange
            var resultDetail = new List<ResultDetail>
            {
                new ResultDetail { MatchId = 1 , ResourceId = "00" },
                new ResultDetail { MatchId = 1 , ResourceId = "01" }
            };

            var fakeQuarterScore = new Score("1", "2");
            var expectedQuarter = new Score[2].Select(n => new Score("1", "2")).ToArray();

            scoreSetService.GetScore(Arg.Any<ResultDetail>(), Arg.Any<Permission>()).Returns(fakeQuarterScore);

            // Act
            var actualQuarter = service.ScoreOfSets(resultDetail, Resources, permission);

            // Assert
            AssertExtension.AreEqual(expectedQuarter, actualQuarter);
        }

        [Fact]
        public void HalftimeScore_BeachVolleyballAndMatchIsRefund_ReturnsExpectedScore()
        {
            // Arrange
            var resultDetail = new List<ResultDetail>
            {
                new ResultDetail
                {
                    ResourceId = "00",
                    SettlementStatusId = 1
                }
            };

            // Act
            var actualScore = service.HalftimeScore(SportType.BeachVolleyball, resultDetail, permission);

            // Assert
            var expectedScore = new Score(SetStatus.Refund);
            AssertExtension.AreEqual(expectedScore, actualScore);
        }

        [Fact]
        public void HalftimeScore_BeachVolleyballExistScoreAndMatchIsNotRefund_ReturnsExpectedScore()
        {
            // Arrange
            var resultDetail = new List<ResultDetail>
            {
                new ResultDetail
                {
                    ResourceId = "0001",
                    HomeValue = "1",
                    AwayValue = "2",
                    SettlementStatusId = 0
                },
                new ResultDetail
                {
                    ResourceId = "0002",
                    HomeValue = "3",
                    AwayValue = "4",
                    SettlementStatusId = 0
                }
            };

            // Act
            var actualScore = service.HalftimeScore(SportType.BeachVolleyball, resultDetail, permission);

            // Assert
            var expectedScore = new Score("4", "6");
            AssertExtension.AreEqual(expectedScore, actualScore);
        }

        [Fact]
        public void HalftimeScore_BeachVolleyballEmptyScoreAndMatchIsNotRefund_ReturnsExpectedScore()
        {
            // Arrange
            var resultDetail = new List<ResultDetail>
            {
                new ResultDetail
                {
                    ResourceId = "0001",
                    HomeValue = "",
                    AwayValue = "",
                    SettlementStatusId = 0
                },
                new ResultDetail
                {
                    ResourceId = "0002",
                    HomeValue = "",
                    AwayValue = "",
                    SettlementStatusId = 0
                }
            };

            // Act
            var actualScore = service.HalftimeScore(SportType.BeachVolleyball, resultDetail, permission);

            // Assert
            var expectedScore = new Score("-");
            AssertExtension.AreEqual(expectedScore, actualScore);
        }

        [Fact]
        public void HalftimeScore_NotResourceHalftimeOnResultDetail_ReturnsHyphenOnScore()
        {
            // Arrange
            var expectedScore = new Score("-", "-");

            // Act
            var actualScore = service.HalftimeScore(1, EmptyResultDetail, permission);

            // Assert
            AssertExtension.AreEqual(expectedScore, actualScore);
        }

        [Fact]
        public void HalftimeScore_HasResourceHalftimeOnResultDetail_ReturnsCorrectScoreGetFromScoreSetService()
        {
            // Arrange
            var fakeHalftimeScore = new Score("1", "2");
            var expectedScore = new Score("1", "2");
            var resultDetail = new List<ResultDetail>
            {
                new ResultDetail { MatchId = 1 , ResourceId = "01" }
            };

            scoreSetService.GetScore(Arg.Any<ResultDetail>(), Arg.Any<Permission>()).Returns(fakeHalftimeScore);

            // Act
            var actualScore = service.HalftimeScore(1, resultDetail, permission);

            // Assert
            AssertExtension.AreEqual(expectedScore, actualScore);
        }

        [Fact]
        public void FinalScore_NotResourceFinalTimeOnResultDetail_ReturnsHyphenOnScore()
        {
            // Arrange
            var expectedScore = new Score("-");

            // Act
            var actualScore = service.FinalScore(EmptyResultDetail, permission);

            // Assert
            AssertExtension.AreEqual(expectedScore, actualScore);
        }

        [Fact]
        public void FinalScore_HasFinalTimeScoreOnResultDetail_ReturnsCorrectScoreGetFromScoreSetService()
        {
            // Arrange
            var fakeFinalTimeScore = new Score("5", "7");
            var expectedScore = new Score("5", "7");

            var resultDetail = new List<ResultDetail>
            {
                new ResultDetail { MatchId = 1 , ResourceId = "00" }
            };

            scoreSetService.GetScore(Arg.Any<ResultDetail>(), Arg.Any<Permission>()).Returns(fakeFinalTimeScore);

            // Act
            var actualScore = service.FinalScore(resultDetail, permission);

            // Assert
            AssertExtension.AreEqual(expectedScore, actualScore);
        }

        [Fact]
        public void ScoreLoader_ReturnsCorrectScore()
        {
            // Arrange
            var scoreSetServiceTemp = new ScoreSetServiceImp();
            var scoreService = new ScoreServiceImp(scoreSetServiceTemp);
            var fakeResources = new List<string> { "Q1", "Q2" };
            permission.IsLeader = true;
            var resultDetail = new List<ResultDetail>
            {
                new ResultDetail { MatchId = 1 , ResourceId = "00", HomeValue = "5", AwayValue = "7", SettlementStatusId = SettlementStatus.Running },
                new ResultDetail { MatchId = 1 , ResourceId = "01", HomeValue = "0", AwayValue = "2"  , SettlementStatusId = SettlementStatus.Running },
                new ResultDetail { MatchId = 1 , ResourceId = "Q1", HomeValue = "3", AwayValue = "4" , SettlementStatusId = SettlementStatus.Running },
                new ResultDetail { MatchId = 1 , ResourceId = "Q2", HomeValue = "3", AwayValue = "4" , SettlementStatusId = SettlementStatus.Running },
            };
            var expectedScore = ScoreList();
            expectedScore.FinalScore.IsNotSettled = true;
            expectedScore.HalfTimeScore.IsNotSettled = true;
            expectedScore.Sets[0].IsNotSettled = true;
            expectedScore.Sets[1].IsNotSettled = true;

            // Act
            var actualScore = scoreService.ScoreLoader(SportType.Soccer, resultDetail, fakeResources, permission);

            // Assert
            AssertExtension.AreEqual(expectedScore, actualScore);
        }

        internal MoreScores ScoreList()
        {
            var halfTimeScore = new Score("0", "2");
            halfTimeScore.IsNotSettled = true;
            var finalScore = new Score("5", "7");
            finalScore.IsNotSettled = true;
            var sets = new Score[2].Select(n => new Score("3", "4")).ToArray();
            foreach (var set in sets)
            {
                set.IsNotSettled = true;
            }

            return new MoreScores
            {
                FinalScore = finalScore,
                HalfTimeScore = halfTimeScore,
                Sets = sets
            };
        }
    }
}