using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Volleyball;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Volleyball;

public class BetTypeNameServiceTests
{
    private readonly IEarlyBetTypeNameService service;

    public BetTypeNameServiceTests()
    {
        service = new EarlyBetTypeNameServiceImp();
    }

    [Theory]
    [InlineData("3901", 3901, "First Serve")]
    [InlineData("3914", 3914, "Will there be a 5th Set?")]
    [InlineData("39030102", 3903, "Set 1 Race to 2 Points")]
    [InlineData("39090203", 3909, "Set 2 Point 3 Winner")]
    [InlineData("39150304", 3915, "Set 3 4 Points Played")]
    [InlineData("12345", 1234, "")]
    public void GetInnsBetTypeName_Always_ReturnCorrectBetTypeName(string resourceId, int betTypeId, string betTypeName)
    {
        var resultDetail = new ResultDetail { ResourceId = resourceId };
        service.SetBetTypeName(resultDetail, betTypeId);

        Assert.Equal(betTypeName, resultDetail.BetTypeName);
    }
}