using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Client.Models;
using Fanex.NAP.Client.Models.ParameterObject;
using Fanex.NAP.Client.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ONEbook.UM.AspNetCore.Filters;
using Settlement.Core.Constants;
using Settlement.WebSites.Models;
using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using System.Security.Claims;
using System.Text;

namespace Settlement.WebSites.Controllers;

public class HomeController(INapSession session, IConfiguration configuration) : Controller
{
    [Authorize]
    public IActionResult Index()
    {
        var returnUrl = configuration.GetSection("AuthSettings:LoginPath").Value;
        var firstMenu = session.MenuItemList != null ? session.MenuItemList.MinBy(i => i.DisplayOrder) : new MenuItem();

        if (session.UserId > 0 && session.MenuItemList is { Count: > 0 } && firstMenu != null)
        {
            var childMenu = session.MenuItemList.FirstOrDefault(i => i.ParentId > 0 && i.ParentId == firstMenu.Id);

            returnUrl = childMenu != null ? childMenu.Url : firstMenu.Url;

            if (returnUrl[..1].Equals("/"))
            {
                returnUrl = returnUrl[1..];
            }

            returnUrl = Url.Content(returnUrl);
        }

        return Redirect(returnUrl);
    }

    [AllowAnonymous]
    public IActionResult Test()
    {
        ViewBag.IsSessionAvailable = HttpContext.Session.IsAvailable;
        ViewBag.UserId = session.UserId;
        ViewBag.Username = session.UserName;
        var instanceName = Dns.GetHostName();
        var ip = Dns.GetHostEntry(instanceName).AddressList.ToList().Find(x => x.AddressFamily == AddressFamily.InterNetwork);
        ViewBag.InstanceName = instanceName;
        ViewBag.InstanceIp = ip;

        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    [Route("Home/error")]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

    [AllowAnonymous]
    [Route("Home/expired-session")]
    public IActionResult ExpiredSession()
    {
        return View();
    }

    [AllowAnonymous]
    [Route("Home/clear-session")]
    public IActionResult ClearSession()
    {
        HttpContext.Session.Clear();
        return Content("Clear session.");
    }

#if DEBUG

    [AllowAnonymous]
    [Route("Home/FakeLogin")]
    public async Task<IActionResult> FakeLogin()
    {
        var criteria = new LoginParameter
        {
            UserId = 8,
            SiteId = 67,
            LoginDate = DateTime.Now,
            NetSessionId = HttpContext.Session.Id,
            Ip = "127.0.0.1",
            BrowserName = Request.Headers["User-Agent"].ToString(),
            CountryCode = "VN",
            Domain = "",
            Platform = Environment.OSVersion.Platform.ToString()
        };

        var securityService = new SecurityService();
        var onUserId = await securityService.LoginAsync(criteria);

        await SaveUserSession(onUserId);

        return Content("Faked Login");
    }

    private async Task SaveUserSession(int onUserId)
    {
        const int fakeUserId = 8;
        session.UserId = fakeUserId;
        session.UserName = "sa";
        session.OnUserId = onUserId;

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, "sa"),
            new(ClaimTypes.NameIdentifier, "8")
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
    }

#endif

    [Route("Home/bet-builder/{matchId?}")]
    public IActionResult BetBuilder(string matchId)
    {
        var pageType = string.IsNullOrEmpty(matchId) ? "MainPage" : PagesType.Recalculate;
        return SetView("Bet Builder", pageType, ViewPath.BetBuilder);
    }

    [Route("Home/log")]
    public IActionResult Log()
    {
        return SetView("Settlement Log", string.Empty, ViewPath.Log);
    }

    [Route("Home/provider-log")]
    public IActionResult ProviderLog()
    {
        return SetView("Settlement Provider Log", PagesType.ProviderLog, ViewPath.Log);
    }

    [Route("Home/happy5/{matchId?}")]
    public IActionResult Happy5(string matchId)
    {
        var pageType = string.IsNullOrEmpty(matchId) ? "MainPage" : PagesType.Recalculate;
        return SetView("Happy5", pageType, ViewPath.Happy5);
    }

    [Route("Home/number-game/{matchId?}")]
    public IActionResult NumberGame(string matchId)
    {
        var pageType = string.IsNullOrEmpty(matchId) ? "MainPage" : PagesType.Recalculate;
        return SetView("NumberGame", pageType, ViewPath.NumberGame);
    }

    [Route("Home/move-tickets")]
    public IActionResult MoveTickets()
    {
        return SetView("Move Tickets", "Cricket", ViewPath.MoveTickets);
    }

    [Route("Home/move-running-tickets")]
    public IActionResult MoveRunningTickets()
    {
        return SetView("Move Running Tickets", "RunningTickets", ViewPath.MoveTickets);
    }

    [Route("Home/provider-source")]
    public IActionResult ProviderSource()
    {
        return SetView("Provider Manager", "ProviderSource", ViewPath.SourceSetting);
    }

    [Route("Home/outside-source")]
    public IActionResult OutsideSource()
    {
        return SetView("Outside Source Manager", "OutsideSource", ViewPath.SourceSetting);
    }

    [Route("Home/multi-sports")]
    public ActionResult MultiSports()
    {
        return SetView("MultiSports", string.Empty, ViewPath.MultiSport);
    }

    [Route("Home/calculation")]
    public ActionResult Settlement()
    {
        return SetView("Calculation", "Calculation", ViewPath.Calculation);
    }

    [Route("Home/auto-calculation")]
    public ActionResult AutoCalculation()
    {
        return SetView("AutoCalculation", "AutoCalculation", ViewPath.Calculation);
    }

    [Route("Home/outright")]
    public ActionResult Outright()
    {
        return SetView("Settlement Outright", string.Empty, ViewPath.Outright);
    }

    [Route("Home/outright-log")]
    public ActionResult OutrightLog()
    {
        return SetView("Settlement Outright Log", "OutrightLog", ViewPath.Outright);
    }

    private ActionResult SetView(string title, string pageType, string viewName)
    {
        ViewBag.Environment = configuration.GetSection("Environment").Value;
        ViewBag.Title = title;
        ViewBag.PageType = pageType;

        return View(viewName);
    }

    [AllowAnonymous]
    [HttpGet]
    [SkipUMFilter]
    public string Info()
    {
        using var currentProcess = Process.GetCurrentProcess();
        var stringBuilder = new StringBuilder();

        stringBuilder.Append($"GC.GetTotalMemory(false): {GC.GetTotalMemory(false):n0}\n");
        stringBuilder.Append($"VirtualMemorySize64 is: {currentProcess.VirtualMemorySize64:n0}\n");
        stringBuilder.Append($"PrivateMemorySize64 is: {currentProcess.PrivateMemorySize64:n0}\n");
        stringBuilder.Append($"WorkingSet64 is: {currentProcess.WorkingSet64:n0}\n");
        stringBuilder.Append($"PagedMemorySize64 is: {currentProcess.PagedMemorySize64:n0}\n");
        stringBuilder.Append($"NonpagedSystemMemorySize64 is: {currentProcess.NonpagedSystemMemorySize64:n0}\n");
        stringBuilder.Append($"NonpagedSystemMemorySize64 is: {currentProcess.NonpagedSystemMemorySize64:n0}\n");
        stringBuilder.AppendLine($"Threads.Count: {currentProcess.Threads.Count}");
        stringBuilder.AppendLine($"ThreadPool.PendingWorkItemCount: {ThreadPool.PendingWorkItemCount}");

        return stringBuilder.ToString();
    }
}