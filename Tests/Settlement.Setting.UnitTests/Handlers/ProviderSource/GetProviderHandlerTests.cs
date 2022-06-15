using NSubstitute;
using NUnit.Framework;
using Settlement.CalculationSetting.Handlers.ProviderManager;
using Settlement.CalculationSetting.Models;
using Settlement.CalculationSetting.Requests.ProviderManager;
using Settlement.CalculationSetting.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Settlement.CalculationSetting.UnitTests.Handlers.ProviderSource
{
    internal class GetProviderHandlerTests
    {
        private ProviderSettingService providerSettingService;
        private GetProviderHandler handler;
        private GetProviderRequest request;

        [SetUp]
        public void SetUp()
        {
            providerSettingService = Substitute.For<ProviderSettingService>();
            request = new GetProviderRequest();
            handler = new GetProviderHandler(providerSettingService);
        }

        [Test]
        public async Task Handler_Always_ReturnCorrectProviderSources()
        {
            var fakeProviders = new List<ProviderModel>
            {
                new ProviderModel { SourceId = 1 },
                new ProviderModel { SourceId = 2 },
                new ProviderModel { SourceId = 3 },
            };

            providerSettingService.GetProvider(Arg.Any<GetProviderRequest>()).Returns(fakeProviders);
            var result = await handler.Handle(new GetProviderRequest(), new System.Threading.CancellationToken());

            Assert.AreEqual(3, result.Count);
        }
    }
}