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
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.WebSites.Controllers
{
    public class HomeController : Controller
    {
        private readonly INapSession session;

        public HomeController(INapSession session)
        {
            this.session = session;
        }

        [AllowAnonymous]
        public IActionResult Index()
        {
            ViewBag.IsSessionAvailable = HttpContext.Session.IsAvailable;
            ViewBag.UserId = session.UserId;
            ViewBag.Username = session.UserName;
            var instanceName = Dns.GetHostName();
            var ip = Dns.GetHostEntry(instanceName).AddressList.FirstOrDefault(x => x.AddressFamily == AddressFamily.InterNetwork);
            ViewBag.InstanceName = instanceName;
            ViewBag.InstanceIp = ip;

            return View();
        }

        [AllowAnonymous]
        public IActionResult Test()
        {
            const int sleepTime = 2 * 60 * 1000;
            Thread.Sleep(sleepTime);
            return Content("Test");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [AllowAnonymous]
        public IActionResult ExpiredSession()
        {
            return View();
        }

#if DEBUG

        [AllowAnonymous]
        [HttpGet]
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
    }
}