using Fanex.Caching;
using Settlement.Core.Constants;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.UnitTests.Services;

public class CachingMatchesServiceTests
{
    private readonly ICacheService cacheService;

    private readonly CachingMatchesService service;

    public CachingMatchesServiceTests()
    {
        cacheService = Substitute.For<ICacheService>();
        service = new CachingMatchesServiceImp(cacheService);
    }

    [Theory]
    [InlineData("123", CacheServiceKey.WaitingBetBuilderCacheKey + "-123")]
    [InlineData("1234,567", CacheServiceKey.WaitingBetBuilderCacheKey + "-1234,567")]
    public void SetToCache_Always_SetLongAndShortCache(string leagueIds, string logKey)
    {
        service.SetToCache(leagueIds, new List<MatchDetailModel>());

        cacheService.Received().SetAsync(logKey, Arg.Any<List<MatchDetailModel>>(), Arg.Any<CacheItemOptions>());
        cacheService.Received().SetAsync(logKey + "-longCaching", Arg.Any<List<MatchDetailModel>>(), Arg.Any<CacheItemOptions>());
    }

    [Theory]
    [InlineData("123", CacheServiceKey.WaitingBetBuilderCacheKey + "-123")]
    [InlineData("1234,567", CacheServiceKey.WaitingBetBuilderCacheKey + "-1234,567")]
    public void GetShortCache_Always_CallServiceWithCorrectParams(string leagueId, string logKey)
    {
        service.MatchesOnShortCaching(leagueId);

        cacheService.Received().Get<List<MatchDetailModel>>(logKey);
    }

    [Theory]
    [InlineData("123", CacheServiceKey.WaitingBetBuilderCacheKey + "-123-longCaching")]
    [InlineData("1234,567", CacheServiceKey.WaitingBetBuilderCacheKey + "-1234,567-longCaching")]
    public void GetLongCache_Always_CallServiceWithCorrectParams(string leagueId, string logKey)
    {
        service.MatchesOnLongCaching(leagueId);

        cacheService.Received().Get<List<MatchDetailModel>>(logKey);
    }
}