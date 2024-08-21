using Settlement.Gaming.Controllers;
using Settlement.Gaming.Services;
using NumberGame = Settlement.Gaming.Services.NumberGame;

namespace Settlement.WebSites.Configurations;

public static class GamingConfig
{
    public static void GamingConfigServices(this IServiceCollection services)
    {
        services.AddSingleton<PermissionService, Happy5PermissionServiceImp>();

        services.AddTransient<NumberGame.MatchService, NumberGame.MatchServiceImp>();
        services.AddTransient<NumberGame.LeagueService, NumberGame.LeagueServiceImp>();
        services.AddTransient<NumberGame.SettlementService, NumberGame.SettlementServiceImp>();
        services.AddSingleton<NumberGame.PermissionService, NumberGame.NumberGamePermissionServiceImp>();
    }

    public static void GamingConfigMediator(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(NumberGameController).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Happy5Controller).Assembly));
    }
}