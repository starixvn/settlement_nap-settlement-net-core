using MediatR;
using Settlement.Log.Controllers;
using Settlement.Log.Services;

namespace Settlement.WebSites.Configurations;

public static class LogConfig
{
    public static void ConfigLogServices(this IServiceCollection services)
    {
        services.AddTransient<LogDetailService, LogDetailServiceImp>();
        services.AddTransient<LogService, LogServiceImp>();
        services.AddTransient<PositionService, PositionServiceImp>();
        services.AddTransient<RemarkNodeService, RemarkNodeServiceImp>();
        services.AddTransient<RemarkService, RemarkServiceImp>();
        services.AddTransient<ResultService, ResultServiceImp>();
    }

    public static void ConfigLogMediator(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(LogController).Assembly));
    }
}