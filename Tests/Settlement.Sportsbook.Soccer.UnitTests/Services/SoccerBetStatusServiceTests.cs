using NSubstitute;
using Settlement.Sportsbook.Soccer.GetMatch.Services;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class SoccerBetStatusServiceTests
{
    private readonly IMatchService matchService;
    private readonly IValidationService validationService;
    private readonly IBetStatusAllService betStatusAllService;
    private readonly Soccer.Services.FullTimeBetStatus.IBetStatusService fullTimeBetStatusService;
    private readonly Soccer.Services.HalfTimeBetStatus.IBetStatusService halfTimeBetStatusService;

    private readonly ISoccerBetStatusService service;

    public SoccerBetStatusServiceTests()
    {
        matchService = Substitute.For<IMatchService>();
        validationService = Substitute.For<IValidationService>();
        betStatusAllService = Substitute.For<IBetStatusAllService>();
        fullTimeBetStatusService = Substitute.For<Soccer.Services.FullTimeBetStatus.IBetStatusService>();
        halfTimeBetStatusService = Substitute.For<Soccer.Services.HalfTimeBetStatus.IBetStatusService>();
        service = new SoccerBetStatusServiceImp(matchService, validationService,
            halfTimeBetStatusService, fullTimeBetStatusService, betStatusAllService);
    }

    [Fact]
    public void CreateBetStatus_IsExistFirstGoalLastGoalAndActionIsCalculationHalftime_CallGetBetStatusMethodOfHalftimeService()
    {
        // Arrange
        var query = new SettleRequest
        {
            ActionName = "CAL-HT"
        };
        validationService.IsExistFirstGoalLastGoal(Arg.Any<SettleRequest>()).Returns(true);

        // Act
        service.CreateBetStatus(query);

        // Assert
        halfTimeBetStatusService.Received().GetBetStatus(Arg.Any<SettleRequest>());
    }

    [Fact]
    public void CreateBetStatus_IsExistFirstGoalLastGoalAndActionIsCalculationFullTime_CallGetBetStatusMethodOfFullTimeService()
    {
        // Arrange
        var query = new SettleRequest
        {
            ActionName = "CAL-FT"
        };
        validationService.IsExistFirstGoalLastGoal(Arg.Any<SettleRequest>()).Returns(true);

        // Act
        service.CreateBetStatus(query);

        // Assert
        fullTimeBetStatusService.Received().GetBetStatus(Arg.Any<SettleRequest>());
    }

    [Fact]
    public void CreateBetStatus_IsExistFirstGoalLastGoalAndActionIsCalculationAll_CallGetBetStatusMethodOfAllService()
    {
        // Arrange
        var query = new SettleRequest
        {
            ActionName = "CAL"
        };
        validationService.IsExistFirstGoalLastGoal(Arg.Any<SettleRequest>()).Returns(true);

        // Act
        service.CreateBetStatus(query);

        // Assert
        betStatusAllService.Received().GetBetStatus(Arg.Any<SettleRequest>());
    }

    [Fact]
    public void CreateBetStatus_IsExistFirstGoalLastGoalAndActionIsCalculationAll_ReturnsEmpty()
    {
        // Arrange
        var query = new SettleRequest();

        validationService.IsExistFirstGoalLastGoal(Arg.Any<SettleRequest>()).Returns(true);

        // Act
        var result = service.CreateBetStatus(query);

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public void CreateBetStatus_IsRefundHalftime_ReturnsRightDefaultBetStatus()
    {
        // Arrange
        var expectedBetStatus = string.Empty;

        var query = new SettleRequest
        {
            BetStatus = "Refund"
        };

        validationService.IsExistFirstGoalLastGoal(Arg.Any<SettleRequest>()).Returns(false);
        validationService.IsRefundHalftime(Arg.Any<SettleRequest>()).Returns(true);

        // Act
        var actualBetStatus = service.CreateBetStatus(query);

        // Assert
        Assert.Equal(expectedBetStatus, actualBetStatus);
    }

    [Fact]
    public void CreateBetStatus_NotExistFirstGoalLastGoalAndNotRefundHalftime_ReturnsEmptyBetStatus()
    {
        // Arrange
        var query = new SettleRequest
        {
            BetStatus = "Refund"
        };
        validationService.IsExistFirstGoalLastGoal(Arg.Any<SettleRequest>()).Returns(false);
        validationService.IsRefundHalftime(Arg.Any<SettleRequest>()).Returns(false);

        // Act
        var actualBetStatus = service.CreateBetStatus(query);

        // Assert
        Assert.Empty(actualBetStatus);
    }
}