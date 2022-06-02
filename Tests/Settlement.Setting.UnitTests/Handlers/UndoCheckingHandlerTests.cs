using NSubstitute;
using NUnit.Framework;
using Settlement.CalculationSetting.Handlers;
using Settlement.CalculationSetting.Models;
using Settlement.CalculationSetting.Requests;
using Settlement.CalculationSetting.Services;

namespace Settlement.CalculationSetting.UnitTests.Handlers
{
    public class TestUndoCheckingHandler : UndoCheckingHandler
    {
        public TestUndoCheckingHandler(InstantService instantService) : base(instantService)
        {
        }

        public UndoCheckingModel CallHandle(UndoCheckingRequest request)
        {
            return base.Handle(request);
        }
    }
    [TestFixture]
    public class UndoCheckingHandlerTests
    {
        private InstantService instantService;
        private TestUndoCheckingHandler handler;
        private UndoCheckingModel model;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            model = new UndoCheckingModel { HomeScore = "1", AwayScore = "2" };
            instantService = Substitute.For<InstantService>();
            instantService.UndoCheckingInfo(Arg.Any<int>()).Returns(model);
            handler = new TestUndoCheckingHandler(instantService);
        }

        [Test]
        public void Handle_Always_ReturnsRightUndoCheckingModel()
        {
            // Act
            var request = new UndoCheckingRequest();
            var result = handler.CallHandle(request);

            // Assert
            Assert.AreEqual(model, result);
        }
    }
}