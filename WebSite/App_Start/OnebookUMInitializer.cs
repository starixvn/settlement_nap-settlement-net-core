using Microsoft.Extensions.Caching.Memory;
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

public class MemoryUmCacheService(IMemoryCache memoryCache) : IUMCacheService
{
    public T Get<T>(string key) => memoryCache.Get<T>(key);

    public void Set<T>(string key, T value, TimeSpan absoluteExpiration)
        => memoryCache.Set(key, value, new MemoryCacheEntryOptions().SetAbsoluteExpiration(absoluteExpiration));

    public void Remove(string key) => memoryCache.Remove(key);
}