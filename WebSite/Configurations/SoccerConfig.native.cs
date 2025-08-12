using Settlement.Sportsbook.Soccer.Controllers;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;
using Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus;
using Settlement.Sportsbook.Soccer.Services.InstantCalculate;

namespace Settlement.WebSites.Configurations;

using Core.Services;
using Sportsbook.Soccer.Services.GetMatch;

public static class SoccerConfig
{
    public static void ConfigSoccerServices(this IServiceCollection services)
    {
        services.AddTransient<FirstGoalLastGoalService, FirstGoalLastGoalServiceImp>();
        services.AddTransient<IMatchService, MatchServiceImp>();
        services.AddTransient<GoalIconService, GoalIconServiceImp>();
        services.AddTransient<IBetStatusAllService, BetStatusAllServiceImp>();
        services.AddTransient<IGoalRecordService, GoalRecordServiceImp>();

        services.AddTransient<CalculateServiceDependencies>();
        services.AddTransient<CreateCriteriaServiceDependencies>();

        services.AddTransient<ICalculateService, CalculateServiceImp>();
        services.AddTransient<ISoccerBetStatusService, SoccerBetStatusServiceImp>();
        services.AddTransient<IValidationService, ValidationServiceImp>();
        services.AddTransient<Sportsbook.Soccer.Services.FullTimeBetStatus.IBetStatusService, Sportsbook.Soccer.Services.FullTimeBetStatus.BetStatusServiceImp>();
        services.AddTransient<FirstLastGoalService, FirstLastGoalServiceImp>();
        services.AddTransient<IFullTimeService, FullTimeServiceImp>();
        services.AddTransient<IHalftimeFullTimeService, HalftimeFullTimeServiceImp>();
        services.AddTransient<IScoreAndGoalService, ScoreAndGoalServiceImp>();
        services.AddTransient<Sportsbook.Soccer.Services.HalfTimeBetStatus.IBetStatusService, Sportsbook.Soccer.Services.HalfTimeBetStatus.BetStatusServiceImp>();
        services.AddTransient<IHalftimeScoreAndGoalService, HalftimeScoreAndGoalServiceImp>();
        services.AddTransient<IHalftimeService, HalftimeServiceImp>();
        services.AddTransient<IResourceService, ResourceServiceImp>();
        services.AddTransient<IActionResourceService, ActionResourceServiceImp>();
        services.AddTransient<IInstantGoalCheckingService, InstantGoalCheckingServiceImp>();
        services.AddTransient<InstantResourceService, InstantResourceServiceImp>();
        services.AddTransient<InstantCalculateService, InstantCalculateServiceImp>();
        services.AddTransient<PushInstantCalculationService, PushInstantCalculationServiceImp>();

        services.AddTransient<RefundServiceDependencies>();
        services.AddTransient<IRefundService, RefundServiceImp>();
        services.AddTransient<IFetchDataService, FetchDateServiceImp>();
        services.AddTransient<ICreateCriteriaService, CreateCriteriaServiceImp>();
        services.AddTransient<IMergeDataService, MergeDataServiceImp>();
        services.AddTransient<MatchEarlyService, MatchEarlyServiceImp>();
        services.AddTransient<EarlyBetTypeNameService, EarlyBetTypeNameServiceImp>();
        services.AddTransient<SettleEarlyService, SettleEarlyServiceImp>();
    }

    public static void ConfigSoccerMediator(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(SoccerController).Assembly));
    }
}