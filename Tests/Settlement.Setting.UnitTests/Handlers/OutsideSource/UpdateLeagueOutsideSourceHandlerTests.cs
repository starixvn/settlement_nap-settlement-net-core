using NSubstitute;
using NUnit.Framework;
using Settlement.CalculationSetting.Handlers.OutsideSourceManager;
using Settlement.CalculationSetting.Requests.OutsideSourceManager;
using Settlement.CalculationSetting.Services;
using Settlement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.CalculationSetting.UnitTests.Handlers.OutsideSource
{
    internal class UpdateLeagueOutsideSourceHandlerTests
    {
        private OutsideSourceSettingService outsideSourceSettingService;
        private UpdateLeagueOutsideSourceHandler handler;
        private UpdateLeagueOutsideSourceRequest request;

        [SetUp]
        public void SetUp()
        {
            outsideSourceSettingService = Substitute.For<OutsideSourceSettingService>();
            request = new UpdateLeagueOutsideSourceRequest();
            handler = new UpdateLeagueOutsideSourceHandler(outsideSourceSettingService);
        }

        [Test]
        public async Task Handle_Always_ReturnCorrectResult()
        {
            var fakeResult = new Result { ErrCode = 0, ErrMsg = string.Empty };
            outsideSourceSettingService.UpdateLeagueOutsideSource(Arg.Any<UpdateLeagueOutsideSourceRequest>()).Returns(fakeResult);

            var actual = await handler.Handle(new UpdateLeagueOutsideSourceRequest(), new CancellationToken());

            Assert.AreEqual(fakeResult, actual);
        }
    }
}