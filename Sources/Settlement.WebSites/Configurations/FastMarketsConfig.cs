using System.Reflection;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Settlement.FastMarkets.Controllers;
using Settlement.FastMarkets.Services;

namespace Settlement.WebSites.Configurations
{
    public static class FastMarketsConfig
    {
        public static void ConfigFastMarketsServices(this IServiceCollection services)
        {
            services.AddTransient<IBetTypeElementService, BetTypeElementServiceImp>();
            services.AddTransient<IEventCounterElementService, EventCounterElementServiceImp>();
            services.AddTransient<IEventCounterResultService, EventCounterResultServiceImp>();
            services.AddTransient<IEventCounterService, EventCounterServiceImp>();
            services.AddTransient<IFastMarketBetTypeService, FastMarketBetTypeServiceImp>();
            services.AddTransient<IFastMarketResultService, FastMarketResultServiceImp>();
            services.AddTransient<IFastMarketService, FastMarketServiceImp>();
            services.AddTransient<IMatchDetailService, MatchDetailServiceImp>();
            services.AddTransient<IResultLabelService, ResultLabelServiceImp>();
            services.AddTransient<ISettingService, SettingServiceImp>();
        }

        public static void ConfigFastMarketsMediator(this IServiceCollection services)
        {
            services.AddMediatR(typeof(FastMarketsController).GetTypeInfo().Assembly);
        }
    }
}