using System.Reflection;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Settlement.EventManagement.Controllers;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.SpecificService.Tennis;

namespace Settlement.WebSites.Configurations
{
    public static class EventManagementConfig
    {
        public static void ConfigEventManagementServices(this IServiceCollection services)
        {
            services.AddTransient<IMultiSportService, MultiSportServiceImp>();
            services.AddTransient<ITennisService, TennisServiceImp>();
            services.AddTransient<IExternalScoreService, ExternalScoreServiceImp>();
            services.AddTransient<IMatchResultDetailService, MatchResultDetailServiceImp>();
            services.AddTransient<IMatchService, MatchServiceImp>();
            services.AddTransient<EventManagement.Services.IScoreService, EventManagement.Services.ScoreServiceImp>();
            services.AddTransient<EventManagement.Services.SpecificService.Tennis.IScoreService, EventManagement.Services.SpecificService.Tennis.ScoreServiceImp>();
        }

        public static void ConfigEventManagementMediator(this IServiceCollection services)
        {
            services.AddMediatR(typeof(MultiSportController).GetTypeInfo().Assembly);
        }
    }
}