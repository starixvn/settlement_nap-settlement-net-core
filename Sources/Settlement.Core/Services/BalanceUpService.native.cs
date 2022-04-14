using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Fanex.Caching;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;

namespace Settlement.Core.Services
{
    public interface IBalanceUpService
    {
        BalanceUp GetBalanceUpDay();
    }

    public class BalanceUpServiceImp : IBalanceUpService
    {
        private const int CacheTimeoutMinute = 1;
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
            CacheServiceKey.MemoryCacheBalanceUpDay,
            () => BalanceUp,
            new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheTimeoutMinute)));
    }
}
