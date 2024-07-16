using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.GetMatch;

using Soccer.Services.GetMatch;

public class FetchDataServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly IMergeDataService mergeDataService;

    private readonly IFetchDataService service;

    public FetchDataServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        mergeDataService = Substitute.For<IMergeDataService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SoccerAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        var appSettings = new AppSettingsKey { SiteDbServer = ["DB01", "DB02", "DB03"] };
        var option = Options.Create(appSettings);
        service = new FetchDateServiceImp(repository, mapper, option, mergeDataService);
    }

    [Fact]
    public void GetMatchInfo_Always_ReturnsNotNull()
    {
        // Arrange
        IEnumerable<Models.MatchDetail> matches = new List<Models.MatchDetail> {
            new() { MatchId = 123 }
        };
        var results = new IEnumerable<object>[4];

        results[0] = matches;
        results[1] = Substitute.For<IEnumerable<ChildMatchModel>>();
        repository.FetchMultipleAsync(Arg.Any<CriteriaBase>(), Arg.Any<Type[]>()).Returns(results);

        // Act
        var match = service.GetMatchInfo(new GetMatchRequest { MatchId = 1 });

        // Assert
        Assert.NotNull(match);
    }

    [Fact]
    public void GetMultiServersBetDaq_Always_MultiServer()
    {
        // Arrange
        var betDaq = new BetDaq();
        repository.GetAsync<BetDaq>(Arg.Any<BetDaqCheckingCriteria>()).Returns(betDaq);

        // Act
        service.GetMultiServersBetDaq(new BetDaqCheckingCriteria { MatchId = 1 });

        // Assert
        repository.Received(3).GetAsync<BetDaq>(Arg.Any<BetDaqCheckingCriteria>());
        mergeDataService.DidNotReceive().MergeBetDaq(Arg.Any<BetDaq>(), Arg.Any<List<BetDaq>>());
    }

    [Fact]
    public void GetMultiServersBetDaq_ExistConflictData_MergeData()
    {
        // Arrange
        var centralBetDaq = new BetDaq();
        var criteria = new BetDaqCheckingCriteria();
        var siteBerDaq = new BetDaq { IsExcludeBetDaq = true };
        repository.GetAsync<BetDaq>(criteria).Returns(centralBetDaq, siteBerDaq);

        // Act
        service.GetMultiServersBetDaq(criteria);

        // Assert
        mergeDataService.Received().MergeBetDaq(Arg.Any<BetDaq>(), Arg.Any<List<BetDaq>>());
    }

    [Fact]
    public void GetMultiServersBetFair_Always_MultiServer()
    {
        // Arrange
        var betFair = new BetFair();
        repository.GetAsync<BetFair>(Arg.Any<BetFairCheckingCriteria>()).Returns(betFair);

        // Act
        service.GetMultiServersBetFair(new BetFairCheckingCriteria { MatchId = 1 });

        // Assert
        repository.Received(3).GetAsync<BetFair>(Arg.Any<BetFairCheckingCriteria>());
        mergeDataService.DidNotReceive().MergeBetFair(Arg.Any<BetFair>(), Arg.Any<List<BetFair>>());
    }

    [Fact]
    public void GetMultiServersBetFair_ExistConflictData_MergeData()
    {
        // Arrange
        var centralBetFair = new BetFair();
        var criteria = new BetFairCheckingCriteria();
        var siteBetFair = new BetFair { IsExcludeBetFair = true };
        repository.GetAsync<BetFair>(criteria).Returns(centralBetFair, siteBetFair);

        // Act
        service.GetMultiServersBetFair(criteria);

        // Assert
        mergeDataService.Received().MergeBetFair(Arg.Any<BetFair>(), Arg.Any<List<BetFair>>());
    }

    [Fact]
    public void GetEarlyTicketDetails_Always_GetDataFromMultiServer()
    {
        // Arrange
        var multipleTicketDetails = ValueTuple.Create<IEnumerable<ResultDetailModel>, IEnumerable<TicketCounts>>(new List<ResultDetailModel>(), new List<TicketCounts>());
        repository.FetchMultipleAsync<ResultDetailModel, TicketCounts>(Arg.Any<GetEarlyTicketInfoCriteria>()).Returns(multipleTicketDetails);

        // Act
        service.GetEarlyTicketDetails(new GetResultDetailEarlyCriteria { MatchId = 1 });

        // Assert
        repository.Received(3).FetchMultipleAsync<ResultDetailModel, TicketCounts>(Arg.Any<GetEarlyTicketInfoCriteria>());
        mergeDataService.Received().MergeEarlyTicketDetails(Arg.Any<List<(List<ResultDetailModel>, TicketCounts)>>());
    }

    [Theory]
    [InlineData(true, false, true, 1)]
    [InlineData(true, true, true, 1)]
    [InlineData(false, true, false, 2)]
    [InlineData(false, false, true, 3)]
    [InlineData(false, false, false, 3)]
    public void IsDeterminedHedgeMatch_Always_GetDataFromMultiServer(bool isDetermined, bool isDeterminedSecond, bool isDeterminedThird, int callTime)
    {
        // Arrange
        var hedgeMatch = new DeterminedHedgeMatch { IsDeterminedHedgeMatch = isDetermined };
        var hedgeMatchSecond = new DeterminedHedgeMatch { IsDeterminedHedgeMatch = isDeterminedSecond };
        var hedgeMatchThird = new DeterminedHedgeMatch { IsDeterminedHedgeMatch = isDeterminedThird };
        repository.GetAsync<DeterminedHedgeMatch>(Arg.Any<GetHedgeMatchDeterminedInfo>())
            .Returns(hedgeMatch, hedgeMatchSecond, hedgeMatchThird);

        // Act
        service.IsDeterminedHedgeMatch(1);

        // Assert
        repository.Received(callTime).GetAsync<DeterminedHedgeMatch>(Arg.Any<GetHedgeMatchDeterminedInfo>());
    }
}