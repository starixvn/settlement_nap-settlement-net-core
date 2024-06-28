using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Models;
using Settlement.Services;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Services;
using MatchDetail = Settlement.FastMarkets.Models.MatchDetail;

namespace Settlement.FastMarkets.UnitTests.Services;

using Settlement.Services.SpecificService;

public class MatchDetailServiceTests
{
    private readonly IDynamicRepository dynamicRepository;
    private readonly IMatchDetailService service;

    public MatchDetailServiceTests()
    {
        dynamicRepository = Substitute.For<IDynamicRepository>();
        var goalIconService = Substitute.For<GoalIconService>();
        var refDataService = Substitute.For<IRefDataService>();
        var fastMarketResultService = Substitute.For<IFastMarketResultService>();
        fastMarketResultService.Result(Arg.Any<List<BetType>>(), Arg.Any<string>()).Returns("XML");
        dynamicRepository.Get<MarkedTickets>(Arg.Any<CriteriaBase>()).Returns(new MarkedTickets());
        var appSetting = new AppSettingsKey();
        var option = Options.Create(appSetting);
        service = new MatchDetailServiceImp(dynamicRepository, refDataService, goalIconService, fastMarketResultService, option);
    }

    [Fact]
    public async Task UpdateSettingMatch_Always_ReturnsWithErrorCodeAndErrorMsgFromDynamicRepositoryExecute()
    {
        // Arrange
        const int matchId = 100;
        var match = new MatchDetail();
        dynamicRepository.GetAsync<MatchDetail>(Arg.Is<GetMatchDetailCriteria>(x => x.MatchId == matchId))
            .Returns(match);

        // Act
        var actualMatch = await service.MatchInfo(matchId);

        // Assert
        Assert.Equal(match, actualMatch);
    }

    [Fact]
    public void GetMatch_Always_ReturnsNotNull()
    {
        // Act
        var match = service.CheckingMarkedTickets(new Requests.CheckingMarkedTicketsRequest());

        // Assert
        Assert.NotNull(match);
    }
}