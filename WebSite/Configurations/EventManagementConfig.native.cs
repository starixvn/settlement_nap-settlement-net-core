using MediatR;
using Settlement.EventManagement.Controllers;
using Settlement.EventManagement.Services;
using Settlement.EventManagement.Services.Calculation;
using Settlement.EventManagement.Services.MultiSports;
using Settlement.EventManagement.Services.SpecificService.Tennis;
using CompareMatchService = Settlement.EventManagement.Services.Calculation.CompareMatchService;
using CompareMatchServiceImp = Settlement.EventManagement.Services.Calculation.CompareMatchServiceImp;
using CompareMultiSportMatchService = Settlement.EventManagement.Services.MultiSports.CompareMatchService;
using CompareMultiSportMatchServiceImp = Settlement.EventManagement.Services.MultiSports.CompareMatchServiceImp;
using MatchServiceImp = Settlement.EventManagement.Services.MultiSports.MatchServiceImp;

namespace Settlement.WebSites.Configurations;

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
        services.AddTransient<CachingMatchesService, CachingMatchesServiceImp>();
        services.AddTransient<CompareMultiSportMatchService, CompareMultiSportMatchServiceImp>();
        services.AddTransient<GetDataFilterService, GetDataFilterServiceImp>();
    }

    public static void ConfigEventManagementMediator(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CalculationController).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(MultiSportController).Assembly));
    }
}