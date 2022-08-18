using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using MediatR;
using Settlement.ThirdPartyProducts.Controllers;
using Settlement.ThirdPartyProducts.Services;

namespace Settlement.WebSites.Configurations
{
    public static class ThirdPartyProductsConfig
    {
        public static void ThirdPartyProductsConfigServices(this IServiceCollection services)
        {
            services.AddTransient<MatchService, MatchServiceImp>();
            services.AddTransient<BetBuilderService, BetBuilderServiceImp>();
            services.AddTransient<ScoreService, ScoreServiceImp>();
            services.AddSingleton<PermissionService, BetBuilderPermissionServiceImp>();
            services.AddTransient<IVoidBetApiService, VoidBetApiServiceImp>();
            services.AddTransient<BetBuilderMatchesService, BetBuilderMatchesServiceImp>();
            services.AddTransient<CachingMatchesService, CachingMatchesServiceImp>();
            services.AddTransient<MergeMatchInfo, MergeMatchInfoImp>();
        }

        public static void ThirdPartyProductsConfigMediator(this IServiceCollection services)
        {
            services.AddMediatR(typeof(BetBuilderController).GetTypeInfo().Assembly);
            services.AddMediatR(typeof(VoidBetController).GetTypeInfo().Assembly);
        }
    }
}