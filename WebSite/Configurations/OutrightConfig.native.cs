using MediatR;
using Settlement.Outright.Controllers;
using Settlement.Outright.Services;

namespace Settlement.WebSites.Configurations;

public static class OutrightConfig
{
    public static void OutrightConfigServices(this IServiceCollection services)
    {
        services.AddTransient<FilterService, FilterServiceImp>();
        services.AddTransient<OutrightPermissionService, OutrightPermissionServiceImp>();
        services.AddTransient<OutrightSettleService, OutrightSettleServiceImp>();
        services.AddTransient<OutrightSettleProcessService, OutrightSettleProcessServiceImp>();
        services.AddTransient<OutrightLogQueryService, OutrightLogQueryServiceImp>();
        services.AddTransient<OutrightLogProcessService, OutrightLogProcessServiceImp>();
        services.AddTransient<OutrightLogService, OutrightLogServiceImp>();
    }

    public static void OutrightConfigMediator(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(OutrightController).Assembly));
    }
}