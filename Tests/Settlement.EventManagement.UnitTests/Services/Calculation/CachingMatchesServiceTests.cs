using AutoMapper;
using Fanex.Caching;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Models.Calculation;
using Settlement.EventManagement.Services.Calculation;

namespace Settlement.EventManagement.UnitTests.Services.Calculation;

public class CachingMatchesServiceTests
{
    private readonly ICacheService cacheService;

    private readonly IDynamicRepository repository;

    private readonly CachingMatchesService service;

    public CachingMatchesServiceTests()
    {
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<EventManagementAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        cacheService = Substitute.For<ICacheService>();
        repository = Substitute.For<IDynamicRepository>();
        service = new CachingMatchesServiceImp(cacheService, repository, mapper);
    }

    [Theory]
    [InlineData(false, "123", CacheSettings.Keys.WaitingListCacheKey + "-123")]
    [InlineData(true, "1234", CacheSettings.Keys.WaitingAutoPayoutCacheKey + "-1234")]
    public void SetToCache_Always_SetLongAndShortCache(bool autoCalc, string leagueId, string logKey)
    {
        service.SetToCache(new List<Match>(), leagueId, autoCalc);

        cacheService.Received().SetAsync(logKey, Arg.Any<List<CalculateMatchWaiting>>(), Arg.Any<CacheItemOptions>());
        cacheService.Received().SetAsync(logKey + "-long", Arg.Any<List<CalculateMatchWaiting>>(), Arg.Any<CacheItemOptions>());
    }

    [Theory]
    [InlineData(false, "123", CacheSettings.Keys.WaitingListCacheKey + "-123")]
    [InlineData(true, "1234", CacheSettings.Keys.WaitingAutoPayoutCacheKey + "-1234")]
    public void GetShortCache_Always_CallServiceWithCorrectParams(bool autoCalc, string leagueId, string logKey)
    {
        service.GetShortCache(leagueId, autoCalc);

        cacheService.Received().GetAsync<List<CalculateMatchWaiting>>(logKey);
    }

    [Theory]
    [InlineData(false, "123", CacheSettings.Keys.WaitingListCacheKey + "-123-long")]
    [InlineData(true, "1234", CacheSettings.Keys.WaitingAutoPayoutCacheKey + "-1234-long")]
    public void GetLongCache_Always_CallServiceWithCorrectParams(bool autoCalc, string leagueId, string logKey)
    {
        service.GetLongCache(leagueId, autoCalc);

        cacheService.Received().GetAsync<List<CalculateMatchWaiting>>(logKey);
    }

    [Fact]
    public async Task GetReferenceActions_NotExistMatchId_ReturnListEmpty()
    {
        var result = await service.GetReferenceActions(new List<int>());

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetReferenceActions_ExistMatchId_ReturnListReference()
    {
        var list = new List<ReferenceAction>
        {
            new() { MatchId = 1, ActionId = 1 },
            new() { MatchId = 2 },
            new() { MatchId = 1, ActionId = 2 }
        };

        repository.FetchAsync<ReferenceAction>(Arg.Any<GetReferenceActionCriteria>()).Returns(list);
        var result = await service.GetReferenceActions(new List<int> { 1, 2 });

        Assert.Equal(2, result[1].Count);
        Assert.Single(result[2]);
    }
}