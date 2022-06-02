using NSubstitute;
using NUnit.Framework;
using Settlement.CalculationSetting.Handlers.OutsideSourceManager;
using Settlement.CalculationSetting.Requests;
using Settlement.CalculationSetting.Services;
using Settlement.Core.Models;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.CalculationSetting.UnitTests.Handlers.OutsideSource
{
    internal class UpdateOutsideSourceHandlerTests
    {
        private OutsideSourceSettingService outsideSourceSettingService;
        private UpdateOutsideSourceHandler handler;
        private UpdateOutsideSourceRequest request;

        [SetUp]
        public void SetUp()
        {
            outsideSourceSettingService = Substitute.For<OutsideSourceSettingService>();
            request = new UpdateOutsideSourceRequest();
            handler = new UpdateOutsideSourceHandler(outsideSourceSettingService);
        }

        [Test]
        public async Task Handle_Always_ReturnCorrectResult()
        {
            var fakeResult = new Result { ErrCode = 0, ErrMsg = string.Empty };
            outsideSourceSettingService.UpdateOutsideSource(Arg.Any<UpdateOutsideSourceRequest>()).Returns(fakeResult);

            var actual = await handler.Handle(new UpdateOutsideSourceRequest(), new CancellationToken());

            Assert.AreEqual(fakeResult, actual);
        }
    }
}