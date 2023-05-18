using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Criteria;
using Settlement.Sportsbook.MoveTickets.Models;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services;

public class MoveActionServiceTests
{
    private readonly IDynamicRepository repository;
    private readonly LogService logService;
    private readonly ScaleOutSettleService scaleOutSettleService;
    private readonly MoveActionService service;

    public MoveActionServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        var currentSession = Substitute.For<INapSession>();
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
        var appSettings = new AppSettingsKey { SiteDbServer = new List<string> { "01", "02" } };
        var options = Options.Create(appSettings);
        service = new MoveActionServiceImp(repository, currentSession, accessor, logService,
            options, scaleOutSettleService);
    }

    [Fact]
    public async Task MoveTicket_ValidateFailed_StopProcessAndWriteLog()
    {
        var failedResult = new ResultMessage
        {
            ErrorCode = 1,
            ErrorMessage = "Error"
        };

        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(failedResult);

        var result = await service.MoveTicket(new MoveTicketCriteria { MatchId = 100 });

        logService.Received().ActionLog(100, "Error", Arg.Any<int>());
        Assert.Equal("Error", result.ErrMsg);
    }

    [Fact]
    public async Task MoveTicket_ValidatePassed_ExecuteAll()
    {
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
        repository.GetAsync<MoveTicketInfo>(Arg.Any<GetMoveTicketInfoCriteria>()).Returns(new MoveTicketInfo());

        var result = await service.MoveTicket(new MoveTicketCriteria());

        logService.Received(1).WriteLog(Arg.Any<int>(), Arg.Any<string>());
        await repository.Received(2).ExecuteAsync(Arg.Any<MoveTicketCriteria>());
        await repository.Received(1).ExecuteAsync(Arg.Any<UpdateChildMatchCriteria>());
        await repository.Received(1).ExecuteAsync(Arg.Any<UpdateChildMatchRemarkCriteria>());
        Assert.Equal(0, result.ErrCode);
    }
}