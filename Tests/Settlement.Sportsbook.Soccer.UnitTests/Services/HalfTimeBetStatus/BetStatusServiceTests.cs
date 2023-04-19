namespace Settlement.Sportsbook.Soccer.UnitTests.Services.HalfTimeBetStatus;

using Requests;
using Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus;

public class BetStatusServiceTests
{
    private readonly IHalftimeService halftimeService;

    private readonly IBetStatusService service;

    public BetStatusServiceTests()
    {
        halftimeService = Substitute.For<IHalftimeService>();
        service = new BetStatusServiceImp(halftimeService);
    }

    [Fact]
    public void GetBetStatus_ExistHalftimeFgLg_CallAllRelatedMethods()
    {
        // Arrange
        var query = new SettleRequest
        {
            IsExistHtFgLg = true,
            IsExistFgNg = true
        };

        // Act
        service.GetBetStatus(query);

        // Assert
        Received.InOrder(() =>
        {
            halftimeService.GetBetStatusForCalculateHalfTime(Arg.Any<SettleRequest>());
            halftimeService.AppendHalfTimeBetStatus(Arg.Any<string>(), Arg.Any<string>());
            halftimeService.FullTimeBetStatusForCalculateHalfTime(Arg.Any<string>());
            halftimeService.AppendFullTimeBetStatus(Arg.Any<string>(), Arg.Any<string>());
        });
    }

    [Fact]
    public void GetBetStatus_NotExistFgLg_OnlyCallApplyNewBetStatusForHalfTimeMethod()
    {
        // Arrange
        var query = new SettleRequest();

        // Act
        service.GetBetStatus(query);

        // Assert
        halftimeService.DidNotReceive().GetBetStatusForCalculateHalfTime(Arg.Any<SettleRequest>());
        halftimeService.Received().AppendHalfTimeBetStatus(Arg.Any<string>(), Arg.Any<string>());
        halftimeService.DidNotReceive().FullTimeBetStatusForCalculateHalfTime(Arg.Any<string>());
    }
}