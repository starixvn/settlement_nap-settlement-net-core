using Fanex.Caching;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;

namespace Settlement.Core.Services;

public interface IBalanceUpService
{
    BalanceUp GetBalanceUpDay();
}

public class BalanceUpServiceImp(
    IDynamicRepository repository,
    ICacheService cacheService)
    : IBalanceUpService
{
    private BalanceUp BalanceUp => repository.Get<BalanceUp>(new GetBalanceUpDayCriteria());

    public BalanceUp GetBalanceUpDay() => cacheService.GetOrSet(
       CacheSettings.Keys.MemoryCacheBalanceUpDay,
        () => BalanceUp,
        new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheSettings.Expiration.BalanceUpTimerMinutes)));
}