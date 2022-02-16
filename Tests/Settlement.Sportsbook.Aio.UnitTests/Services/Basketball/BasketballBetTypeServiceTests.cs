using Fanex.RemotingRef;
using NSubstitute;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Basketball;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Basketball
{
    public class BasketballBetTypeServiceTests
    {
        private readonly IBasketballBetTypeService service;

        public BasketballBetTypeServiceTests()
        {
            var refDataService = Substitute.For<IRefDataService>();
            refDataService.GetBetTypeName(Arg.Any<object>(), Arg.Any<object>()).Returns("Test name");
            service = new BasketballBetTypeServiceImp(refDataService);
        }

        [Theory]
        [InlineData("605", 0)]
        [InlineData("60601", 3)]
        [InlineData("60701", 6)]
        [InlineData("6170101", 1)]
        [InlineData("6170201", 2)]
        [InlineData("6170301", 4)]
        [InlineData("6170401", 5)]
        public void GetBetTypeNameAndGroup_Always_SetCorrectGroupBetTypes(string resourceId, int groupId)
        {
            var resultDetail = new ResultDetail { ResourceId = resourceId };

            
            service.GetBetTypeNameAndGroup(resultDetail);

            Assert.Equal(groupId, resultDetail.GroupId);
        }

        [Fact]
        public void CheckValue_Always_SetEmptyValueForNullScore()
        {
            var resultDetail = new ResultDetail();

            service.CheckValue(resultDetail);

            Assert.Equal("", resultDetail.HomeValue);
            Assert.Equal("", resultDetail.AwayValue);
        }
    }
}
