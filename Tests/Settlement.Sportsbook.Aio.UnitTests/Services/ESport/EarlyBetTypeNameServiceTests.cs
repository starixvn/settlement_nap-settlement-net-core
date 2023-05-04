using Settlement.ResourceName.Services;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.ESport;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.ESport;

public class EarlyBetTypeNameServiceTests
{
    private readonly IEarlyBetTypeNameService service;

    private readonly IResourceNameService resourceNameService;

    public EarlyBetTypeNameServiceTests()
    {
        resourceNameService = Substitute.For<IResourceNameService>();
        service = new EarlyBetTypeNameServiceImp(resourceNameService);
    }

    [Theory]
    [InlineData("902801", 1)]
    [InlineData("903402", 2)]
    public void GetBetTypeName_Always_ReturnCorrectBetTypeName(string resourceId, int map)
    {
        var resultDetail = new ResultDetail
        {
            ResourceId = resourceId
        };

        resourceNameService.GetResourceName(Arg.Any<string>(), Arg.Any<string>()).Returns(("mockBettype", "mockName"));

        resultDetail = service.GetBetTypeName(resultDetail);

        Assert.Equal(map, resultDetail.Map);
        Assert.Equal("mockName", resultDetail.BetTypeName);
        Assert.Equal("mockBettype", resultDetail.BetType);
    }
}