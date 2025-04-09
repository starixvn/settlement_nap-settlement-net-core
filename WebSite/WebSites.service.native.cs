using System.IO.Compression;
using AutoMapper;
using Fanex.Caching;
using Fanex.Data.Repository;
using Fanex.Logging;
using Fanex.MailDeliver.MailClient;
using Fanex.RemotingRef;
using Fanex.Settlement.Converter.Services;
using Fanex.Settlement.ScaleOut;
using Fanex.Settlement.ScaleOut.Services;
using Mapster;
using MessagePack.AspNetCoreMvcFormatter;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Settlement.Core.Services;
using Settlement.EventManagement;
using Settlement.FastMarkets;
using Settlement.Gaming;
using Settlement.Log;
using Settlement.Outright;
using Settlement.Setting;
using Settlement.Sportsbook.Aio;
using Settlement.Sportsbook.MoveTickets;
using Settlement.Sportsbook.OtherSports;
using Settlement.Sportsbook.Soccer;
using Settlement.ThirdPartyProducts;
using Settlement.WebSites.Configurations;
using StackExchange.Redis;
using ILogger = Fanex.Logging.ILogger;
using LogService = Settlement.Core.Services.LogService;
using LogServiceImp = Settlement.Core.Services.LogServiceImp;

namespace Settlement.WebSites;

