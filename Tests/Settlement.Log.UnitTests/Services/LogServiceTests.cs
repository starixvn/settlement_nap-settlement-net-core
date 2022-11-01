using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Log.Criteria;
using Settlement.Log.Models;
using Settlement.Log.Requests;
using Settlement.Log.Services;

namespace Settlement.Log.UnitTests.Services;

public class LogServiceTests
{
    private readonly IBalanceUpService balanceUpService;
    private readonly LogDetailService logDetailService;
    private readonly IDynamicRepository repository;
    private readonly IRefDataService refDataService;
    private readonly IMapper mapper;
    private LogService service;

    public LogServiceTests()
    {
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<LogAutoMapper>();
        var config = new MapperConfiguration(mapperConfig);
        mapper = new Mapper(config);

        balanceUpService = Substitute.For<IBalanceUpService>();
        logDetailService = Substitute.For<LogDetailService>();
        repository = Substitute.For<IDynamicRepository>();
        refDataService = Substitute.For<IRefDataService>();

        var balanceUpDay = new DateTime();
        var balanceUp = new BalanceUp
        {
            BalanceUpDay = balanceUpDay
        };

        balanceUpService.GetBalanceUpDay().Returns(balanceUp);
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
                new LogDetailsModels {  Action = "Cal"}
            };

        var fakeList = new List<LogModel>
            {
                new LogModel { MatchId = 1}
            };

        repository.FetchAsync<LogModel>(Arg.Any<GetSettlementLogCriteria>()).Returns(fakeList);
        logDetailService.GetLogDetailByMatchAndProduct(Arg.Any<int>(), Arg.Any<string>()).Returns(fakeListLogDetails);
        service = new Log.Services.LogServiceImp(repository, balanceUpService, logDetailService, mapper, refDataService);

        // Act
        var logs = await service.GetLog(request);

        // Assert
        await logDetailService.Received().GetLogDetailByMatchAndProduct(Arg.Any<int>(), Arg.Any<string>());
        Assert.Single(logs);
    }
}