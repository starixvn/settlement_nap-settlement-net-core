using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;

namespace Settlement.WebSites
{
    public static class Program
    {
        private const int bytesPerSecond = 240;

        private static readonly TimeSpan gracePeriod = TimeSpan.FromSeconds(30);

        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseUrls($"http://0.0.0.0:5000");
                    webBuilder.ConfigureKestrel(serverOptions =>
                    {
                        serverOptions.Limits.MinRequestBodyDataRate =
                            new MinDataRate(bytesPerSecond, gracePeriod);
                    }).UseStartup<Startup>();
                })
                .ConfigureServices((hostContext, services) =>
                {
                    services
                        .Configure<AppSettingsKey>(hostContext.Configuration)
                        .AddSingleton(sp => sp.GetRequiredService<IOptions<AppSettingsKey>>().Value);
                });
    }
}