using Fanex.Caching;
using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Client.Services;
using Fanex.NAP.Core.Business;
using Settlement.Core.Models;

namespace Settlement.Core.Services;

using Configurations;

public abstract class PermissionService
{
    private readonly INapSession session;

    private readonly IUserService userService;

    private readonly ICacheService cacheService;

    private readonly INapSettings siteSettings;

    protected PermissionService(INapSession session, IUserService userService, ICacheService cacheService, INapSettings siteSettings)
    {
        this.session = session;
        this.userService = userService;
        this.cacheService = cacheService;
        this.siteSettings = siteSettings;
    }

    public abstract Permission Permission { get; }

    protected virtual bool HasPermission(string functionKey, Constant.Policy policy)
    {
        return session.UserId > 0 && userService.IsHavingPermission(
            session.UserId,
            siteSettings.SiteId,
            functionKey,
            policy);
    }

    public virtual Permission GetPermission(string cacheKey)
    {
        var key = $"{cacheKey}-{session.UserId}";
        return cacheService.GetOrSet(
            key,
            () => Permission,
            new CacheItemOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(1)));
    }
}

public class PermissionServiceImp : PermissionService
{
    public PermissionServiceImp(INapSession session, IUserService userService, ICacheService cacheService, INapSettings siteSettings)
        : base(session, userService, cacheService, siteSettings)
    {
    }

    public override Permission Permission => new()
    {
        CanCalculate = HasPermission(SettlementFunctionKeys.SportsbookCalculate, Constant.Policy.Host),
        CanMarkPending = HasPermission(SettlementFunctionKeys.SportsbookMarkPendingMatch, Constant.Policy.Host),
        CanMarkUnDecided = HasPermission(SettlementFunctionKeys.SportsbookMarkUndecidedMatch, Constant.Policy.Host),
        CanUncalculate = HasPermission(SettlementFunctionKeys.SportsbookUncalculate, Constant.Policy.Host),
        CanUncalculateInstant = HasPermission(SettlementFunctionKeys.SportsbookUncalculateInstant, Constant.Policy.Host),
        CanRefund = HasPermission(SettlementFunctionKeys.SportsbookRefund, Constant.Policy.Host),
        CanViewSettlementLog = HasPermission(SettlementFunctionKeys.ViewLogSettlement, Constant.Policy.Read),
        CanAutoPayout = HasPermission(SettlementFunctionKeys.AutoPayoutSetting, Constant.Policy.Host),
        IsLeader = HasPermission(SettlementFunctionKeys.LeaderCalculate, Constant.Policy.Host),
        CanChangeScoreSource = HasPermission(SettlementFunctionKeys.ScoreSource, Constant.Policy.Host),
        CanMoveTickets = HasPermission(SettlementFunctionKeys.CricketMoveTickets, Constant.Policy.Host),
        IsTrader = HasPermission(SettlementFunctionKeys.TraderSaveScore, Constant.Policy.Host),
        AutoSettlement = HasPermission(SettlementFunctionKeys.AutoSettlement, Constant.Policy.Host)
    };
}