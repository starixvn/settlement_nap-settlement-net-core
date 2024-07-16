using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Criteria.Basketball;
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
    private readonly IRefDataService refDataService;

    public AioServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        refDataService = Substitute.For<IRefDataService>();
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
    public async Task GetMatch_MatchFantasy_ReturnsRelatedMatches()
    {
        // Arrange
        var request = new GetMatchRequest();
        refDataService.GetLeagueName(Arg.Any<int>()).Returns("fantasy match");
        var fakeMatch = new Models.MatchDetail { MatchId = 1, RefDataService = refDataService };
        repository.GetAsync<Models.MatchDetail>(Arg.Any<ICriteria>()).Returns(fakeMatch);

        var listResultDetail = new List<Models.ResultDetail> {
            new() { ResourceId="00" }
        };
        var resultAndTicket = (listResultDetail, new TicketCounts());
        multipleServerAioService.FetchResultDetails(Arg.Any<GetResultDetailCriteria>(), Arg.Any<int>()).Returns(resultAndTicket);
        validateApiKeyService.GetApiKey(Arg.Any<string>()).Returns("");
        validateApiKeyService.CriteriaName(Arg.Any<GetMatchRequest>(), $"-{ApiKeyConstant.ResultDetailKey}").Returns(new GetResultDetailCriteria());
        repository.FetchMultipleAsync<FantasyMatchDetail, FantasyRelatedMatch>(Arg.Any<GetFantasyMatchCriteria>()).Returns((new List<FantasyMatchDetail>(), new List<FantasyRelatedMatch>
        {
            new()
        }));

        // Act
        var result = await service.GetMatch(request);

        // Assert

        Assert.True(result.MatchDetail.IsFantasy);
        Assert.Single(result.FantasyMatch.RelatedMatches);
    }

    [Fact]
    public async Task GetMatch_MatchDetailProviderCount_ReturnsProviderCount()
    {
        // Arrange
        var request = new GetMatchRequest();
        var fakeMatch = new Models.MatchDetail { MatchId = 1, SportType = SportType.Badminton };
        repository.GetAsync<Models.MatchDetail>(Arg.Any<ICriteria>()).Returns(fakeMatch);

        var listResultDetail = new List<Models.ResultDetail> {
            new() { ResourceId="00" }
        };
        var resultAndTicket = (listResultDetail, new TicketCounts());
        multipleServerAioService.FetchResultDetails(Arg.Any<GetResultDetailCriteria>(), Arg.Any<int>()).Returns(resultAndTicket);
        validateApiKeyService.GetApiKey(Arg.Any<string>()).Returns("");
        validateApiKeyService.CriteriaName(Arg.Any<GetMatchRequest>(), $"-{ApiKeyConstant.ResultDetailKey}").Returns(new GetResultDetailCriteria());
        repository.FetchAsync<ProviderInfo>(Arg.Any<Settlement.Criteria.GetProviderInfoCriteria>()).Returns(new List<ProviderInfo> { new() });

        // Act
        var result = await service.GetMatch(request);

        // Assert
        Assert.Equal(1, result.MatchDetail.ProviderCount);
    }

    [Fact]
    public async Task GetMatch_GetResultDetailsOnGameSession_ReturnsCorrectResultDetails()
    {
        // Arrange
        short gameSession = 3;
        var request = new GetMatchRequest();
        var fakeMatch = new Models.MatchDetail { MatchId = 1, SportType = SportType.Tennis, GameSession = gameSession };
        repository.GetAsync<Models.MatchDetail>(Arg.Any<ICriteria>()).Returns(fakeMatch);

        var listResultDetail = new List<Models.ResultDetail> {
            new() { ResourceId="00" },
            new() { ResourceId="01" },
            new() { ResourceId="02" },
            new() { ResourceId="03" },
            new() { ResourceId="04" }
        };
        var resultAndTicket = (listResultDetail, new TicketCounts());
        multipleServerAioService.FetchResultDetails(Arg.Any<GetResultDetailCriteria>(), Arg.Any<int>()).Returns(resultAndTicket);
        validateApiKeyService.GetApiKey(Arg.Any<string>()).Returns("");
        validateApiKeyService.CriteriaName(Arg.Any<GetMatchRequest>(), $"-{ApiKeyConstant.ResultDetailKey}").Returns(new GetResultDetailCriteria());
        repository.FetchAsync<ProviderInfo>(Arg.Any<Settlement.Criteria.GetProviderInfoCriteria>()).Returns(new List<ProviderInfo> { new() });
        repository.FetchAsync<ResourceIndex>(Arg.Any<GetResourceIndexCriteria>()).Returns(new List<ResourceIndex> {
            new() { ResourceId="00" },
            new() { ResourceId="01",IntervalNo = 1 },
            new() { ResourceId="02", IntervalNo = 2 },
            new() { ResourceId="03", IntervalNo = 3 },
            new() { ResourceId="04", IntervalNo = 4}
        });

        // Act
        var result = await service.GetMatch(request);

        // Assert
        Assert.Equal(gameSession + 1, result.ResultDetails.Count);
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

    [Fact]
    public async Task Settle_HasFantasyMatchValidateFail_ReturnFailResult()
    {
        // Arrange
        repository.FetchMultipleAsync<FantasyMatchDetail, FantasyRelatedMatch>(Arg.Any<GetFantasyMatchCriteria>()).Returns((new List<FantasyMatchDetail>(), new List<FantasyRelatedMatch>
        {
            new() { SettlementStatusId = 1,ResourceId = "00" }
        }));
        var request = new SettleRequest
        {
            IsFantasy = true,
            ActionName = "CAL",
            SelectedResources = new List<ResourceItem>
            {
                new()
                {
                    ResourceId = "00"
                }
            }
        };

        // Act
        var result = await service.Settle(request);

        // Assert
        Assert.Equal(ErrorCode.ParentFantasyNotCalc, result.ErrCode);
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