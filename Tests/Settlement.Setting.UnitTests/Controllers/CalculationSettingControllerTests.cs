using NUnit.Framework;
using Settlement.CalculationSetting.Controllers;
using System.Web.Mvc;

namespace Settlement.CalculationSetting.UnitTests.Controllers
{
    internal class CalculationSettingControllerTests
    {
        private CalculationSettingController controller;

        [SetUp]
        public void SetUp()
        {
            controller = new CalculationSettingController();
        }

        [Test]
        public void AutoSettingMatch_Always_ReturnsPageTypeIsMatch()
        {
            // Act
            var result = (ViewResult)controller.AutoSettingMatch();

            // Assert
            var pageTypeExpected = "AutoSettingMatch";
            Assert.AreEqual(pageTypeExpected, result.ViewBag.PageType);
        }

        [Test]
        public void AutoSettingMatch_Always_ReturnsRightExpectedView()
        {
            // Act
            var result = (ViewResult)controller.AutoSettingMatch();

            // Assert
            var viewExpected = "~/dist/instant-setting/index.cshtml";
            Assert.AreEqual(viewExpected, result.ViewName);
        }

        [Test]
        public void AutoSettingLeague_Always_ReturnsPageTypeIsLeague()
        {
            // Act
            var result = (ViewResult)controller.AutoSettingLeague();

            // Assert
            var pageTypeExpected = "AutoSettingLeague";
            Assert.AreEqual(pageTypeExpected, result.ViewBag.PageType);
        }

        [Test]
        public void AutoSettingLeague_Always_ReturnsRightExpectedView()
        {
            // Act
            var result = (ViewResult)controller.AutoSettingLeague();

            // Assert
            var viewExpected = "~/dist/instant-setting/index.cshtml";
            Assert.AreEqual(viewExpected, result.ViewName);
        }

        [Test]
        public void RemarkSetting_Always_ReturnExpectedView()
        {
            var result = (ViewResult)controller.RemarkSetting();

            var expectedView = "~/dist/instant-setting/index.cshtml";
            Assert.AreEqual(expectedView, result.ViewName);
        }
    }
}