using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Client.Services;
using Fanex.NAP.Core.Business;
using Settlement.Core.Models;

namespace Settlement.Outright.Services;

using Core.Configurations;

public interface OutrightPermissionService
{
    public Permission Permission { get; }
}

public class OutrightPermissionServiceImp : OutrightPermissionService
{
    private readonly INapSession session;

    private readonly IUserService userService;

    private readonly INapSettings siteSettings;

    public OutrightPermissionServiceImp(INapSession session, IUserService userService, INapSettings siteSettings)
    {
        this.session = session;
        this.userService = userService;
        this.siteSettings = siteSettings;
    }

    public Permission Permission => new()
    {
        CanCalculateOutright = HasPermission(SettlementFunctionKeys.OutrightCalculate, Constant.Policy.Host),
        CanUncalculateOutright = HasPermission(SettlementFunctionKeys.OutrightUncalculate, Constant.Policy.Host)
        IsLeader = HasPermission(SettlementFunctionKeys.LeaderCalculate, Constant.Policy.Host),
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