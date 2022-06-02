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
    internal class GetLeagueOutsideSourceHanderTests
    {
        private OutsideSourceSettingService outsideSourceSettingService;
        private GetLeagueOutsideSourceHandler handler;
        private GetLeagueOutsideSourceRequest request;

        [SetUp]
        public void SetUp()
        {
            outsideSourceSettingService = Substitute.For<OutsideSourceSettingService>();
            request = new GetLeagueOutsideSourceRequest();
            handler = new GetLeagueOutsideSourceHandler(outsideSourceSettingService);
        }

        [Test]
        public async Task Handler_Always_ReturnCorrectLeagueOutsideSources()
        {
            var fakeResult = new LeagueOutsideSourceModel
            {
                OutsideSourceList = new List<LeagueOutSideSourceResourceItem>(),
                OutsideSourceSort = new List<LeagueOutSideSourceResourceItem>()
            };

            outsideSourceSettingService.GetLeagueOutsideSource(Arg.Any<GetLeagueOutsideSourceRequest>()).Returns(fakeResult);
            var result = await handler.Handle(new GetLeagueOutsideSourceRequest(), new System.Threading.CancellationToken());

            Assert.IsNotNull(result);
        }
    }
}