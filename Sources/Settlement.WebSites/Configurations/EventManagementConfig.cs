using System.Reflection;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Settlement.EventManagement.Controllers;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.Calculation;
using Settlement.EventManagement.Services.SpecificService.Tennis;
using MatchServiceImp = Settlement.EventManagement.Services.MatchServiceImp;

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
            services.AddTransient<MatchService, EventManagement.Services.Calculation.MatchServiceImp>();
            services.AddTransient<LeagueService, LeagueServiceImp>();
            services.AddTransient<CompareMatchService, CompareMatchServiceImp>();
            services.AddTransient<MergeDataService, MergeDataServiceImp>();
            services.AddTransient<NewInfoMatchService, NewInfoMatchServiceImp>();
            services.AddTransient<SiteMatchService, SiteMatchServiceImp>();
            services.AddTransient<EventManagement.Services.IScoreService, EventManagement.Services.ScoreServiceImp>();
            services.AddTransient<EventManagement.Services.SpecificService.Tennis.IScoreService, EventManagement.Services.SpecificService.Tennis.ScoreServiceImp>();
        }

        public static void ConfigEventManagementMediator(this IServiceCollection services)
        {
            services.AddMediatR(typeof(MultiSportController).GetTypeInfo().Assembly);
            services.AddMediatR(typeof(CalculationController).GetTypeInfo().Assembly);
        }
    }
}