using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Models;
using Settlement.Services;
using Settlement.Sportsbook.MoveTickets.Criteria;
using Settlement.Sportsbook.MoveTickets.Requests;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services;

public class MoveRunningServiceTests
{
    private readonly IDynamicRepository repository;
    private readonly LogService logService;
    private readonly ScaleOutSettleService scaleOutSettleService;
    private readonly MoveRunningService service;

    public MoveRunningServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        var currentSession = Substitute.For<INapSession>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SportsbookMoveTicketAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        logService = Substitute.For<LogService>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        var accessor = Substitute.For<IHttpContextAccessor>();
        var context = new DefaultHttpContext
        {
            Connection =
            {
                RemoteIpAddress = new System.Net.IPAddress(1)
            }
        };
        accessor.HttpContext = context;
        var appSettings = new AppSettingsKey { SiteDbServer = ["01", "02"] };
        var options = Options.Create(appSettings);
        service = new MoveRunningServiceImp(repository, mapper, currentSession, accessor, logService,
            options, scaleOutSettleService);
    }

    [Fact]
    public async Task MoveRunningTickets_ValidateFailed_WriteLogAndReturn()
    {
        var resultMessage = new ResultMessage
        {
            ErrorCode = 1,
            ErrorMessage = "Error"
        };

        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(resultMessage);

        var result = await service.MoveRunningTickets(new MoveRunningTicketsRequest { MatchId = 100 });

        await logService.Received().ActionLog(100, "Error", Arg.Any<int>());
        Assert.Equal("Error", result.ErrMsg);
    }

    [Fact]
    public async Task MoveRunningTickets_ValidatePassed_ExecuteAll()
    {
        var resultMessage = new ResultMessage
        {
            ErrorCode = 0,
            ErrorMessage = string.Empty
        };
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(resultMessage);

        var result = await service.MoveRunningTickets(new MoveRunningTicketsRequest());

        repository.Received(2).Execute(Arg.Any<MoveRunningTicketsCriteria>());
        repository.Received().Execute(Arg.Any<CopyResultCriteria>());
        Assert.Equal(string.Empty, result.ErrMsg);
    }

    [Fact]
    public async Task ValidateMovingRunningTickets_Always_ReturnFromSP()
    {
        await repository.ExecuteAsync(Arg.Do<ValidateMatchesCriteria>(item =>
        {
            item.ErrMsg = "Error";
            item.ErrCode = 1;
        }));

        var result = await service.ValidateMovingRunningTickets(new ValidateMatchesRequest());

        Assert.Equal("Error", result.ErrMsg);
        Assert.Equal(1, result.ErrCode);
    }
}