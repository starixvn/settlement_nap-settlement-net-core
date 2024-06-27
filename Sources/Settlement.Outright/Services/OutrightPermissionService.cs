using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Client.Services;
using Settlement.Core.Models;

namespace Settlement.Outright.Services;

using Core.Configurations;

public interface OutrightPermissionService
{
    public Permission Permission { get; }
}

public class OutrightPermissionServiceImp(INapSession session, IUserService userService, INapSettings siteSettings)
    : OutrightPermissionService
{
    public Permission Permission => new()
    {
        CanCalculateOutright = HasPermission(SettlementFunctionKeys.OutrightCalculate, Constant.Policy.Host),
        CanUncalculateOutright = HasPermission(SettlementFunctionKeys.OutrightUncalculate, Constant.Policy.Host),
        IsLeader = HasPermission(SettlementFunctionKeys.LeaderCalculate, Constant.Policy.Host)
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