using Microsoft.AspNetCore.Mvc;
using Settlement.Core.Constants;

namespace Settlement.WebSites.Controllers;

[Route("[controller]")]
public class AppsController(IConfiguration configuration) : Controller
{
    [HttpGet("change-waiting-time")]
    public IActionResult ChangeWaitingTime(string pageType)
    {
        return SetView("Change waiting-time setting", pageType, ViewPath.Setting);
    }

    [HttpGet("auto-setting-match")]
    public IActionResult AutoSettingMatch()
    {
        return SetView("Match Auto Payout Setting", "AutoSettingMatch", ViewPath.Setting);
    }

    [HttpGet("auto-setting-league")]
    public IActionResult AutoSettingLeague()
    {
        return SetView("League Auto Payout Setting", "AutoSettingLeague", ViewPath.Setting);
    }

    [HttpGet("advanced-auto-setting-league")]
    public IActionResult AdvancedAutoSettingLeague()
    {
        return SetView("League Auto Payout Setting", "AdvancedLeagueSettings", ViewPath.Setting);
    }

    [HttpGet("soccer-auto-setting-league")]
    public IActionResult SoccerAutoSettingLeague()
    {
        return SetView("League Auto Payout Setting", "SoccerAutoSettings", ViewPath.Setting);
    }

    [HttpGet("remark-setting")]
    public IActionResult RemarkSetting()
    {
        return SetView("Hold Settings", "RemarkSetting", ViewPath.Setting);
    }

    [HttpGet("fast-market")]
    public IActionResult FastMarket()
    {
        return SetView("Fast Market", string.Empty, ViewPath.FastMarket);
    }

    [HttpGet("soccer-early")]
    public IActionResult SoccerEarly()
    {
        return SetView("Soccer - Early Settlement", PagesType.EarlySettle, ViewPath.Soccer);
    }

    [HttpGet("soccer-recalculate")]
    public IActionResult SoccerRecalculate()
    {
        return SetView("Soccer - Calculation", PagesType.Recalculate, ViewPath.Soccer);
    }

    [HttpGet("soccer-refund")]
    public IActionResult SoccerRefund()
    {
        return SetView("Soccer - Refund", PagesType.Refund, ViewPath.Soccer);
    }

    [HttpGet("e-sports-early")]
    public IActionResult ESportsEarly()
    {
        return SetView("E-Sports - Early Settlement", PagesType.EarlySettle, ViewPath.ESports);
    }

    [HttpGet("e-sports-recalculate")]
    public IActionResult ESportsRecalculate()
    {
        return SetView("E-Sports - Calculation", PagesType.Recalculate, ViewPath.ESports);
    }

    [HttpGet("e-sports-refund")]
    public IActionResult ESportsRefund()
    {
        return SetView("E-Sports - Refund", PagesType.Refund, ViewPath.ESports);
    }

    [HttpGet("basketball-early")]
    public IActionResult BasketballEarly()
    {
        return SetView("Basketball - Early Settlement", PagesType.EarlySettle, ViewPath.Basketball);
    }

    [HttpGet("basketball-recalculate")]
    public IActionResult BasketballRecalculate()
    {
        return SetView("Basketball - Calculation", PagesType.Recalculate, ViewPath.Basketball);
    }

    [HttpGet("basketball-refund")]
    public IActionResult BasketballRefund()
    {
        return SetView("Basketball - Refund", PagesType.Refund, ViewPath.Basketball);
    }

    [HttpGet("tennis-recalculate")]
    public IActionResult TennisRecalculate()
    {
        return SetView("Tennis - Calculation", PagesType.Recalculate, ViewPath.Tennis);
    }

    [HttpGet("tennis-refund")]
    public IActionResult TennisRefund()
    {
        return SetView("Tennis - Refund", PagesType.Refund, ViewPath.Tennis);
    }

    [HttpGet("badminton-early")]
    public IActionResult BadmintonEarly()
    {
        return SetView("Badminton - Early Settlement", PagesType.EarlySettle, ViewPath.Badminton);
    }

    [HttpGet("badminton-recalculate")]
    public IActionResult BadmintonRecalculate()
    {
        return SetView("Badminton - Calculation", PagesType.Recalculate, ViewPath.Badminton);
    }

    [HttpGet("badminton-refund")]
    public IActionResult BadmintonRefund()
    {
        return SetView("Badminton - Refund", PagesType.Refund, ViewPath.Badminton);
    }

    [HttpGet("cricket-early")]
    public IActionResult CricketEarly()
    {
        return SetView("Cricket - Early Settlement", PagesType.EarlySettle, ViewPath.Cricket);
    }

    [HttpGet("cricket-recalculate")]
    public IActionResult CricketRecalculate()
    {
        return SetView("Cricket - Calculation", PagesType.Recalculate, ViewPath.Cricket);
    }

    [HttpGet("cricket-refund")]
    public IActionResult CricketRefund()
    {
        return SetView("Cricket - Refund", PagesType.Refund, ViewPath.Cricket);
    }

    [HttpGet("other-sports-recalculate")]
    public IActionResult OtherSportsRecalculate()
    {
        return SetView("Other Sports - Calculation", PagesType.Recalculate, ViewPath.OtherSports);
    }

    [HttpGet("other-sports-refund")]
    public IActionResult OtherSportsRefund()
    {
        return SetView("Other Sports - Refund", PagesType.Refund, ViewPath.OtherSports);
    }

    [HttpGet("baseball-early")]
    public IActionResult BaseballEarly()
    {
        return SetView("Baseball - Early Settlement", PagesType.EarlySettle, ViewPath.Baseball);
    }

    [HttpGet("baseball-recalculate")]
    public IActionResult BaseballRecalculate()
    {
        return SetView("Baseball - Calculation", PagesType.Recalculate, ViewPath.Baseball);
    }

    [HttpGet("baseball-refund")]
    public IActionResult BaseballRefund()
    {
        return SetView("Baseball - Refund", PagesType.Refund, ViewPath.Baseball);
    }

    [HttpGet("notification")]
    public IActionResult Notification(int top)
    {
        return SetView("notification", top.ToString(), ViewPath.Notification);
    }

    private ActionResult SetView(string title, string pageType, string viewName)
    {
        ViewBag.Environment = configuration.GetSection("Environment").Value;
        ViewBag.Title = title;
        ViewBag.PageType = pageType;

        return View(viewName);
    }
}