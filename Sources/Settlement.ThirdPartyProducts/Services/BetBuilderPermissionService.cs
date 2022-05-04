using Fanex.Caching;
using Fanex.NAP.Core.Business;
using Fanex.NAP.Core.Service.Interface;
using Fanex.NAP.Core.Web.Session;
using Settlement.Core.Configuration;
using Settlement.Services;
using Settlement.Services.Models;

namespace Settlement.ThirdPartyProducts.Services
{
    public class BetBuilderPermissionServiceImp : PermissionService
    {
        public BetBuilderPermissionServiceImp(ICurrentSession currentSession, IUserService userService, ICacheService cacheService)
            : base(currentSession, userService, cacheService)
        {
        }

        public override bool ReadPermission => HasPermission(SettlementFunctionKeys.MetricGamingSettlement, Constant.Policy.Read);

        public override Permission Permission => new Permission
        {
            CanCalculate = HasPermission(SettlementFunctionKeys.BetBuilder, Constant.Policy.Host),
            CanViewSettlementLog = HasPermission(SettlementFunctionKeys.ViewLogSettlement, Constant.Policy.Read)
        };
    }
}