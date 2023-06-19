using Settlement.Sportsbook.MoveTickets.Controllers;
using Settlement.Sportsbook.MoveTickets.Services;

namespace Settlement.WebSites.Configurations;

using Sportsbook.MoveTickets.Services.MultipleServer;

public static class MoveTicketConfig
{
    public static void ConfigMoveTicketServices(this IServiceCollection services)
    {
        services.AddTransient<IMatchResultDetailService, MatchResultDetailServiceImp>();
        services.AddTransient<IMatchService, MatchServiceImp>();
        services.AddTransient<MoveTicketService, MoveTicketServiceImp>();
        services.AddTransient<IScoreService, ScoreServiceImp>();
        services.AddTransient<IScoreSetService, ScoreSetServiceImp>();
        services.AddTransient<CompareMatchService, CompareMatchServiceImp>();
        services.AddTransient<MoveActionService, MoveActionServiceImp>();
        services.AddTransient<MoveRunningService, MoveRunningServiceImp>();
        services.AddTransient<NewInfoMatchService, NewInfoMatchServiceImp>();
        services.AddTransient<SiteMatchService, SiteMatchServiceImp>();
    }

    public static void ConfigMoveTicketMediator(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(MoveTicketController).Assembly));
    }
}