using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

using AutoMapper;
using Soccer.Services.GetMatch;

public class SoccerBetStatusServiceTests
{
    private readonly IValidationService validationService;
    private readonly IBetStatusAllService betStatusAllService;
    private readonly Soccer.Services.FullTimeBetStatus.IBetStatusService fullTimeBetStatusService;
    private readonly Soccer.Services.HalfTimeBetStatus.IBetStatusService halfTimeBetStatusService;

    private readonly ISoccerBetStatusService service;

    public SoccerBetStatusServiceTests()
    {
        var matchService = Substitute.For<IMatchService>();
        validationService = Substitute.For<IValidationService>();
        betStatusAllService = Substitute.For<IBetStatusAllService>();
        fullTimeBetStatusService = Substitute.For<Soccer.Services.FullTimeBetStatus.IBetStatusService>();
        halfTimeBetStatusService = Substitute.For<Soccer.Services.HalfTimeBetStatus.IBetStatusService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SoccerAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        service = new SoccerBetStatusServiceImp(matchService, validationService,
            halfTimeBetStatusService, fullTimeBetStatusService, betStatusAllService, mapper);
    }

    [Fact]
    public void
        CreateBetStatus_IsExistFirstGoalLastGoalAndActionIsCalculationHalftime_CallGetBetStatusMethodOfHalftimeService()
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
    public void
        CreateBetStatus_IsExistFirstGoalLastGoalAndActionIsCalculationFullTime_CallGetBetStatusMethodOfFullTimeService()
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

    [Theory]
    [InlineData(ResourceType.Halftime, 0)]
    [InlineData(ResourceType.Final, 1)]
    public void CreateBetStatusAfterUncalculateFt_HalfTimeResultRunningOrNull_ReturnEmpty(string resourceId,
        byte settlementStatusId)
    {
        var result = new ResultDetail

        {
            ResourceId = resourceId,
            SettlementStatusId = settlementStatusId
        };

        var request = new UncalculateFtRequest
        {
            ResultDetails = new List<ResultDetail> { result }
        };

        var actual = service.CreateBetStatusAfterUncalculateFt(request, "", "");

        Assert.Empty(actual);
    }

    [Theory]
    [InlineData(SettlementStatus.RefundHt, "Refund HT;")]
    [InlineData(SettlementStatus.Completed, "")]
    public void CreateBetStatusAfterUncalculateFt_NotExistFglgBetType_ReturnRefundHt(byte settlementStatusId, string expected)
    {
        var result = new ResultDetail

        {
            ResourceId = ResourceType.Halftime,
            SettlementStatusId = settlementStatusId
        };

        var request = new UncalculateFtRequest
        {
            ResultDetails = new List<ResultDetail> { result }
        };

        var actual = service.CreateBetStatusAfterUncalculateFt(request, "", "");

        Assert.Equal(expected, actual);
    }

    [Theory]
    [InlineData(true, false, false)]
    [InlineData(false, true, false)]
    [InlineData(false, false, true)]
    public void CreateBetStatusAfterUncalculateFt_ExistFglgBetType_ReturnRefundHt(bool isExistFgLg, bool isExistHtFgLg, bool isExistFgNg)
    {
        var result = new ResultDetail

        {
            ResourceId = ResourceType.Halftime,
            SettlementStatusId = SettlementStatus.Completed
        };

        var request = new UncalculateFtRequest
        {
            ResultDetails = new List<ResultDetail> { result },
            IsExistFgLg = isExistFgLg,
            IsExistHtFgLg = isExistHtFgLg,
            IsExistFgNg = isExistFgNg
        };

        halfTimeBetStatusService.GetBetStatus(Arg.Any<SettleBaseRequest>())
            .Returns("betStatus");

        var actual = service.CreateBetStatusAfterUncalculateFt(request, "", "");

        Assert.Equal("betStatus", actual);
    }
}