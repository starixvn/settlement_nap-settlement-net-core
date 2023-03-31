using MediatR;
using Settlement.Sportsbook.OtherSports.Controllers;
using Settlement.Sportsbook.OtherSports.Services;

namespace Settlement.WebSites.Configurations;

public static class OtherSportsConfig
{
    public static void ConfigOtherSportsServices(this IServiceCollection services)
    {
        services.AddTransient<SettlementActionsService, SettlementActionsServiceImp>();
        services.AddTransient<SportsbookService, SportsbookServiceImp>();
        services.AddTransient<GenerateService, GenerateServiceImp>();
        services.AddTransient<MultipleServerService, MultipleServerServiceImp>();
        services.AddTransient<MergeDataService, MergeDataServiceImp>();
    }

    public static void ConfigOtherSportsMediator(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(OtherSportsController).Assembly));
    }
}