using MediatR;
using Settlement.Outright.Controllers;
using Settlement.Outright.Services;
using Settlement.Services.Outright;
using System.Reflection;

namespace Settlement.WebSites.Configurations;

public static class OutrightConfig
{
    public static void OutrightConfigServices(this IServiceCollection services)
    {
        services.AddTransient<FilterService, FilterServiceImp>();
        services.AddTransient<OutrightPermissionService, OutrightPermissionServiceImp>();
    }

    public static void OutrightConfigMediator(this IServiceCollection services)
    {
        services.AddMediatR(typeof(OutrightController).GetTypeInfo().Assembly);
    }
}