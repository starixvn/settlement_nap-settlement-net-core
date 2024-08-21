using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Services;
using Settlement.Core.Models;

namespace Settlement.Gaming.Services;

using Core.Configurations;

public interface PermissionService
{
    public Permission Permission { get; }
}

public class Happy5PermissionServiceImp(INapSession session, IUserService userService, INapSettings siteSettings)
    : PermissionService
{
    public Permission Permission => new()
    {
        CanItAdmin = HasPermission(SettlementFunctionKeys.Happy5ResettleMatchBeforeYesterday, Constant.Policy.Host),
        CanCalculate = HasPermission(SettlementFunctionKeys.Happy5Recalculate, Constant.Policy.Host),
        CanRefund = HasPermission(SettlementFunctionKeys.Happy5Refund, Constant.Policy.Host),
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