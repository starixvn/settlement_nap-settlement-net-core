using NSubstitute;
using NUnit.Framework;
using Settlement.CalculationSetting.Handlers;
using Settlement.CalculationSetting.Models;
using Settlement.CalculationSetting.Requests;
using Settlement.CalculationSetting.Services;

namespace Settlement.CalculationSetting.UnitTests.Handlers
{
    public class TestMatchCheckingHandler : MatchCheckingHandler
    {
        public TestMatchCheckingHandler(InstantService instantService) : base(instantService)
        {
        }

        public MatchGoalRecordModel CallHandle(MatchCheckingRequest request)
        {
            return base.Handle(request);
        }
    }

    [TestFixture]
    public class MatchCheckingHandlerTests
    {
        private InstantService instantService;
        private TestMatchCheckingHandler handler;
        private MatchGoalRecordModel model;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            model = new MatchGoalRecordModel { IsExistFgNg = true, IsExistHtFgNg = true };
            instantService = Substitute.For<InstantService>();
            instantService.CalculateCheckingInfo(Arg.Any<MatchCheckingRequest>()).Returns(model);
            handler = new TestMatchCheckingHandler(instantService);
        }

        [Test]
        public void Handle_Always_ReturnsRightMatchGoalRecordModel()
        {
            // Act
            var request = new MatchCheckingRequest();
            var result = handler.CallHandle(request);

            // Assert
            Assert.AreEqual(model, result);
        }
    }
}