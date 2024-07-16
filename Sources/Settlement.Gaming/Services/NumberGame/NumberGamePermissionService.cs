using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Client.Services;
using Settlement.Core.Models;

namespace Settlement.Gaming.Services.NumberGame;

using Configurations;

public interface PermissionService
{
    public Permission Permission { get; }
}

public class NumberGamePermissionServiceImp(INapSession session, IUserService userService, INapSettings siteSettings)
    : PermissionService
{
    public Permission Permission => new()
    {
        CanItAdmin = HasPermission(SettlementFunctionKeys.NGResettleMatchBeforeYesterday, Constant.Policy.Host),
        CanCalculate = HasPermission(SettlementFunctionKeys.NumberGameRecalculate, Constant.Policy.Host),
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