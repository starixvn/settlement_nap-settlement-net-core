using NSubstitute;
using NUnit.Framework;
using Settlement.CalculationSetting.Controllers;
using Settlement.CalculationSetting.Models;
using Settlement.CalculationSetting.Requests;
using Settlement.CalculationSetting.Services;
using Settlement.Core.Models;
using System.Threading.Tasks;

namespace Settlement.CalculationSetting.UnitTests.Controllers
{
    [TestFixture]
    public class InstantControllerTests
    {
        private InstantController controller;

        [SetUp]
        public void SetUp()
        {
            var instantService = Substitute.For<InstantService>();
            instantService.CalculateCheckingInfo(Arg.Any<MatchCheckingRequest>()).Returns(new MatchGoalRecordModel());
            instantService.UndoCheckingInfo(Arg.Any<int>()).Returns(new UndoCheckingModel { HomeScore = "1", AwayScore = "2", InstantKey = 123456 });
            instantService.PushInstantCalculation(Arg.Any<InstantCalculationRequest>()).Returns(new Result());
            controller = Helper.GetController<InstantController>(null, instantService, null);
        }

        [Test]
        public async Task MatchChecking_Always_ReturnTrue()
        {
            // Act
            var result = await controller.MatchChecking(new MatchCheckingRequest());
            var actualResult = (MatchGoalRecordModel)result.Data;

            // Assert
            Assert.IsTrue(actualResult.ErrCode == 0 && string.IsNullOrWhiteSpace(actualResult.ErrMsg));
        }

        [Test]
        public async Task PushScore_Always_ReturnTrue()
        {
            // Act
            var result = await controller.PushScore(new InstantCalculationRequest());
            var actualResult = (Result)result.Data;

            // Assert
            Assert.IsTrue(actualResult.ErrCode == 0 && string.IsNullOrWhiteSpace(actualResult.ErrMsg));
        }

        [Test]
        public async Task UndoCheckingScore_Always_ReturnExpectedModel()
        {
            // Act
            var result = await controller.UndoCheckingScore(new UndoCheckingRequest());
            var actualModel = (UndoCheckingModel)result.Data;

            // Assert
            var expectedModel = new UndoCheckingModel { HomeScore = "1", AwayScore = "2", InstantKey = 123456 };
            AssertExtension.AreEqual(expectedModel, actualModel);
        }
    }
}