using NSubstitute;
using NUnit.Framework;
using Settlement.Core.Models;
using Settlement.CalculationSetting.Handlers;
using Settlement.CalculationSetting.Requests;
using Settlement.CalculationSetting.Services;

namespace Settlement.CalculationSetting.UnitTests.Handlers
{
    public class TestHandler : InstantCalculationHandler
    {
        public TestHandler(InstantService instantService) : base(instantService)
        {
        }

        public Result CallHandle(InstantCalculationRequest request)
        {
            return base.Handle(request);
        }
    }

    [TestFixture]
    public class InstantCalculationHandlerTests
    {
        private InstantService instantService;
        private TestHandler handler;
        private Result result;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            result = new Result { ErrCode = 0, ErrMsg = string.Empty };
            instantService = Substitute.For<InstantService>();
            instantService.PushInstantCalculation(Arg.Any<InstantCalculationRequest>()).Returns(result);
            handler = new TestHandler(instantService);
        }

        [Test]
        public void Handle_Always_ReturnsRightResult()
        {
           
            // Act
            var request = new InstantCalculationRequest();
            var actual = handler.CallHandle(request);

            // Assert
            Assert.AreEqual(result, actual);
        }
    }
}