using AutoMapper;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Constants;
using Settlement.Models;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Models;
using Settlement.Sportsbook.OtherSports.Requests;

namespace Settlement.Sportsbook.OtherSports.UnitTests.Services;

public class SettlementActionsServiceTests
{
    private readonly SettlementActionsService service;

    private readonly MultipleServerService multipleServerService;

    private readonly GenerateService generateService;

    public SettlementActionsServiceTests()
    {
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<OtherSportsAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        var currentSession = Substitute.For<INapSession>();
        generateService = Substitute.For<GenerateService>();
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

        service = new SettlementActionsServiceImp(accessor, currentSession, mapper, generateService, multipleServerService);
    }

    [Fact]
    public async Task Calculate_Always_ExecuteAndReturnResult()
    {
        var resultFailed = new Result
        {
            ErrMsg = "Error Message",
            ErrCode = 100
        };
        multipleServerService.Calculate(Arg.Any<CalculateCriteria>(), Arg.Any<ScoreSetModel>()).Returns(resultFailed);

        var result = await service.Calculate(new CalculateRequest());

        Assert.False(result.IsSuccessful);
        generateService.DidNotReceive().GenerateBetStatus(Arg.Any<CalculateRequest>());
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
        multipleServerService.Calculate(Arg.Any<CalculateCriteria>(), Arg.Any<ScoreSetModel>()).Returns(resultFailed);
        generateService.GenerateBetStatus(Arg.Any<CalculateRequest>()).Returns(new ScoreSetModel());

        var result = await service.CalculateWithResultDetail(new CalculateRequest { Action = ActionType.RefundHalfTime });

        Assert.False(result.IsSuccessful);
    }

    [Fact]
    public async Task CalculateWithResultDetail_ExistHedgeMatch_ExecuteTwoTime()
    {
        generateService.GenerateBetStatus(Arg.Any<CalculateRequest>()).Returns(new ScoreSetModel());
        multipleServerService.Calculate(Arg.Any<CalculateCriteria>(), Arg.Any<ScoreSetModel>()).Returns(new Result());

        await service.CalculateWithResultDetail(new CalculateRequest { Action = ActionType.RefundHalfTime, HedgeMatchId = 1 });

        await multipleServerService.Received(2).Calculate(Arg.Any<CalculateCriteria>(), Arg.Any<ScoreSetModel>());
    }
}