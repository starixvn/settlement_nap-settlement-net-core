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

        private const string SettingView = "~/wwwroot/instant-setting/index.cshtml";

        public AppsController(IConfiguration configuration)
        {
            this.configuration = configuration;
            
        }

        public IActionResult Test()
        {
            ViewBag.Environment = configuration.GetSection("Environment").Value;
            return View("~/Views/Home/Test.cshtml");
        }

        [HttpGet("change-waiting-time")]
        public IActionResult ChangeWaitingTime(string pageType)
        {
            return SetView("Change waiting-time setting", pageType, SettingView);
        }

        [HttpGet("auto-setting-match")]
        public ActionResult AutoSettingMatch()
        {
            return SetView("Match Auto Payout Setting", "AutoSettingMatch", SettingView);
        }

        [HttpGet("auto-setting-league")]
        public ActionResult AutoSettingLeague()
        {
            return SetView("League Auto Payout Setting", "AutoSettingLeague", SettingView);
        }

        [HttpGet("remark-setting")]
        public ActionResult RemarkSetting()
        {
            return SetView("Hold Settings", "RemarkSetting", SettingView);
        }

        [HttpGet("bet-builder")]
        public IActionResult BetBuilder(string matchId)
        {
            var pageType = string.IsNullOrEmpty(matchId) ? "MainPage" : PagesType.Recalculate;
            return SetView("Bet Builder", pageType, "~/wwwroot/bet-builder/index.cshtml");
        }

        [HttpGet("log")]
        public ActionResult Log()
        {
            return SetView("Settlement Log", string.Empty, "~/wwwroot/log/index.cshtml");
        }


        [HttpGet("happy5")]
        public ActionResult Happy5(string matchId)
        {
            var pageType = string.IsNullOrEmpty(matchId) ? "MainPage" : PagesType.Recalculate;
            return SetView("Happy5", pageType, "~/wwwroot/happy5/index.cshtml");
        }

        [HttpGet("number-game")]
        public ActionResult NumberGame(string matchId)
        {
            var pageType = string.IsNullOrEmpty(matchId) ? "MainPage" : PagesType.Recalculate;
            return SetView("NumberGame", pageType, "~/wwwroot/number-game/index.cshtml");
        }
        private ActionResult SetView(string title, string pageType, string viewName)
        {
            ViewBag.Environment = configuration.GetSection("Environment").Value;
            ViewBag.Title = title;
            ViewBag.NetCoreRootUrl = configuration.GetSection("NetCoreRootUrl").Value;
            ViewBag.PageType = pageType;

            return View(viewName);
        }
    }
}
