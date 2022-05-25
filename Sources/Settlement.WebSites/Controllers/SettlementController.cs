using Fanex.NAP.Signin.AspNetCore.Attribute;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Settlement.WebSites.Controllers
{
    [SessionAuthorize]
    public class SettlementController: Controller
    {
        private readonly IConfiguration configuration;

        public SettlementController(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public IActionResult Index(int top)
        {
            ViewBag.Top = top;
            ViewBag.NetCoreRootUrl = configuration.GetSection("NetCoreRootUrl").Value;
            return View("~/wwwroot/notification/index.cshtml");
        }
    }
}
