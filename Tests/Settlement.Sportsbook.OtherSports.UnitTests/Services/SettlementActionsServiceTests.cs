using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Models;
using Settlement.Sportsbook.OtherSports.Requests;

namespace Settlement.Sportsbook.OtherSports.UnitTests.Services;

public class SettlementActionsServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly SettlementActionsService service;

    private readonly MultipleServerService multipleServerService;

    private readonly IBetStatusService betStatusService;

    public SettlementActionsServiceTests()
    {
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<OtherSportsAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        repository = Substitute.For<IDynamicRepository>();
        var currentSession = Substitute.For<INapSession>();
        betStatusService = Substitute.For<IBetStatusService>();
        multipleServerService = Substitute.For<MultipleServerService>();
        var accessor = Substitute.For<IHttpContextAccessor>();
        var context = new DefaultHttpContext
        {
            Connection =
                {
                    RemoteIpAddress = new System.Net.IPAddress(1)
                }
        };
        accessor.HttpContext = context;

        service = new SettlementActionsServiceImp(repository, accessor, currentSession, mapper, betStatusService, multipleServerService);
    }

    [Fact]
    public async Task Calculate_Always_ExecuteAndReturnResult()
    {
        var resultFailed = new Result
        {
            ErrMsg = "Error Message",
            ErrCode = 100
        };
        multipleServerService.Calculate(Arg.Any<CalculateCriteria>()).Returns(resultFailed);

        var result = await service.Calculate(new CalculateRequest());

        Assert.False(result.IsSuccessful);
    }

    [Fact]
    public async Task Refund_Always_ExecuteAndReturnResult()
    {
        var resultFailed = new Result
        {
            ErrMsg = "Error Message",
            ErrCode = 100
        };
        multipleServerService.Refund(Arg.Any<RefundCriteria>()).Returns(resultFailed);

        var result = await service.Refund(new RefundRequest());

        Assert.False(result.IsSuccessful);
    }

    [Fact]
    public async Task Refund_ExistHedgeMatch_ExecuteTwoTime()
    {
        var request = new RefundRequest
        {
            HedgeMatchId = 1
        };
        multipleServerService.Refund(Arg.Any<RefundCriteria>()).Returns(new Result());

        await service.Refund(request);

        await multipleServerService.Received(2).Refund(Arg.Any<RefundCriteria>());
    }

    [Fact]
    public async Task RefundParlay_Always_ExecuteAndReturnResult()
    {
        var resultFailed = new Result
        {
            ErrMsg = "Error Message",
            ErrCode = 100
        };
        multipleServerService.RefundParlay(Arg.Any<ParlayCriteria>()).Returns(resultFailed);

        var result = await service.RefundParlay(new RefundParlayRequest());

        Assert.False(result.IsSuccessful);
    }

    [Fact]
    public async Task RefundParlay_ExistHedgeMatch_ExecuteTwoTime()
    {
        var request = new RefundParlayRequest
        {
            HedgeMatchId = 1
        };
        multipleServerService.RefundParlay(Arg.Any<ParlayCriteria>()).Returns(new Result());

        await service.RefundParlay(request);

        await multipleServerService.Received(2).RefundParlay(Arg.Any<ParlayCriteria>());
    }

    [Fact]
    public async Task CheckMarkedTickets_Always_ExecuteAndReturnResult()
    {
        multipleServerService.CheckMarkedTickets(Arg.Any<CheckingMarkedTicketsCriteria>()).Returns(new MarkedTickets { IsExistMarkedTicket = true });

        var result = await service.CheckMarkedTickets(new CheckingMarkedTicketsRequest());

        Assert.True(result.IsExistMarkedTicket);
    }

    [Fact]
    public async Task CalculateWithResultDetail_Always_CreateCriteriaAndExecute()
    {
        var resultFailed = new Result
        {
            ErrMsg = "Error Message",
            ErrCode = 100
        };
        multipleServerService.Calculate(Arg.Any<CalculateCriteria>()).Returns(resultFailed);
        betStatusService.GenerateBetStatus(Arg.Any<CalculateRequest>()).Returns(new ScoreSetModel());

        var result = await service.CalculateWithResultDetail(new CalculateRequest { Action = ActionType.RefundHalfTime });

        Assert.False(result.IsSuccessful);
    }

    [Fact]
    public async Task CalculateWithResultDetail_ExistHedgeMatch_ExecuteTwoTime()
    {
        betStatusService.GenerateBetStatus(Arg.Any<CalculateRequest>()).Returns(new ScoreSetModel());
        multipleServerService.Calculate(Arg.Any<CalculateCriteria>()).Returns(new Result());

        await service.CalculateWithResultDetail(new CalculateRequest { Action = ActionType.RefundHalfTime, HedgeMatchId = 1 });

        await multipleServerService.Received(2).Calculate(Arg.Any<CalculateCriteria>());
    }
}