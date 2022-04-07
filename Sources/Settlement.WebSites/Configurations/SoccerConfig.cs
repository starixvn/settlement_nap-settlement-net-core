using System.Reflection;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Controllers;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;
using Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus;

namespace Settlement.WebSites.Configurations
{
    public static class SoccerConfig
    {
        public static void ConfigSoccerServices(this IServiceCollection services)
        {
            services.AddTransient<Core.Services.IFirstGoalLastGoalService, Core.Services.FirstGoalLastGoalServiceImp>();
            services.AddTransient<IMatchService, MatchServiceImp>();
            services.AddTransient<IGoalIconService, GoalIconServiceImp>();
            services.AddTransient<IBetStatusAllService, BetStatusAllServiceImp>();
            services.AddTransient<IGoalRecordService, GoalRecordServiceImp>();
            services.AddTransient<ICalculateService, CalculateServiceImp>();
            services.AddTransient<ISoccerBetStatusService, SoccerBetStatusServiceImp>();
            services.AddTransient<IValidationService, ValidationServiceImp>();
            services.AddTransient<Sportsbook.Soccer.Services.FullTimeBetStatus.IBetStatusService, Sportsbook.Soccer.Services.FullTimeBetStatus.BetStatusServiceImp>();
            services.AddTransient<Sportsbook.Soccer.Services.FullTimeBetStatus.IFirstGoalLastGoalService, Sportsbook.Soccer.Services.FullTimeBetStatus.FirstGoalLastGoalServiceImp>();
            services.AddTransient<IFullTimeService, FullTimeServiceImp>();
            services.AddTransient<IHalftimeFullTimeService, HalftimeFullTimeServiceImp>();
            services.AddTransient<IScoreAndGoalService, ScoreAndGoalServiceImp>();
            services.AddTransient<Sportsbook.Soccer.Services.HalfTimeBetStatus.IBetStatusService, Sportsbook.Soccer.Services.HalfTimeBetStatus.BetStatusServiceImp>();
            services.AddTransient<IHalftimeScoreAndGoalService, HalftimeScoreAndGoalServiceImp>();
            services.AddTransient<IHalftimeService, HalftimeServiceImp>();
            services.AddTransient<IResourceService, ResourceServiceImp>();
            services.AddTransient<IActionResourceService, ActionResourceServiceImp>();
            services.AddTransient<IInstantGoalCheckingService, InstantGoalCheckingServiceImp>();
            services.AddTransient<IInstantResourceService, InstantResourceServiceImp>();
            services.AddTransient<IInstantCalculateService, InstantCalculateServiceImp>();
            services.AddTransient<IRefundService, RefundServiceImp>();
        }

        public static void ConfigSoccerMediator(this IServiceCollection services)
        {
            services.AddMediatR(typeof(SoccerController).GetTypeInfo().Assembly);
        }
    }
}