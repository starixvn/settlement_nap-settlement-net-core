using NSubstitute;
using NUnit.Framework;
using Settlement.CalculationSetting.Handlers.ProviderManager;
using Settlement.CalculationSetting.Models.OutsideSourceManager;
using Settlement.CalculationSetting.Requests.OutsideSourceManager;
using Settlement.CalculationSetting.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Settlement.CalculationSetting.UnitTests.Handlers.OutsideSource
{
    internal class GetOutsideSourceHandlerTests
    {
        private OutsideSourceSettingService outsideSourceSettingService;
        private GetOutsideSourceHandler handler;
        private GetOutsideSourceRequest request;

        [SetUp]
        public void SetUp()
        {
            outsideSourceSettingService = Substitute.For<OutsideSourceSettingService>();
            request = new GetOutsideSourceRequest();
            handler = new GetOutsideSourceHandler(outsideSourceSettingService);
        }

        [Test]
        public async Task Handler_Always_ReturnCorrectOutsideSources()
        {
            var fakeSources = new List<OutsideSourceModel>
            {
                new OutsideSourceModel { SourceId = 1 },
                new OutsideSourceModel { SourceId = 2 },
                new OutsideSourceModel { SourceId = 3 },
            };

            outsideSourceSettingService.GetOutsideSource(Arg.Any<GetOutsideSourceRequest>()).Returns(fakeSources);
            var result = await handler.Handle(new GetOutsideSourceRequest(), new System.Threading.CancellationToken());

            Assert.AreEqual(3, result.Count);
        }
    }
}