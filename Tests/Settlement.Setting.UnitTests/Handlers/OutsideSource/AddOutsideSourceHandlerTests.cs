using NSubstitute;
using NUnit.Framework;
using Settlement.CalculationSetting.Handlers.OutsideSourceManager;
using Settlement.CalculationSetting.Models.OutsideSourceManager;
using Settlement.CalculationSetting.Requests;
using Settlement.CalculationSetting.Services;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.CalculCalculationSettingate.UnitTests.Handlers.OutsideSource
{
    internal class AddOutsideSourceHandlerTests
    {
        private OutsideSourceSettingService outsideSourceSettingService;
        private AddOutsideSourceHandler handler;
        private AddOutsideSourceRequest request;

        [SetUp]
        public void SetUp()
        {
            outsideSourceSettingService = Substitute.For<OutsideSourceSettingService>();
            request = new AddOutsideSourceRequest();
            handler = new AddOutsideSourceHandler(outsideSourceSettingService);
        }

        [Test]
        public async Task Handle_Always_ReturnCorrectResult()
        {
            var fakeResult = new AddSourceResult { ErrCode = 0, ErrMsg = string.Empty };
            outsideSourceSettingService.AddOutsideSource(Arg.Any<AddOutsideSourceRequest>()).Returns(fakeResult);

            var actual = await handler.Handle(new AddOutsideSourceRequest(), new CancellationToken());

            Assert.AreEqual(fakeResult, actual);
        }
    }
}