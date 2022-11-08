using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using MediatR;
using Settlement.Gaming.Controllers;
using Happy5 = Settlement.Gaming.Services.Happy5;
using NumberGame = Settlement.Gaming.Services.NumberGame;
namespace Settlement.WebSites.Configurations
{
    public static class GamingConfig
    {
        public static void GamingConfigServices(this IServiceCollection services)
        {
            services.AddTransient<Happy5.MatchService, Happy5.MatchServiceImp>();
            services.AddTransient<Happy5.BallService, Happy5.BallServiceImp>();
            services.AddTransient<Happy5.SettlementService, Happy5.SettlementServiceImp>();
            services.AddTransient<Happy5.LeagueService, Happy5.LeagueServiceImp>();
            services.AddSingleton<Happy5.PermissionService, Happy5.Happy5PermissionServiceImp>();

            services.AddTransient<NumberGame.MatchService, NumberGame.MatchServiceImp>();
            services.AddTransient<NumberGame.LeagueService, NumberGame.LeagueServiceImp>();
            services.AddTransient<NumberGame.SettlementService, NumberGame.SettlementServiceImp>();
            services.AddSingleton<NumberGame.PermissionService, NumberGame.NumberGamePermissionServiceImp>();
        }

        public static void GamingConfigMediator(this IServiceCollection services)
        {
            services.AddMediatR(typeof(Happy5Controller).GetTypeInfo().Assembly);
            services.AddMediatR(typeof(NumberGameController).GetTypeInfo().Assembly);
        }
    }
}
