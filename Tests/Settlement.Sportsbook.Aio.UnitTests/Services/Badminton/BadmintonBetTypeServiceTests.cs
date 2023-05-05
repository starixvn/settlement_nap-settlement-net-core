using Settlement.ResourceName.Services;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Badminton;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Badminton;

public class BadmintonBetTypeServiceTests
{
    private readonly IBadmintonBetTypeService service;

    private readonly IResourceNameService resourceNameService;

    public BadmintonBetTypeServiceTests()
    {
        resourceNameService = Substitute.For<IResourceNameService>();
        service = new BadmintonBetTypeServiceImp(resourceNameService);
    }

    [Theory]
    [InlineData("7120103", 1)]
    [InlineData("7120203", 2)]
    [InlineData("7130301", 3)]
    public void GetBetTypeName_Always_ReturnCorrectBetTypeInfo(string resourceId, int map)
    {
        var resultDetail = new ResultDetail { ResourceId = resourceId };

        resourceNameService.GetResourceName(Arg.Any<string>(), Arg.Any<string>()).Returns(("mockBettype", "mockName"));

        var actual = service.GetBetTypeName(resultDetail);

        Assert.Equal(map, actual.Map);
        Assert.Equal("mockBettype", actual.BetType);
        Assert.Equal("mockName", actual.BetTypeName);
    }
}