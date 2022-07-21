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
