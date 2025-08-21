using Microsoft.Extensions.Caching.Memory;
using Settlement.Core.Constants;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.UnitTests.Services;

public class CachingMatchesServiceTests
{
    private readonly IMemoryCache cacheService;

    private readonly CachingMatchesService service;

    public CachingMatchesServiceTests()
    {
        cacheService = Substitute.For<IMemoryCache>();
        service = new CachingMatchesServiceImp(cacheService);
    }

    [Theory]
    [InlineData("123", CacheSettings.WaitingBetBuilderCacheKey + "-123")]
    [InlineData("1234,567", CacheSettings.WaitingBetBuilderCacheKey + "-1234,567")]
    public void SetToCache_Always_SetLongAndShortCache(string leagueIds, string logKey)
    {
        service.SetToCache(leagueIds, []);

        cacheService.Received().CreateEntry(logKey);
        cacheService.Received().CreateEntry(logKey + "-long");
    }

    [Theory]
    [InlineData("123", CacheSettings.WaitingBetBuilderCacheKey + "-123")]
    [InlineData("1234,567", CacheSettings.WaitingBetBuilderCacheKey + "-1234,567")]
    public void GetShortCache_Always_CallServiceWithCorrectParams(string leagueId, string logKey)
    {
        service.MatchesOnShortCaching(leagueId);

        cacheService.Received().Get<List<MatchDetailModel>>(logKey);
    }

    [Theory]
    [InlineData("123", CacheSettings.WaitingBetBuilderCacheKey + "-123-long")]
    [InlineData("1234,567", CacheSettings.WaitingBetBuilderCacheKey + "-1234,567-long")]
    public void GetLongCache_Always_CallServiceWithCorrectParams(string leagueId, string logKey)
    {
        service.MatchesOnLongCaching(leagueId);

        cacheService.Received().Get<List<MatchDetailModel>>(logKey);
    }
}