using NSubstitute;
using NUnit.Framework;
using Settlement.CalculationSetting.Controllers;
using Settlement.CalculationSetting.Requests;
using Settlement.Models;
using Settlement.Services;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace Settlement.CalculationSetting.UnitTests.Controllers
{
    [TestFixture]
    public class InstantSettingControllerTests
    {
        private InstantSettingController controller;

        [SetUp]
        public void SetUp()
        {
            var refDataService = Substitute.For<RefDataService>();
            refDataService.GetLeagueName(Arg.Any<int>()).Returns("RUSSIA PREMIER LEAGUE");
            controller = Helper.GetController<InstantSettingController>(refDataService, null, null);
        }

        [Test]
        public void Index_Always_ReturnsViewIsInstantSetting()
        {
            // Act
            var result = (ViewResult)controller.Index(1, 120, "Instant Time");

            // Assert
            var viewPath = "~/dist/instant-setting/index.cshtml";
            Assert.AreEqual(viewPath, result.ViewName);
        }

        [Test]
        public async Task GetLeagueName_LeagueRequest_ReturnsRightLeagueName()
        {
            // Act
            var result = await controller.GetLeagueName(new LeagueRequest { LeagueId = 127 });
            var actualResult = (League)result.Data;

            // Assert
            var expectedName = "RUSSIA PREMIER LEAGUE";
            Assert.AreEqual(expectedName, actualResult.LeagueName);
        }

        [Test]
        public void Proceed_TimeSettingRequest_ChangeTimeSuccessfully()
        {
            // Arrange
            var request = new TimeSettingRequest();

            // Act
            var result = (Result)controller.Proceed(request).Result.Data;

            // Assert
            Assert.IsTrue(result.IsSuccessful, "Should uncalculate successfully!");
        }
    }
}