using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Models;
using Settlement.Services;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;

namespace Settlement.Sportsbook.Aio.UnitTests.Services;

public class AioServiceTests
{
    private readonly IDynamicRepository repository;
    private readonly ICreateQueryService createQueryService;
    private readonly IValidateApiKeyService validateApiKeyService;
    private readonly MultipleServerAioService multipleServerAioService;
    private readonly IAioService service;

    public AioServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        var refDataService = Substitute.For<IRefDataService>();
        createQueryService = Substitute.For<ICreateQueryService>();
        var mapperFactory = Substitute.For<IMapperFactory>();
        multipleServerAioService = Substitute.For<MultipleServerAioService>();
        validateApiKeyService = Substitute.For<IValidateApiKeyService>();
        var basketballEventStatusService = Substitute.For<BasketballEventStatusService>();

        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SportsbookAioAutoMapperProfile>();
        service = new AioServiceImp(repository, refDataService,
            mapperFactory, validateApiKeyService, createQueryService, multipleServerAioService, basketballEventStatusService);
    }

    [Fact]
    public async Task GetRecalResult_Always_ReturnResultDetailList()
    {
        var request = new GetRecalResultRequest();
        repository.FetchAsync<Models.ResultDetail>(Arg.Any<GetRecalResultCriteria>()).Returns(new List<Models.ResultDetail> { new() });

        var actual = await service.GetRecalResult(request);

        createQueryService.Received().QueryRecalResult(request);
        Assert.Single(actual);
    }

    [Fact]
    public async Task GetMatch_Always_ReturnsExpectedMatchModel()
    {
        // Arrange
        var request = new GetMatchRequest();

        var fakeMatch = new Models.MatchDetail { MatchId = 1 };
        var hedgeMatch = new HedgeMatchDetail { MatchId = 2 };
        repository.GetAsync<Models.MatchDetail>(Arg.Any<ICriteria>()).Returns(fakeMatch);

        var listResultDetail = new List<Models.ResultDetail> {
            new() { ResourceId="00" }
        };
        var resultAndTicket = (listResultDetail, new TicketCounts());
        multipleServerAioService.FetchResultDetails(Arg.Any<GetResultDetailCriteria>(), Arg.Any<int>()).Returns(resultAndTicket);
        validateApiKeyService.GetApiKey(Arg.Any<string>()).Returns("");
        validateApiKeyService.CriteriaName(Arg.Any<GetMatchRequest>(), $"-{ApiKeyConstant.ResultDetailKey}").Returns(new GetResultDetailCriteria());
        repository.GetAsync<HedgeMatchDetail>(Arg.Any<GetHedgeMatchCriteria>()).Returns(hedgeMatch);
        // Act
        var result = await service.GetMatch(request);

        // Assert
        var expectedModel = new AioMatch
        {
            MatchDetail = fakeMatch,
            ResultDetails = listResultDetail,
            HedgeMatchDetail = hedgeMatch,
            TicketCounts = new TicketCounts(),
            Permission = new Permission(),
            ExternalResults = []
        };

        Assert.Equal(expectedModel.MatchDetail.MatchId, result.MatchDetail.MatchId);
    }

    [Fact]
    public async Task CheckMarkedTickets_Always_CallMultipleService()
    {
        await service.CheckMarkedTickets(new CheckMarkedTicketsRequest());

        await multipleServerAioService.Received().CheckMarkedTickets(Arg.Any<CheckMarkedTicketsRequest>());
    }

    [Theory]
    [InlineData(0, "", true)]
    [InlineData(1, "Error", false)]
    public async Task VerifyNoRunningOdds_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result)
    {
        await repository.ExecuteAsync(Arg.Do<VerificationCriteria>(x =>
        {
            x.ErrCode = errorCode;
            x.ErrMsg = errorMsg;
        }));

        var request = new CheckRunningOddsRequest
        {
            SelectedResources = []
        };
        createQueryService.CreateResources(Arg.Any<List<CheckOddsItem>>()).Returns("xml");
        var actual = await service.VerifyNoRunningOdds(request);

        Assert.Equal(result, actual.IsSuccessful);
    }

    [Theory]
    [InlineData(0, "", true)]
    [InlineData(1, "Error", false)]
    public async Task SaveScore_Always_CallInOrderAllRelatedMethods(int errorCode, string errorMsg, bool result)
    {
        createQueryService.QuerySaveScore(Arg.Any<SaveScoreRequest>()).Returns(new SaveScoreRequest());
        validateApiKeyService.CreateNonQueryCommand(Arg.Any<SaveScoreRequest>(), Arg.Any<string>())
            .Returns(new SaveScoreCriteria());

        await repository.ExecuteAsync(Arg.Do<SaveScoreCriteria>(x =>
        {
            x.ErrCode = errorCode;
            x.ErrMsg = errorMsg;
        }));

        var actual = await service.SaveScore(new SaveScoreRequest());

        Assert.Equal(result, actual.IsSuccessful);
    }

    [Fact]
    public async Task SettleChildMatch_Always_CallMultipleService()
    {
        await service.SettleChildMatch(new SettleChildMatchRequest());

        await multipleServerAioService.Received().SettleChildMatch(Arg.Any<SettleChildMatchRequest>());
    }

    [Fact]
    public async Task Settle_Always_CallMultipleService()
    {
        await service.Settle(new SettleRequest());

        await multipleServerAioService.Received().Settle(Arg.Any<SettleRequest>());
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task ResultSetting_Always_ReturnCorrectResult(bool result)
    {
        var criteria = new ResultSettingCriteria { IsEnabled = result };
        createQueryService.QueryChangeSetting(Arg.Any<ResultSettingRequest>()).Returns(criteria);
        await repository.ExecuteAsync(Arg.Any<ResultSettingCriteria>());

        var actual = await service.ResultSetting(new ResultSettingRequest());

        Assert.Equal(result, actual);
    }
}