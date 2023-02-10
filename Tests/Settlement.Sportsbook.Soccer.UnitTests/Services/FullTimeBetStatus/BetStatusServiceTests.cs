using NSubstitute;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.FullTimeBetStatus;

public class BetStatusServiceTests
{
    private readonly IValidationService validationService;
    private readonly IScoreAndGoalService scoreAndGoalService;
    private readonly IBetStatusService service;

    public BetStatusServiceTests()
    {
        validationService = Substitute.For<IValidationService>();
        scoreAndGoalService = Substitute.For<IScoreAndGoalService>();
        service = new BetStatusServiceImp(validationService, scoreAndGoalService);
    }

    [Fact]
    public void GetBetStatus_EmptyScoreAndGoal_InvokeReplaceBetStatusWhenScoreAndGoalRecordIsNullMethodOfScoreAndGoalService()
    {
        // Arrange
        validationService.IsNullScoreAndGoalRecord(Arg.Any<SettleRequest>()).Returns(true);

        // Act
        service.GetBetStatus(new SettleRequest());

        // Assert
        scoreAndGoalService.Received().ReplaceBetStatusWhenScoreAndGoalRecordIsNull(Arg.Any<string>());
    }

    [Fact]
    public void GetBetStatus_HasFinalScoreAndGoal_InvokeBetStatusHasFinalScoreAndGoalRecordMethodOfScoreAndGoalService()
    {
        // Arrange
        validationService.HasFinalScoreAndSemicolonOnGoalRecord(Arg.Any<SettleRequest>()).Returns(true);

        // Act
        service.GetBetStatus(new SettleRequest());

        // Assert
        scoreAndGoalService.Received().BetStatusHasFinalScoreAndGoalRecord(Arg.Any<SettleRequest>());
    }

    [Fact]
    public void GetBetStatus_HasGoalAndOnlyFinalHomeScore_ReturnEmpty()
    {
        // Arrange

        // Act
        var actual = service.GetBetStatus(new SettleRequest());

        // Assert
        Assert.Empty(actual);
    }
}