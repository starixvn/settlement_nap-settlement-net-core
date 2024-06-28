using Fanex.Caching;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Settlement.Constants;
using Settlement.EventManagement.Models.Calculation;
using Settlement.EventManagement.Models.MultiSports;
using StackExchange.Redis;

namespace Settlement.WebSites.Controllers;

[AllowAnonymous]
public class AdministratorController(ICache cache, IConfiguration configuration) : Controller
{
    public ActionResult Cache()
    {
        var connectionString = configuration.GetSection("AuthSettings:RedisConfig").Value;
        var options = ConfigurationOptions.Parse(connectionString);
        var redis = ConnectionMultiplexer.Connect(options);

        var endPoints = redis.GetEndPoints();
        var appName = configuration.GetSection("Fanex.Caching.Redis:ApplicationName").Value;
        var keyPrefix = $"{{{appName}}}:{{";

        var keys = endPoints.Select(e => redis.GetServer(e).Keys(13, $"{{{appName}}}:*"))
            .SelectMany(k => k)
            .Select(k => k.ToString().Replace(keyPrefix, string.Empty))
            .Select(k => k.Remove(k.Length - 1))
            .Distinct()
            .OrderBy(k => k)
            .ToArray();

        ViewBag.CacheKeys = keys;
        return View(ViewPath.Cache);
    }

    public async Task<ActionResult> CacheContent(string cacheKey, string typeName = null)
    {
        if (cacheKey.Contains("Calculate-"))
        {
            var (_, response) = await cache.TryGetAsync<List<CalculateMatchWaiting>>(cacheKey);
            ViewBag.CacheContent = JsonConvert.SerializeObject(response);
        }
        else if (cacheKey.Contains("MultiSport-"))
        {
            var (_, response) = await cache.TryGetAsync<List<MultiSportMatchWaiting>>(cacheKey);
            ViewBag.CacheContent = JsonConvert.SerializeObject(response);
        }
        else
        {
            cache.TryGet(cacheKey, out dynamic cacheContent);
            if (cacheContent != null)
            {
                ViewBag.CacheContent = JsonConvert.SerializeObject(cacheContent[0]);
            }
        }

        return View(ViewPath.CacheContent);
    }
}