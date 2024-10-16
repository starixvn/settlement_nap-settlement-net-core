using Fanex.Data;
using Fanex.NAP.Client.Attributes;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;
using Microsoft.AspNetCore.Mvc;
using ONEbook.UM.AspNetCore.Filters;
using Settlement.Core.Models;
using Settlement.WebSites;
using Settlement.WebSites.Middleware;

var builder = WebApplication.CreateBuilder(args);

var services = builder.Services;
var configuration = builder.Configuration;

services.AddAuthorizationPolicy();

services.AddAuthentication(configuration);

services.AddRedis(configuration);

services.AddSession(configuration);

services.AddOnebookUM(configuration);

services.AddNapClient(configuration);

services.AddNapServices(configuration);

services.AddFanexData(configuration);

services.AddAutoMapper();

services.AddCoreServices();

services.AddMediator();

services.AddInternalService();

services.AddMessagePack();

services.Configure<AppSettingsKey>(configuration);

services.AddRazorPages();
services.AddControllersWithViews(options =>
{
    options.Filters.Add(new ServiceFilterAttribute(typeof(CheckUMFilterAttribute)));
    options.Filters.Add(new SessionAuthorizeAttribute());
});
services.AddHttpClient();

services.AddDataProtection().UseCryptographicAlgorithms(
    new AuthenticatedEncryptorConfiguration
    {
        EncryptionAlgorithm = EncryptionAlgorithm.AES_256_CBC,
        ValidationAlgorithm = ValidationAlgorithm.HMACSHA256
    });

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

await app.RunAsync();