using Settlement.BetTypeName.Services;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.ESport;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.ESport;

public class EarlyBetTypeNameServiceTests
{
    private readonly IEarlyBetTypeNameService service;

    private readonly IBetTypeNameService betTypeNameService;

    public EarlyBetTypeNameServiceTests()
    {
        betTypeNameService = Substitute.For<IBetTypeNameService>();
        service = new EarlyBetTypeNameServiceImp(betTypeNameService);
    }

    [Theory]
    [InlineData("902801", 1, "9028")]
    [InlineData("903402", 2, "9034")]
    public void GetBetTypeName_Always_ReturnCorrectBetTypeName(string resourceId, int map, string betType)
    {
        var resultDetail = new ResultDetail
        {
            ResourceId = resourceId
        };

        betTypeNameService.GetBetTypeName(Arg.Any<string>(), Arg.Any<string>()).Returns("MockBettypeName");

        resultDetail = service.GetBetTypeName(resultDetail);

        Assert.Equal(map, resultDetail.Map);
        Assert.Equal(betType, resultDetail.BetType);
        Assert.Equal("MockBettypeName", resultDetail.BetTypeName);
    }
}