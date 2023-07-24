using Fanex.NAP.Client;
using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Signin.AspNetCore.Attribute;
using Microsoft.AspNetCore.Mvc;
using ONEbook.UM.AspNetCore.Filters;
using Settlement.Core.Models;
using Settlement.WebSites;
using Settlement.WebSites.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureAuthorization();

builder.Services.ConfigureAuthentication(builder.Configuration);

builder.Services.ConfigureRedis(builder.Configuration);

builder.Services.ConfigureSession(builder.Configuration);

builder.Services.OnebookUM(builder.Configuration);

builder.Services.ConfigureNapServices(builder.Configuration);

WebSites.ConfigureFanex(builder.Configuration);

builder.Services.ConfigureAutoMapper();

builder.Services.ConfigureCore();

builder.Services.ConfigureMediator();

builder.Services.ConfigInternalService();

builder.Services.ConfigureMessagePack();

builder.Services.Configure<AppSettingsKey>(builder.Configuration);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new ServiceFilterAttribute(typeof(CheckUMFilterAttribute)));
    options.Filters.Add(new SessionAuthorizeAttribute());
});
builder.Services.AddHttpClient();

// WEB Application
var app = builder.Build();

app.UseDeveloperExceptionPage();
app.UseResponseCompression();
app.UseStaticFiles();
app.UseCookiePolicy();
app.UseSession();
app.UseMiddleware<ErrorHandler>();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
        "default",
        "{controller=Home}/{action=Index}/{id?}");

NapClientManager
    .UseConfig(app.Services.GetRequiredService<INapSettings>())
    .UseSession(app.Services.GetRequiredService<INapSession>());

app.Run();