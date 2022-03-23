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

        private readonly IGroupBetTypeService groupBetTypeService;

        public BasketballBetTypeServiceTests()
        {
            groupBetTypeService = Substitute.For<IGroupBetTypeService>();
            var refDataService = Substitute.For<IRefDataService>();
            refDataService.GetBetTypeName(Arg.Any<object>(), Arg.Any<object>()).Returns("Test name");
            service = new BasketballBetTypeServiceImp(refDataService, groupBetTypeService);
        }

        [Fact]
        public void GetBetTypeNameAndGroup_IsOrderBetType_CallCorrectFunction()
        {
            var resultDetail = new ResultDetail { ResourceId = "123" };
            groupBetTypeService.GroupOtherBetType(Arg.Any<ResultDetail>()).Returns(new GroupNameModel());

            service.GetBetTypeNameAndGroup(resultDetail);

            groupBetTypeService.Received().GroupOtherBetType(Arg.Any<ResultDetail>());
        }

        [Theory]
        [InlineData("60701", "1st Half", true)]
        [InlineData("12345", null, false)]
        public void GetBetTypeNameAndGroup_HalfTimeBetType_CallCorrectFunction(string resourceId, string groupName, bool isCallFunction)
        {
            var resultDetail = new ResultDetail { ResourceId = resourceId };
            groupBetTypeService.GroupHalfBetType(Arg.Any<int>()).Returns(new GroupNameModel
            {
                GroupName = groupName
            });

            var result = service.GetBetTypeNameAndGroup(resultDetail);

            Assert.Equal(result.GroupName, groupName);
            if (isCallFunction)
            {
                groupBetTypeService.Received().GroupHalfBetType(Arg.Any<int>());
            }
            else
            {
                groupBetTypeService.DidNotReceive().GroupHalfBetType(Arg.Any<int>());
            }
        }

        [Theory]
        [InlineData("6170101", "Quarter 1", true)]
        [InlineData("1234567", null, false)]
        public void GetBetTypeNameAndGroup_QuarterBetType_CallCorrectFunction(string resourceId, string groupName, bool isCallFunction)
        {
            var resultDetail = new ResultDetail { ResourceId = resourceId };
            groupBetTypeService.GroupQuarterBetType(Arg.Any<int>()).Returns(new GroupNameModel
            {
                GroupName = groupName
            });

            var result = service.GetBetTypeNameAndGroup(resultDetail);

            Assert.Equal(result.GroupName, groupName);
            if (isCallFunction)
            {
                groupBetTypeService.Received().GroupQuarterBetType(Arg.Any<int>());
            }
            else
            {
                groupBetTypeService.DidNotReceive().GroupQuarterBetType(Arg.Any<int>());
            }
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