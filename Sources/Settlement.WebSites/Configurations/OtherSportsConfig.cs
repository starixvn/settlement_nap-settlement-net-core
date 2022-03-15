using System.Reflection;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Settlement.Sportsbook.OtherSports.Services;

namespace Settlement.WebSites.Configurations
{
    public static class OtherSportsConfig
    {
        public static void ConfigOtherSportsServices(this IServiceCollection services)
        {
            services.AddTransient<SettlementActionsService, SettlementActionsServiceImp>();
            services.AddTransient<SportsbookService, SportsbookServiceImp>();
        }

        public static void ConfigOtherSportsMediator(this IServiceCollection services)
        {
            services.AddMediatR(typeof(OtherSportsConfig).GetTypeInfo().Assembly);
        }
    }
}