using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Client.Models.ParameterObject;
using Fanex.NAP.Client.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Settlement.WebSites.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using Settlement.Core.Constants;

namespace Settlement.WebSites.Controllers
{
    public class HomeController : Controller
    {
        private readonly INapSession session;

        private readonly IConfiguration configuration;

        public HomeController(INapSession session, IConfiguration configuration)
        {
            this.session = session;
            this.configuration = configuration;
        }

        [AllowAnonymous]
        public IActionResult Index()
        {
            ViewBag.NetCoreRootUrl = configuration.GetSection("Settle.Domain:NetCoreRootUrl").Value;
            ViewBag.IsSessionAvailable = HttpContext.Session.IsAvailable;
            ViewBag.UserId = session.UserId;
            ViewBag.Username = session.UserName;
            var instanceName = Dns.GetHostName();
            var ip = Dns.GetHostEntry(instanceName).AddressList.FirstOrDefault(x => x.AddressFamily == AddressFamily.InterNetwork);
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
                NetSessionId = HttpContext?.Session.Id,
                Ip = "127.0.0.1",
                BrowserName = Request?.Headers["User-Agent"].ToString(),
                CountryCode = "VN",
                Domain = "",
                Platform = Environment.OSVersion.Platform.ToString()
            };

            var securityService = new SecurityService();
            var onUserId = securityService.Login(criteria);

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
                            new Claim(ClaimTypes.Name, "sa"),
                            new Claim(ClaimTypes.NameIdentifier, "8")
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

        private ActionResult SetView(string title, string pageType, string viewName)
        {
            ViewBag.Environment = configuration.GetSection("Environment").Value;
            ViewBag.Title = title;
            ViewBag.NetCoreRootUrl = configuration.GetSection("Settle.Domain:NetCoreRootUrl").Value;
            ViewBag.RootUrl = configuration.GetSection("Settle.Domain:RootUrl").Value;
            ViewBag.PageType = pageType;

            return View(viewName);
        }
    }
}