public static class WebSites
{
    public static void AddAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                    .AddCookie(options =>
                    {
                        options.LoginPath = configuration.GetSection("AuthSettings:LoginPath").Value;
                        options.LogoutPath = configuration.GetSection("AuthSettings:LogoutPath").Value;
                        options.ExpireTimeSpan = TimeSpan.FromMinutes(int.Parse(configuration.GetSection("AuthSettings:CookieTimeOut").Value));
                        options.Cookie = new CookieBuilder
                        {
                            Name = "Fanex.Settlement.Cookie",
                            SecurePolicy = CookieSecurePolicy.SameAsRequest
                        };
                        options.Events.OnSigningOut = context =>
                        {
                            context.Response.Redirect(options.LoginPath);
                            return Task.CompletedTask;
                        };
                    });
    }

    public static void AddAuthorizationPolicy(this IServiceCollection services)
    {
        services.AddControllers(config =>
        {
            var policy = new AuthorizationPolicyBuilder()
                             .RequireAuthenticatedUser()
                             .Build();
            config.Filters.Add(new AuthorizeFilter(policy));
        });
    }

    public static void AddConfigRedisCache(this IServiceCollection services, IConfiguration configuration)
    {
        var redisConfig = configuration.GetSection("AuthSettings:RedisConfig").Value;
        var redisMultiplexer = ConnectionMultiplexer.Connect(redisConfig);

        services.AddDataProtection()
            .PersistKeysToStackExchangeRedis(redisMultiplexer, "Fanex.Settlement-ProtectionKeys");

        services.AddSingleton<IConnectionMultiplexer>(redisMultiplexer);

        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConfig;
            options.InstanceName = "Fanex.Settlement.Session-";
        });
    }

    public static void AddSession(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSession(options =>
        {
            options.Cookie.IsEssential = true;
            options.IdleTimeout = TimeSpan.FromMinutes(int.Parse(configuration.GetSection("AuthSettings:SessionTimeOut").Value));
            options.Cookie.Name = "Fanex.Settlement.Session";
        });
    }

    public static void AddInternalService(this IServiceCollection services)
    {
        services.ConfigOtherSportsServices();
        services.ConfigMoveTicketServices();
        services.ConfigAioServices();
        services.ConfigSoccerServices();
        services.ConfigEventManagementServices();
        services.ConfigLogServices();
        services.ConfigFastMarketsServices();
        services.ThirdPartyProductsConfigServices();
        services.SettingConfigServices();
        services.GamingConfigServices();
        services.OutrightConfigServices();
    }

    public static void AddNapServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddTransient<ILogger, Logger>();
        services.AddSingleton<ICacheService, CacheService>();

        services.AddTransient<IBalanceUpService, BalanceUpServiceImp>();
        services.AddScoped<HttpService>();

        RefDataTypeContainer
            .ConnectTo(new Uri(configuration.GetSection("Fanex.RemotingRef.Service.Url").Value))
            .FromApplication("Settlement");
        services.Configure<IConfiguration>(configuration);
        services.AddSingleton<IRemotingRefService, RemotingRefService>();

        AppSettings.AppMailId = configuration.GetSection("MailServer:Id").Value;
        AppSettings.AppMailAddress = configuration.GetSection("MailServer:Address").Value;
    }

    public static void AddCoreServices(this IServiceCollection services)
    {
        services.AddScoped<IDynamicRepository, DynamicRepository>();
        services.AddTransient<IRefDataService, RefDataService>();
        services.AddSingleton<PermissionService, PermissionServiceImp>();
        services.AddSingleton<XmlConvertService, XmlConvertServiceImp>();
        services.AddTransient<LogService, LogServiceImp>();
        services.AddTransient<AdjustEventStatusService, AdjustEventStatusServiceImp>();

        services.AddTransient<IScoreSetService, ScoreSetServiceImp>();
        services.AddTransient<ScaleOutSettleService, ScaleOutSettleServiceImp>();
        services.AddTransient<ScaleOutSettleThirdPartyService, ScaleOutSettleThirdPartyServiceImp>();
        services.AddTransient<GeneralService, GeneralServiceImp>();
    }

    public static void AddMediator(this IServiceCollection services)
    {
        services.ConfigAioMediator();
        services.ConfigMoveTicketMediator();
        services.ConfigOtherSportsMediator();
        services.ConfigSoccerMediator();
        services.ConfigEventManagementMediator();
        services.ConfigLogMediator();
        services.ConfigFastMarketsMediator();
        services.ThirdPartyProductsConfigMediator();
        services.SettingConfigMediator();
        services.GamingConfigMediator();
        services.OutrightConfigMediator();
    }

    public static void AddAutoMapper(this IServiceCollection services)
    {
        var mapperConfig = new MapperConfiguration(mc =>
        {
            mc.AddProfile(typeof(SportsbookAioAutoMapperProfile));
            mc.AddProfile(typeof(SportsbookMoveTicketAutoMapperProfile));
            mc.AddProfile(typeof(OtherSportsAutoMapperProfile));
            mc.AddProfile(typeof(SoccerAutoMapperProfile));
            mc.AddProfile(typeof(LogAutoMapper));
            mc.AddProfile(typeof(EventManagementAutoMapperProfile));
            mc.AddProfile(typeof(FastMarketAutoMapperProfile));
            mc.AddProfile(typeof(ThirdPartyProductsAutoMapperProfile));
            mc.AddProfile(typeof(SettingAutoMapperProfile));
            mc.AddProfile(typeof(GamingMapperProfile));
            mc.AddProfile(typeof(ScaleOutMappingProfile));
            mc.AddProfile(typeof(OutrightMapperProfile));
        });

        var mapper = mapperConfig.CreateMapper();
        services.AddSingleton(mapper);
        services.AddMapster();
    }

    public static void AddMessagePack(this IServiceCollection services)
    {
        services.AddMvc().AddMvcOptions(option =>
        {
            option.OutputFormatters.Add(new MessagePackOutputFormatter());
            option.InputFormatters.Add(new MessagePackInputFormatter());
        });

        services.Configure<KestrelServerOptions>(options =>
        {
            options.AllowSynchronousIO = true;
        });

        services.Configure<IISServerOptions>(options =>
        {
            options.AllowSynchronousIO = true;
        });

        services.Configure<GzipCompressionProviderOptions>(options => options.Level = CompressionLevel.Optimal);
        services.AddResponseCompression(options =>
        {
            options.MimeTypes =
            [
                "text/html",
                    "text/css",
                    "application/javascript",
                    "application/json",
                    "application/x-msgpack"
            ];
        });
    }
}