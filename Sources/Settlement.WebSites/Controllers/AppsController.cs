using Fanex.NAP.Signin.AspNetCore.Attribute;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Constants;

namespace Settlement.WebSites.Controllers
{
    [SessionAuthorize]
    public class AppsController : Controller
    {

        private readonly IConfiguration configuration;

        public AppsController(IConfiguration configuration)
        {
            this.configuration = configuration;
            
        }

        public IActionResult Test()
        {
            ViewBag.Environment = configuration.GetSection("Environment").Value;
            return View("~/Views/Home/Test.cshtml");
        }

        [HttpGet]
        public IActionResult BetBuilder(string matchId)
        {
            var pageType = string.IsNullOrEmpty(matchId) ? "MainPage" : PagesType.Recalculate;
            return SetView("Bet Builder", pageType, "~/wwwroot/bet-builder/index.cshtml");
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
