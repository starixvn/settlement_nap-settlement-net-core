using Fanex.NAP.Signin.AspNetCore.Attribute;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Constants;

namespace Settlement.WebSites.Controllers
{
    [SessionAuthorize]
    [Route("[controller]")]
    public class AppsController : Controller
    {
        private readonly IConfiguration configuration;


        public AppsController(IConfiguration configuration)
        {
            this.configuration = configuration;
            
        }
        
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

        [HttpGet("remark-setting")]
        public IActionResult RemarkSetting()
        {
            return SetView("Hold Settings", "RemarkSetting", ViewPath.Setting);
        }

        [HttpGet("bet-builder")]
        public IActionResult BetBuilder(string matchId)
        {
            var pageType = string.IsNullOrEmpty(matchId) ? "MainPage" : PagesType.Recalculate;
            return SetView("Bet Builder", pageType, ViewPath.BetBuilder);
        }

        [HttpGet("log")]
        public IActionResult Log()
        {
            return SetView("Settlement Log", string.Empty, ViewPath.Log);
        }

        [HttpGet("happy5")]
        public IActionResult Happy5(string matchId)
        {
            var pageType = string.IsNullOrEmpty(matchId) ? "MainPage" : PagesType.Recalculate;
            return SetView("Happy5", pageType, ViewPath.Happy5);
        }

        [HttpGet("number-game")]
        public IActionResult NumberGame(string matchId)
        {
            var pageType = string.IsNullOrEmpty(matchId) ? "MainPage" : PagesType.Recalculate;
            return SetView("NumberGame", pageType, ViewPath.NumberGame);
        }

        [HttpGet("move-tickets")]
        public IActionResult MoveTickets()
        {
            return SetView("Move Tickets", "Cricket", ViewPath.MoveTickets);
        }

        [HttpGet("move-running-tickets")]
        public IActionResult MoveRunningTickets()
        {
            return SetView("Move Running Tickets", "RunningTickets", ViewPath.MoveTickets);
        }

        [HttpGet("provider-source")]
        public IActionResult ProviderSource()
        {
            return SetView("Provider Manager", "ProviderSource", ViewPath.SourceSetting);
        }

        [HttpGet("outside-source")]
        public IActionResult OutsideSource()
        {
            return SetView("Outside Source Manager", "OutsideSource", ViewPath.SourceSetting);
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
