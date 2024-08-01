using NSubstitute;
using NUnit.Framework;
using Settlement.CalculationSetting.Controllers;
using Settlement.CalculationSetting.Models;
using Settlement.CalculationSetting.Requests;
using Settlement.CalculationSetting.Services;
using Settlement.Models;
using System.Threading.Tasks;
using System.Web.Http.Results;

namespace Settlement.CalculationSetting.UnitTests.Controllers
{
    internal class CalculationSettingApiControllerTests
    {
        private CalculationSettingApiController controller;

        private SettingService settingService;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            settingService = Substitute.For<SettingService>();
            controller = Helper.GetController<CalculationSettingApiController>(null, null, settingService);
        }

        [Test]
        public async Task UpdateSettingLeague_Always_ReturnsResult()
        {
            settingService.UpdateSettingLeague(Arg.Any<SettingLeagueRequest>()).Returns(new Result());

            // Act
            var result = await controller.UpdateSettingLeague(new SettingLeagueRequest()) as OkNegotiatedContentResult<Result>;

            // Assert
            Assert.IsInstanceOf(typeof(Result), result.Content);
        }

        [Test]
        public async Task UpdateSettingMatch_Always_ReturnsResult()
        {
            settingService.UpdateSettingMatch(Arg.Any<SettingMatchRequest>()).Returns(new Result());

            // Act
            var result = await controller.UpdateSettingMatch(new SettingMatchRequest()) as OkNegotiatedContentResult<Result>;

            // Assert
            Assert.IsInstanceOf(typeof(Result), result.Content);
        }

        [Test]
        public async Task MarkPending_Always_ReturnsEventStatusIsResultPending()
        {
            // Arrange
            var request = new UpdateRemarkRequest
            {
                MatchId = 123,
                IsEnabled = true,
                Type = 1
            };
            var match = new RemarkQueryModel
            {
                EventStatus = "Result Pending"
            };
            settingService.GetRemarkInfo(Arg.Any<int>()).Returns(match);

            // Act
            var result = await controller.MarkPending(request) as OkNegotiatedContentResult<MatchAndPermission>;

            // Assert
            var expected = "Result Pending";
            Assert.AreEqual(expected, result.Content.Match.EventStatus);
        }

        [Test]
        public async Task MarkUndecided_Always_ReturnsEventStatusIsRunning()
        {
            // Arrange
            var request = new UpdateRemarkRequest
            {
                MatchId = 123,
                IsEnabled = true,
                Type = 1
            };
            var match = new RemarkQueryModel
            {
                EventStatus = "running"
            };
            settingService.GetRemarkInfo(Arg.Any<int>()).Returns(match);

            // Act
            var result = await controller.MarkUndecided(request) as OkNegotiatedContentResult<MatchAndPermission>;

            // Assert
            var expected = "running";
            Assert.AreEqual(expected, result.Content.Match.EventStatus);
        }

        [Test]
        public async Task GetRemarkInfo_Always_ReturnsCorrectResult()
        {
            var getRemarkInfoRequest = new GetRemarkInfoRequest();
            var match = new RemarkQueryModel
            {
                EventStatus = "running"
            };
            settingService.GetRemarkInfo(Arg.Any<int>()).Returns(match);

            var result = await controller.GetRemarkInfo(getRemarkInfoRequest) as OkNegotiatedContentResult<MatchAndPermission>;

            var expected = "running";
            Assert.AreEqual(expected, result.Content.Match.EventStatus);
        }
    }
}