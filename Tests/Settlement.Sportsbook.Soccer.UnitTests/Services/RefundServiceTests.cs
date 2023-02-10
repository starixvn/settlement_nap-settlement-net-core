using Fanex.Data.Repository;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Models;
using Microsoft.AspNetCore.Http;
using Settlement.Sportsbook.Soccer.Services;
using NSubstitute;
using Settlement.Core.Constants;
using Xunit;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Core.Models;
using Microsoft.Extensions.Options;
using Fanex.Settlement.ScaleOut.Services;
using Fanex.Settlement.ScaleOut.Request;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class RefundServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly INapSession currentSession;

    private readonly IHttpContextAccessor accessor;

    private readonly IResourceService resourceService;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly ICreateCriteriaService createCriteriaService;

    private readonly IRefundService service;

    public RefundServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        currentSession = Substitute.For<INapSession>();
        accessor = Substitute.For<IHttpContextAccessor>();
        resourceService = Substitute.For<IResourceService>();
        createCriteriaService = Substitute.For<ICreateCriteriaService>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        var context = new DefaultHttpContext();
        context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
        accessor.HttpContext = context;
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SoccerAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        var appSettings = new AppSettingsKey { SiteDbServer = new List<string> { "DB01", "DB02", "DB03" } };
        var option = Options.Create(appSettings);
        service = new RefundServiceImp(repository, mapper, accessor, option, createCriteriaService, currentSession, scaleOutSettleService);
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
        var request = new CheckingMarkedTicketsRequest
        {
            MatchId = 12345,
        };

        var actual = await service.CheckMarkedTickets(request);

        Assert.Equal(result, actual.IsExistMarkedTicket);
        await repository.Received(executeTime).ExecuteAsync(Arg.Any<CheckingMarkedTicketsCriteria>());
    }

    [Theory]
    [InlineData(0, null, 3)]
    [InlineData(1, "Error", 0)]
    public async Task RefundRunningThirdPartyTickets_Always_ReturnsTrue(byte errorCode, string errorMsg, byte executeTime)
    {
        // Arrange
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>())
            .Returns(new ResultMessage { ErrorCode = errorCode, ErrorMessage = errorMsg });
        await repository.ExecuteAsync(Arg.Any<RefundRunningThirdPartyTicketCriteria>());
        // Act
        var result = await service.RefundRunningThirdPartyTickets(new RefundRunningThirdPartyTicketRequest());

        // Assert
        Assert.True(result.ErrCode == errorCode && result.ErrMsg == errorMsg);
        await repository.Received(executeTime).ExecuteAsync(Arg.Any<RefundRunningThirdPartyTicketCriteria>());
    }

    [Theory]
    [InlineData(0, null, 3)]
    [InlineData(1, "Error", 0)]
    public async Task MoveThirdPartyBetTickets_Always_ReturnsTrue(byte errorCode, string errorMsg, byte executeTime)
    {
        // Arrange
        var request = new MoveBetRequest
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
        var result = await service.MoveThirdPartyBetTickets(request);

        // Assert
        Assert.True(result.ErrCode == errorCode && result.ErrMsg == errorMsg);
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
        var query = new RefundRequest()
        {
            GoalRecord = "AH",
            ActionName = ActionType.CalculateAll,
        };
        var criteria = new RefundCriteria()
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
        var criteria = new RefundCriteria()
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