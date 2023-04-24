using Settlement.BetTypeName.Services;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Badminton;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Badminton;

public class BadmintonBetTypeServiceTests
{
    private readonly IBadmintonBetTypeService service;

    private readonly IBetTypeNameService betTypeNameService;

    public BadmintonBetTypeServiceTests()
    {
        betTypeNameService = Substitute.For<IBetTypeNameService>();
        service = new BadmintonBetTypeServiceImp(betTypeNameService);
    }

    [Theory]
    [InlineData("7120103", 1, "712")]
    [InlineData("7120203", 2, "712")]
    [InlineData("7130301", 3, "713")]
    public void GetBetTypeName_Always_ReturnCorrectBetTypeInfo(string resourceId, int map, string betType)
    {
        var resultDetail = new ResultDetail { ResourceId = resourceId };

        betTypeNameService.GetBetTypeName(Arg.Any<string>(), Arg.Any<string>()).Returns("MockBetType");

        var actual = service.GetBetTypeName(resultDetail);

        Assert.Equal(map, actual.Map);
        Assert.Equal(betType, actual.BetType);
        Assert.Equal("MockBetType", actual.BetTypeName);
    }
}