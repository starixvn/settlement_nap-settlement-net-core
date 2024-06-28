using NSubstitute;
using NUnit.Framework;
using Settlement.Models;
using Settlement.CalculationSetting.Handlers;
using Settlement.CalculationSetting.Requests;
using Settlement.CalculationSetting.Services;

namespace Settlement.CalculationSetting.UnitTests.Handlers
{
    public class TestTimeSettingHandler : TimeSettingHandler
    {
        public TestTimeSettingHandler(InstantSettingService instantSettingService) : base(instantSettingService)
        {
        }

        public Result CallHandle(TimeSettingRequest request)
        {
            return base.Handle(request);
        }
    }

    [TestFixture]
    public class TimeSettingHandlerTests
    {
        private InstantSettingService instantSettingService;
        private TestTimeSettingHandler handler;
        private Result result;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            result = new Result { ErrCode = 0, ErrMsg = string.Empty };
            instantSettingService = Substitute.For<InstantSettingService>();
            instantSettingService.UpdateTimeSettingLeague(Arg.Any<TimeSettingRequest>()).Returns(result);
            handler = new TestTimeSettingHandler(instantSettingService);
        }

        [Test]
        public void Handle_Always_ReturnsRightResult()
        {
            // Act
            var request = new TimeSettingRequest();
            var actual = handler.CallHandle(request);

            // Assert
            Assert.AreEqual(result, actual);
        }
    }
}