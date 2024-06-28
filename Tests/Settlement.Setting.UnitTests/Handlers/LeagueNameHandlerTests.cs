using NSubstitute;
using NUnit.Framework;
using Settlement.Models;
using Settlement.CalculationSetting.Handlers;
using Settlement.CalculationSetting.Requests;
using Settlement.Services;

namespace Settlement.CalculationSetting.UnitTests.Handlers
{
    public class TestLeagueNameHandler : LeagueNameHandler
    {
        public TestLeagueNameHandler(RefDataService refDataService) : base(refDataService)
        {
        }

        public League CallHandle(LeagueRequest request)
        {
            return base.Handle(request);
        }
    }

    [TestFixture]
    public class LeagueNameHandlerTests
    {
        private RefDataService refDataService;
        private TestLeagueNameHandler handler;
        private League model;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            model = new League { LeagueName = "League Tests" };
            refDataService = Substitute.For<RefDataService>();
            refDataService.GetLeagueName(Arg.Any<int>()).Returns(model.LeagueName);
            handler = new TestLeagueNameHandler(refDataService);
        }

        [Test]
        public void Handle_Always_ReturnsRightLeague()
        {
            // Act
            var request = new LeagueRequest();
            var result = handler.CallHandle(request);

            // Assert
            Assert.AreEqual(model.LeagueName, result.LeagueName);
        }
    }
}