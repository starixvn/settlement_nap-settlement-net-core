using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Client.Services;
using Fanex.NAP.Core.Business;
using Settlement.Core.Configuration;
using Settlement.Core.Models;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface PermissionService
    {
        public Permission Permission { get; }
    }

    public class BetBuilderPermissionServiceImp : PermissionService
    {
        private readonly INapSession session;

        private readonly IUserService userService;

        private readonly INapSettings siteSettings;

        public BetBuilderPermissionServiceImp(INapSession session, IUserService userService,  INapSettings siteSettings)
        {
            this.session = session;
            this.userService = userService;
            this.siteSettings = siteSettings;
        }
       

        public Permission Permission => new Permission
        {
            CanCalculate = HasPermission(SettlementFunctionKeys.BetBuilder, Constant.Policy.Host),
            CanViewSettlementLog = HasPermission(SettlementFunctionKeys.ViewLogSettlement, Constant.Policy.Read)
        };

        private bool HasPermission(string functionKey, Constant.Policy policy)
        {
            return session.UserId > 0 && userService.IsHavingPermission(
                session.UserId,
                siteSettings.SiteId,
                functionKey,
                policy);
        }
    }
}