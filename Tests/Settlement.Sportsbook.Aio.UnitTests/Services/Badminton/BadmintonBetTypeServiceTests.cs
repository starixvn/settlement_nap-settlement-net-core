using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Badminton;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Badminton;

public class BadmintonBetTypeServiceTests
{
    private readonly IBadmintonBetTypeService service;

    public BadmintonBetTypeServiceTests()
    {
        service = new BadmintonBetTypeServiceImp();
    }

    [Theory]
    [InlineData("7120103", 1, "712", "Game 1 Race to 3 Points")]
    [InlineData("7120203", 2, "712", "Game 2 Race to 3 Points")]
    [InlineData("7130301", 3, "713", "Game 3 Point 1 Winner")]
    public void GetBetTypeName_Always_ReturnCorrectBetTypeInfo(string resourceId, int map, string betType, string betTypeName)
    {
        var resultDetail = new ResultDetail { ResourceId = resourceId };

        var actual = service.GetBetTypeName(resultDetail);

        Assert.Equal(map, actual.Map);
        Assert.Equal(betType, actual.BetType);
        Assert.Equal(betTypeName, actual.BetTypeName);
    }
}