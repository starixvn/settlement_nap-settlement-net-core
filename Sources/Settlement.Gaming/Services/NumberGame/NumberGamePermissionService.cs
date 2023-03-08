using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Client.Services;
using Fanex.NAP.Core.Business;
using Settlement.Core.Models;

namespace Settlement.Gaming.Services.NumberGame;

using Core.Configurations;

public interface PermissionService
{
    public Permission Permission { get; }
}

public class NumberGamePermissionServiceImp : PermissionService
{
    private readonly INapSession session;

    private readonly IUserService userService;

    private readonly INapSettings siteSettings;

    public NumberGamePermissionServiceImp(INapSession session, IUserService userService, INapSettings siteSettings)
    {
        this.session = session;
        this.userService = userService;
        this.siteSettings = siteSettings;
    }

    public Permission Permission => new()
    {
        CanItAdmin = HasPermission(SettlementFunctionKeys.NgResettleMatchBeforeYesterday, Constant.Policy.Host),
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