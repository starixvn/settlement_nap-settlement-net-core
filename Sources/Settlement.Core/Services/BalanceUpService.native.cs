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

public class BalanceUpServiceImp : IBalanceUpService
{
    private readonly ICacheService cacheService;
    private readonly IDynamicRepository repository;

    public BalanceUpServiceImp(
        IDynamicRepository repository,
        ICacheService cacheService)
    {
        this.cacheService = cacheService;
        this.repository = repository;
    }

    private BalanceUp BalanceUp => repository.Get<BalanceUp>(new GetBalanceUpDayCriteria());

    public BalanceUp GetBalanceUpDay() => cacheService.GetOrSet(
       CacheSettings.Keys.MemoryCacheBalanceUpDay,
        () => BalanceUp,
        new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheSettings.Expiration.BalanceUpTimerMinutes)));
}