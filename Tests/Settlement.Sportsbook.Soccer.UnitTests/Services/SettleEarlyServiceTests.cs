using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class SettleEarlyServiceTests
{
    private readonly ICreateCriteriaService createCriteriaService;

    private readonly IDynamicRepository repository;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly SettleEarlyService service;

    private readonly LogService logService;

    public SettleEarlyServiceTests()
    {
        createCriteriaService = Substitute.For<ICreateCriteriaService>();
        repository = Substitute.For<IDynamicRepository>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        logService = Substitute.For<LogService>();

        var appSettings = new AppSettingsKey { SiteDbServer = new List<string> { "DB01", "DB02" } };
        var appSettingsOptions = Options.Create(appSettings);
        service = new SettleEarlyServiceImp(
            createCriteriaService, appSettingsOptions,
            repository, scaleOutSettleService, logService);
    }

    [Fact]
    public async Task CalculateEarly_ExistError_StopProcess()
    {
        //arrange
        createCriteriaService.CreateCalculateEarlyCriteria(Arg.Any<SettleEarlyRequest>())
            .Returns(new CalculateEarlyCriteria());
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>())
            .Returns(new ResultMessage { ErrorCode = 1, ErrorMessage = "1" });

        //act
        var result = await service.CalculateEarly(new SettleEarlyRequest());

        //assert
        Assert.True(result.ErrCode == 1 && result.ErrMsg == "1");
        await scaleOutSettleService.DidNotReceive().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
    }

    [Fact]
    public async Task CalculateEarly_NotExistError_UpdateAndSettleMatch()
    {
        //arrange
        createCriteriaService.CreateCalculateEarlyCriteria(Arg.Any<SettleEarlyRequest>())
            .Returns(new CalculateEarlyCriteria());
        await logService.WriteLog(Arg.Any<int>(), Arg.Any<string>());
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>())
            .Returns(new ResultMessage());

        //act
        await service.CalculateEarly(new SettleEarlyRequest());

        //assert
        Received.InOrder(() =>
        {
            scaleOutSettleService.UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
            repository.ExecuteAsync(Arg.Any<CalculateEarlyCriteria>());
            repository.ExecuteAsync(Arg.Any<CalculateEarlyCriteria>());
        });
    }
}