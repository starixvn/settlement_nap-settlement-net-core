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
