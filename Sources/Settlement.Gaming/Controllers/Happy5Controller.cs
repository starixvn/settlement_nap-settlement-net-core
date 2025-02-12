using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Gaming.Models;
using Settlement.Gaming.Models.Happy5;
using Settlement.Gaming.Requests;

namespace Settlement.Gaming.Controllers;

[ApiController]
[Route("api/[controller]")]
public class Happy5Controller(
    IHttpContextAccessor accessor,
    INapSession currentSession,
    Services.PermissionService permissionService,
    HttpService httpService) : ControllerBase
{
    private const int NotAuthorized = 1000;

    [Route("filter-default"), HttpGet]
    public async Task<IActionResult> Filter() => Ok
    (
        await Task.Run(() => new Happy5MatchRequest()).ConfigureAwait(false)
    );

    [Route("search"), HttpPost]
    public async Task<IActionResult> Search(Happy5MatchRequest request)
    {
        var leagues = await httpService.HttpPost<List<LeaguesModel>>("happy5/search", request);
        var happyFive = new HappyFive
        {
            Permission = permissionService.Permission,
            Leagues = leagues
        };

        return Ok(happyFive);
    }

    [Route("get-ball"), HttpGet]
    public async Task<IActionResult> GetBallsByMatch(int matchId)
    {
        var balls = await httpService.HttpGet<List<BallModel>>($"happy5/get-ball/{matchId}");

        return Ok(balls);
    }

    [Route("settle"), HttpPost]
    public async Task<IActionResult> Settle(Happy5SettlementRequest request)
    {
        request.UserId = currentSession.UserId;
        request.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        var result = HasPermission(request.Action) ? await httpService.HttpPost<Result>("happy5/settle", request) : NoPermission;

        return Ok(result);
    }

    private bool HasPermission(string action)
    {
        var permission = permissionService.Permission;
        var isRecalculation = permission.CanCalculate && action.Equals(ActionType.CalculateAll);
        var isRefund = permission.CanRefund && action.Equals(ActionType.RefundAll);
        return isRecalculation || isRefund || permission.CanItAdmin;
    }

    private static Result NoPermission => new()
    {
        ErrCode = NotAuthorized,
        ErrMsg = "You are not authorized to use this function. Please contact the admin for help."
    };
}