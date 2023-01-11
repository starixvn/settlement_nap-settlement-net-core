using MediatR;
using Settlement.Excel.Services;
using Settlement.Outright.Controllers;
using Settlement.Outright.Models;
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
        services.AddTransient<OutrightSettleService, OutrightSettleServiceImp>();
        services.AddTransient<OutrightLogQueryService, OutrightLogQueryServiceImp>();
        services.AddTransient<OutrightLogService, OutrightLogServiceImp>();
        services.AddTransient<OutrightLogProcessService, OutrightLogProcessServiceImp>();
        services.AddTransient<ExportLogService, ExportLogServiceImp>();
        services.AddTransient<ExcelService<OutrightLogDetail>, OutrightExcelService>();
    }

    public static void OutrightConfigMediator(this IServiceCollection services)
    {
        services.AddMediatR(typeof(OutrightController).GetTypeInfo().Assembly);
        services.AddMediatR(typeof(OutrightLogController).GetTypeInfo().Assembly);
    }
}