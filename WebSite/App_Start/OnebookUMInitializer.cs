using ONEbook.UM.AspNetCore;
using ONEbook.UM.AspNetCore.Filters;
using ONEbook.UM.Configurations;
using ONEbook.UM.Helpers;
using ONEbook.UM.Services;
using ONEbook.UM.Transport;

namespace Settlement.WebSites.App_Start;

public static class OnebookUmInitializer
{
    public static void RegisterServiceCollection(this IServiceCollection services, IConfiguration configuration)
    {
        var umConfig = new UMClientConfiguration();
        services.AddSingleton(umConfig.Initialize(configuration));
        services.AddScoped<CheckUMFilterAttribute>();
        services.AddSingleton<IUMCacheService, MemoryUmCacheService>();
        services.AddSingleton<IUMRestClient, UMRestClient>();
        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.AddSingleton<IHttpContextHelper, HttpContextHelper>();
        services.AddSingleton<IMaintenanceService, MaintenanceService>();
    }
}

public class HttpContextHelper : IHttpContextHelper
{
    private readonly IHttpContextAccessor httpContextAccessor;

    public HttpContextHelper(IHttpContextAccessor httpContextAccessor)
    {
        this.httpContextAccessor = httpContextAccessor;
    }

    public string GetSession(string key)
    {
        var value = httpContextAccessor?.HttpContext?.Session.GetString(key);
        return value ?? string.Empty;
    }

    public void SetSession(string key, string value)
    {
        var session = httpContextAccessor?.HttpContext?.Session;
        session?.SetString(key, value);
    }

    public string GetValueFromQueryString(string queryKey)
    {
        var context = httpContextAccessor.HttpContext;
        var value = context == null ? string.Empty : context.Request.Query[queryKey].ToString();
        return value;
    }
}