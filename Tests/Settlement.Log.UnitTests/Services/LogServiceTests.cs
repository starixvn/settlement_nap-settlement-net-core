using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Log.Criteria;
using Settlement.Log.Models;
using Settlement.Log.Requests;
using Settlement.Log.Services;
using LogService = Settlement.Log.Services.LogService;

namespace Settlement.Log.UnitTests.Services;

public class LogServiceTests
{
    private readonly LogDetailService logDetailService;
    private readonly IDynamicRepository repository;
    private readonly LogService service;

    public LogServiceTests()
    {
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<LogAutoMapper>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        var balanceUpService = Substitute.For<IBalanceUpService>();
        logDetailService = Substitute.For<LogDetailService>();
        repository = Substitute.For<IDynamicRepository>();
        var refDataService = Substitute.For<IRefDataService>();

        var balanceUpDay = new DateTime();
        var balanceUp = new BalanceUp
        {
            BalanceUpDay = balanceUpDay
        };

        balanceUpService.GetBalanceUpDay().Returns(balanceUp);

        service = new Log.Services.LogServiceImp(repository, balanceUpService, logDetailService, mapper, refDataService);
    }

    [Fact]
    public async Task GetLog_ByMatchCodeAndProductTypeAndExistLog_ReturnsListLogModelsAndInvokeGetLogDetailByMatchAndProduct()
    {
        // Arrange
        var request = new LogRequest
        {
            MatchCode = "MatchCode",
            ProductType = "BBD"
        };

        var fakeListLogDetails = new List<LogDetailsModels>
            {
                new() {  Action = "Cal"}
            };

        var fakeList = new List<LogModel>
            {
                new() { MatchId = 1}
            };

        repository.FetchAsync<LogModel>(Arg.Any<GetSettlementLogCriteria>()).Returns(fakeList);
        logDetailService.GetLogDetailByMatchAndProduct(Arg.Any<int>(), Arg.Any<string>()).Returns(fakeListLogDetails);

        // Act
        var logs = await service.GetLog(request);

        // Assert
        await logDetailService.Received().GetLogDetailByMatchAndProduct(Arg.Any<int>(), Arg.Any<string>());
        Assert.Single(logs);
    }
}