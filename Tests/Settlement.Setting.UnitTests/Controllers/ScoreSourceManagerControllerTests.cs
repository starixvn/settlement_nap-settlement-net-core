using NSubstitute;
using Settlement.Core.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Settlement.Setting.Controllers;
using Settlement.Setting.Models;
using Settlement.Setting.Models.OutsideSourceManager;
using Settlement.Setting.Requests;
using Settlement.Setting.Requests.OutsideSourceManager;
using Settlement.Setting.Requests.ProviderManager;
using Settlement.Setting.Services;
using Xunit;

namespace Settlement.Setting.UnitTests.Controllers
{
    public class ScoreSourceManagerControllerTests
    {
        private SourceManagerController controller;
        private OutsideSourceSettingService outsideSourceSettingService;
        private ProviderSettingService providerSettingService;

        [SetUp]
        public void SetUp()
        {
            outsideSourceSettingService = Substitute.For<OutsideSourceSettingService>();
            providerSettingService = Substitute.For<ProviderSettingService>();
            controller = Helper.GetController<SourceManagerController>(null, null, null, outsideSourceSettingService, providerSettingService);
        }

        [Test]
        public async Task UpdateProviderSource_Always_ReturnsProviderList()
        {
            providerSettingService.UpdateProvider(Arg.Any<UpdateProviderRequest>()).Returns(new Result());

            var result = await controller.UpdateProviderSource(new UpdateProviderRequest()) as OkNegotiatedContentResult<Result>;

            Assert.IsInstanceOf<Result>(result.Content);
        }

        [Test]
        public async Task AddOutsideSource_Always_ReturnsResult()
        {
            outsideSourceSettingService.AddOutsideSource(Arg.Any<AddOutsideSourceRequest>()).Returns(new AddSourceResult());

            var result = await controller.AddOutsideSource(new AddOutsideSourceRequest()) as OkNegotiatedContentResult<AddSourceResult>;

            Assert.IsInstanceOf<AddSourceResult>(result.Content);
        }

        [Test]
        public async Task UpdateOutsideSource_Always_ReturnsProviderList()
        {
            outsideSourceSettingService.UpdateOutsideSource(Arg.Any<UpdateOutsideSourceRequest>()).Returns(new Result());

            var result = await controller.UpdateOutsideSource(new UpdateOutsideSourceRequest()) as OkNegotiatedContentResult<Result>;

            Assert.IsInstanceOf<Result>(result.Content);
        }

        [Test]
        public async Task UpdateLeagueOutsideSource_Always_ReturnsProviderList()
        {
            outsideSourceSettingService.UpdateLeagueOutsideSource(Arg.Any<UpdateLeagueOutsideSourceRequest>()).Returns(new Result());

            var result = await controller.UpdateLeagueOutsideSource(new UpdateLeagueOutsideSourceRequest()) as OkNegotiatedContentResult<Result>;

            Assert.IsInstanceOf<Result>(result.Content);
        }

        [Test]
        public async Task GetProviderSource_Always_ReturnsProviderList()
        {
            var fakeList = new List<ProviderModel>();
            providerSettingService.GetProvider(Arg.Any<GetProviderRequest>()).Returns(fakeList);

            var result = await controller.GetProviderSource(new GetProviderRequest()) as OkNegotiatedContentResult<List<ProviderModel>>;

            Assert.IsInstanceOf<List<ProviderModel>>(result.Content);
        }

        [Test]
        public async Task GetOutsideSource_Always_ReturnsOutsideSourceList()
        {
            var fakeList = new List<OutsideSourceModel>();
            outsideSourceSettingService.GetOutsideSource(Arg.Any<GetOutsideSourceRequest>()).Returns(fakeList);

            var result = await controller.GetOutsideSource(new GetOutsideSourceRequest()) as OkNegotiatedContentResult<List<OutsideSourceModel>>;

            Assert.IsInstanceOf<List<OutsideSourceModel>>(result.Content);
        }

        [Test]
        public async Task GetLeagueOutsideSource_Always_ReturnsLeagueOutsideSourceModel()
        {
            var fakeResult = new LeagueOutsideSourceModel();
            outsideSourceSettingService.GetLeagueOutsideSource(Arg.Any<GetLeagueOutsideSourceRequest>()).Returns(fakeResult);

            var result = await controller.GetLeagueOutsideSource(new GetLeagueOutsideSourceRequest()) as OkNegotiatedContentResult<LeagueOutsideSourceModel>;

            Assert.IsInstanceOf<LeagueOutsideSourceModel>(result.Content);
        }
    }
}