using System.Reflection;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Settlement.Sportsbook.MoveTickets.Controllers;
using Settlement.Sportsbook.MoveTickets.Services;

namespace Settlement.WebSites.Configurations
{
    public static class MoveTicketConfig
    {
        public static void ConfigMoveTicketServices(this IServiceCollection services)
        {
            services.AddTransient<IMatchResultDetailService, MatchResultDetailServiceImp>();
            services.AddTransient<IMatchService, MatchServiceImp>();
            services.AddTransient<IMoveTicketService, MoveTicketServiceImp>();
            services.AddTransient<IScoreService, ScoreServiceImp>();
            services.AddTransient<IScoreSetService, ScoreSetServiceImp>();
            services.AddTransient<CompareMatchService, CompareMatchServiceImp>();
            services.AddTransient<MoveTicketMultipleServerService, MoveTicketMultipleServerServiceImp>();
            services.AddTransient<NewInfoMatchService, NewInfoMatchServiceImp>();
            services.AddTransient<SiteMatchService, SiteMatchServiceImp>();
        }

        public static void ConfigMoveTicketMediator(this IServiceCollection services)
        {
            services.AddMediatR(typeof(MoveTicketController).GetTypeInfo().Assembly);
        }
    }
}