using Fanex.Caching;

namespace Settlement.Core.Services;

public interface RedisCacheService
{
    public void IncrementCount(bool getSuccess);
}

public class RedisCacheServiceImp : RedisCacheService
{
    private readonly ICacheService cache;
    private const string Hit = "Hit-Settlement";
    private const string Miss = "Miss-Settlement";
    private const string Error = "Error-Settlement";
    private static readonly CacheItemOptions CachePolicy = new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromDays(60));

    public RedisCacheServiceImp(ICacheService cache)
    {
        this.cache = cache;
    }

    public void IncrementCount(bool getSuccess)
    {
        try
        {
            var key = getSuccess ? Hit : Miss;
            cache.TryGet(key, out string count);
            var value = int.TryParse(count, out var result) ? result : 0;
            cache.Set(key, (++value).ToString(), CachePolicy);
        }
        catch (Exception e)
        {
            cache.Set(Error, e.ToString(), CachePolicy);
        }
    }
}