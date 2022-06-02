using NSubstitute;
using NUnit.Framework;
using Settlement.CalculationSetting.Handlers.ProviderManager;
using Settlement.CalculationSetting.Requests;
using Settlement.CalculationSetting.Services;
using Settlement.Core.Models;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.CalculationSetting.UnitTests.Handlers.ProviderSource
{
    internal class UpdateProviderHandlerTests
    {
        private ProviderSettingService providerSettingService;
        private UpdateProviderHandler handler;
        private UpdateProviderRequest request;

        [SetUp]
        public void SetUp()
        {
            providerSettingService = Substitute.For<ProviderSettingService>();
            request = new UpdateProviderRequest();
            handler = new UpdateProviderHandler(providerSettingService);
        }

        [Test]
        public async Task Handle_Always_ReturnCorrectResult()
        {
            var fakeResult = new Result { ErrCode = 0, ErrMsg = string.Empty };
            providerSettingService.UpdateProvider(Arg.Any<UpdateProviderRequest>()).Returns(fakeResult);

            var actual = await handler.Handle(new UpdateProviderRequest(), new CancellationToken());

            Assert.AreEqual(fakeResult, actual);
        }
    }
}