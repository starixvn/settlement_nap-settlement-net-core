using Settlement.Setting.Controllers;
using Settlement.Setting.Handlers;
using Settlement.Setting.Services;

namespace Settlement.WebSites.Configurations;

public static class SettingConfig
{
    public static void SettingConfigServices(this IServiceCollection services)
    {
        services.AddTransient<NotificationService, NotificationServiceImp>();
        services.AddTransient<SettingService, SettingServiceImp>();
        services.AddTransient<ProviderSettingService, ProviderSettingServiceImp>();
        services.AddTransient<OutsideSourceSettingService, OutsideSourceSettingServiceImp>();
        services.AddTransient<SendMailService, SendMailServiceImp>();
        services.AddScoped<GetAutoSettleSettingsHandler>();
        services.AddScoped<UpdateAutoSettingsHandler>();
        services.AddScoped<UpdateMatchSoccerSettingsHandler>();
        services.AddScoped<UpdateSoccerSettingHandler>();

    }

    public static void SettingConfigMediator(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(SourceManagerController).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(MatchSettingController).Assembly));
    }
}