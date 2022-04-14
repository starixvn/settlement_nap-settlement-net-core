using NSubstitute;
using NUnit.Framework;
using Settlement.Log.Controllers;
using Settlement.Log.Models;
using Settlement.Log.Requests;
using Settlement.Log.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http.Results;

namespace Settlement.Log.UnitTests.Controllers
{
    internal class LogApiControllerTests
    {
        private LogApiController controller;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            var logs = new List<LogModel> {
                new LogModel { MatchId = 1 }
            };

            var logService = Substitute.For<LogService>();
            logService.GetLog(Arg.Any<LogRequest>()).Returns(logs);
            controller = Helper.GetController<LogApiController>(logService);
        }

        [Test]
        public void Filter_Always_ReturnLogRequest()
        {
            // Act
            var result = controller.Filter() as OkNegotiatedContentResult<LogRequest>;

            // Assert
            Assert.IsInstanceOf(typeof(LogRequest), result.Content);
        }

        [Test]
        public async Task GetLog_Always_ReturnsLogs()
        {
            // Act
            var result = await controller.GetLog(new LogRequest()) as OkNegotiatedContentResult<List<LogModel>>;

            // Assert
            Assert.GreaterOrEqual(result.Content.Count, 1);
        }
    }
}