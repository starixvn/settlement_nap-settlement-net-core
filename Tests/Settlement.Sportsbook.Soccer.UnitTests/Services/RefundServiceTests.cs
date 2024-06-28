using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Constants;
using Settlement.Models;
using Settlement.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class RefundServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly ICreateCriteriaService createCriteriaService;

    private readonly IRefundService service;

    private readonly LogService logService;

    private readonly AppSettingsKey appSettings = new() { SiteDbServer = ["DB01", "DB02", "DB03"] };

    public RefundServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        var accessor = Substitute.For<IHttpContextAccessor>();
        createCriteriaService = Substitute.For<ICreateCriteriaService>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        logService = Substitute.For<LogService>();
        var context = new DefaultHttpContext
        {
            Connection =
            {
                RemoteIpAddress = new System.Net.IPAddress(1)
            }
        };
        accessor.HttpContext = context;

        var option = Options.Create(appSettings);
        service = new RefundServiceImp(repository, accessor, option, createCriteriaService, scaleOutSettleService, logService);
    }

    [Theory]
    [InlineData(true, 1)]
    [InlineData(false, 3)]
    public async Task CheckMarkedTickets_Always_ReturnCorrectResult(bool result, byte executeTime)
    {
        await repository.ExecuteAsync(Arg.Do<CheckingMarkedTicketsCriteria>(x =>
        {
            x.IsExistMarkedTicket = result;
        }));
        var criteria = new CheckingMarkedTicketsCriteria
        {
            MatchId = 12345
        };

        var actual = await service.CheckMarkedTickets(criteria);

        Assert.Equal(result, actual.IsExistMarkedTicket);
        await repository.Received(executeTime).ExecuteAsync(Arg.Any<CheckingMarkedTicketsCriteria>());
    }

    [Fact]
    public async Task RefundRunningThirdPartyTickets_PassedValidate_WriteLogAndSettle()
    {
        // Arrange
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>())
            .Returns(new ResultMessage { ErrorCode = 0, ErrorMessage = string.Empty });
        await repository.ExecuteAsync(Arg.Any<RefundRunningThirdPartyTicketCriteria>());
        // Act
        await service.RefundRunningThirdPartyTickets(new RefundRunningThirdPartyTicketRequest());

        // Assert
        await logService.Received().WriteLog(Arg.Any<int>(), Arg.Any<string>());
        await repository.Received(appSettings.SiteDbServer.Count).ExecuteAsync(Arg.Any<RefundRunningThirdPartyTicketCriteria>());
    }

    [Fact]
    public async Task RefundRunningThirdPartyTickets_FailedValidate_StopProgress()
    {
        // Arrange
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>())
            .Returns(new ResultMessage { ErrorCode = 1, ErrorMessage = "error" });
        await repository.ExecuteAsync(Arg.Any<RefundRunningThirdPartyTicketCriteria>());
        // Act
        var result = await service.RefundRunningThirdPartyTickets(new RefundRunningThirdPartyTicketRequest());

        // Assert
        Assert.False(result.IsSuccessful);
        await logService.DidNotReceive().WriteLog(Arg.Any<int>(), Arg.Any<string>());
        await repository.DidNotReceive().ExecuteAsync(Arg.Any<RefundRunningThirdPartyTicketCriteria>());
    }

    [Theory]
    [InlineData(0, null, 3)]
    [InlineData(1, "Error", 0)]
    public async Task MoveThirdPartyBetTickets_Always_ReturnsTrue(byte errorCode, string errorMsg, byte executeTime)
    {
        // Arrange
        var criteria = new MoveThirdPartyBetTicketCriteria
        {
            MatchId = 123,
            NewMatchId = 456,
            NewMatchCode = "ABC",
            ActionName = string.Empty
        };
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>())
            .Returns(new ResultMessage { ErrorCode = errorCode, ErrorMessage = errorMsg });
        await repository.ExecuteAsync(Arg.Do<MoveThirdPartyBetTicketCriteria>(x => { x.ErrCode = errorCode; x.ErrMsg = errorMsg; }));

        // Act
        var result = await service.MoveThirdPartyBetTickets(criteria);

        // Assert
        Assert.True(result.ErrCode == errorCode && result.ErrMsg == errorMsg);
        await logService.Received(result.IsSuccessful ? 1 : 0).WriteLog(Arg.Any<int>(), Arg.Any<string>());
        await repository.Received(executeTime).ExecuteAsync(Arg.Any<MoveThirdPartyBetTicketCriteria>());
    }

    [Theory]
    [InlineData(0, "", true)]
    [InlineData(1, "Error", false)]
    public async Task Refund_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result)
    {
        var criteria = new RefundCriteria
        {
            Action = ActionType.RefundAll
        };
        createCriteriaService.CreateRefundCriteria(Arg.Any<RefundRequest>()).Returns(criteria);
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>())
            .Returns(new ResultMessage { ErrorCode = errorCode, ErrorMessage = errorMsg });

        var actual = await service.Refund(new RefundRequest());

        Assert.Equal(result, actual.IsSuccessful);
    }

    [Fact]
    public async Task Refund_Always_UpdateMatch()
    {
        var query = new RefundRequest
        {
            GoalRecord = "AH",
            ActionName = ActionType.CalculateAll
        };
        var criteria = new RefundCriteria
        {
            Action = ActionType.CalculateAll
        };
        createCriteriaService.CreateRefundCriteria(Arg.Any<RefundRequest>()).Returns(criteria);
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());

        await service.Refund(query);

        await scaleOutSettleService.Received()
            .UpdateUnderSettlementFlag(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<string>());
        await scaleOutSettleService.Received().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
    }

    [Fact]
    public async Task Refund_ApplyHedgeMatch_ExecuteTwice()
    {
        var query = new RefundRequest
        {
            ActionName = ActionType.RefundHalfTime,
            IsApplyHedging = true,
            HedgeMatchId = 123
        };
        var criteria = new RefundCriteria
        {
            Action = ActionType.CalculateAll
        };
        createCriteriaService.CreateRefundCriteria(Arg.Any<RefundRequest>()).Returns(criteria);
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
        await repository.ExecuteAsync(Arg.Any<RefundCriteria>());

        await service.Refund(query);

        await repository.Received(6).ExecuteAsync(Arg.Any<RefundCriteria>());
    }
}