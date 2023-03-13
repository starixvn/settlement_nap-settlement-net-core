using AutoMapper;
using Fanex.Caching;
using Fanex.Data;
using Fanex.Data.Repository;
using Fanex.Data.SqlServer;
using Fanex.Logging;
using Fanex.Logging.Extensions;
using Fanex.Logging.Extensions.AspNetCore;
using Fanex.Logging.Extensions.Database;
using Fanex.Logging.Sentry.RavenClient;
using Fanex.MailDeliver.MailClient;
using Fanex.NAP.Client.AspNetCore.Configuration;
using Fanex.NAP.Client.AspNetCore.Session;
using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Client.Services;
using Fanex.RemotingRef;
using Fanex.Settlement.Converter.Services;
using Fanex.Settlement.ScaleOut;
using Fanex.Settlement.ScaleOut.Services;
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
using Settlement.WebSites.App_Start;
using Settlement.WebSites.Configurations;
using SharpRaven;
using StackExchange.Redis;
using System.IO.Compression;
using ILogger = Fanex.Logging.ILogger;
using LogServiceImp = Settlement.Core.Services.LogServiceImp;

namespace Settlement.WebSites;

public static class WebSites
{
    public static readonly string AllowOrigin = "AllowOrigin";

    public static readonly int BytesPerSecond = 240;

    public static readonly TimeSpan GacePeriod = TimeSpan.FromSeconds(30);

    public static void ConfigureAuthentication(this IServiceCollection services, IConfiguration configuration)
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

    public static void ConfigureAuthorization(this IServiceCollection services)
    {
        services.AddControllers(config =>
        {
            var policy = new AuthorizationPolicyBuilder()
                             .RequireAuthenticatedUser()
                             .Build();
            config.Filters.Add(new AuthorizeFilter(policy));
        });
    }

    public static void ConfigureCORS(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(AllowOrigin,
                builder =>
                {
                    builder.WithOrigins("http://localhost:5001",
                                        "https://localhost:44346",
                                        "http://localhost:55201",
                                        "http://localhost:58793")
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });
        });
    }

    public static void ConfigureRedis(this IServiceCollection services, IConfiguration configuration)
    {
        var redisConfig = configuration.GetSection("AuthSettings:RedisConfig").Value;
        var redisMultiplexer = ConnectionMultiplexer.Connect(redisConfig);

        services.AddDataProtection()
            .PersistKeysToStackExchangeRedis(redisMultiplexer, "Fanex.Settlement-ProtectionKeys");

        services.AddSingleton(redisMultiplexer);

        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConfig;
            options.InstanceName = "Fanex.Settlement.Session-";
        });

        services.AddMemoryCache();
    }

    public static void ConfigureSession(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSession(options =>
        {
            options.Cookie.IsEssential = true;
            options.IdleTimeout = TimeSpan.FromMinutes(int.Parse(configuration.GetSection("AuthSettings:SessionTimeOut").Value));
            options.Cookie.Name = "Fanex.Settlement.Session";
        });
    }

    public static void ConfigInternalService(this IServiceCollection services)
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

    public static void ConfigureNapServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddTransient<ILogger, Logger>();
        services.AddSingleton<INapSettings>(new NapSettings(configuration));
        services.AddSingleton<INapSession, NapSession>();
        services.AddSingleton<ICacheService, CacheService>();

        services.AddSingleton<IGroupService, GroupService>();
        services.AddSingleton<IUserService, UserService>();
        services.AddSingleton<ISecurityService, SecurityService>();
        services.AddTransient<IBalanceUpService, BalanceUpServiceImp>();

        RefDataTypeContainer
            .ConnectTo(new Uri(configuration.GetSection("Fanex.RemotingRef.Service.Url").Value))
            .FromApplication("Settlement");
        services.Configure<IConfiguration>(configuration);
        services.AddSingleton<IRemotingRefService, RemotingRefService>();
    }

    public static void ConfigureFanex(IConfiguration configuration)
    {
        var connections = configuration.GetSection("ConnectionStrings")
                               .GetChildren()
                               .AsEnumerable()
                               .ToDictionary(
                                        x => x.GetValue<string>("Name"),
                                        y => new ConnectionConfiguration(y.GetValue<string>("Name"), y.GetValue<string>("ConnectionString"), y.GetValue<string>("ProviderName"))
                                );

        DbSettingProviderManager
          .StartNewSession()
          .Use(connections)
          .WithSqlServer()
          .UseDefaultDbSettingProvider(resourcePath: configuration.GetSection("StoredProcedurePath").Value)
          .Run();

        LogManager
        .SetDefaultLogCategory(configuration.GetSection("LogCategory").Value)
        .Use(new List<ILogEngine>
        {
                new SentryLogging(new SentryEngineOptions
                {
                    Dsn = new Dsn(configuration.GetSection("SentryEngineOptions:Dsn").Value)
                })
        });

        ExceptionHandler
            .UseConfig(new LoggingConfiguration())
            .UseGetDbExceptionInfo(DatabaseInfoGetters.GetDbExceptionInfo);

        AppSettings.AppMailId = configuration.GetSection("MailServer:Id").Value;
        AppSettings.AppMailAddress = configuration.GetSection("MailServer:Address").Value;
    }

    public static void ConfigureCore(this IServiceCollection services)
    {
        services.AddScoped<IDynamicRepository, DynamicRepository>();
        services.AddScoped<IRemotingRefService, RemotingRefService>();
        services.AddTransient<IRefDataService, RefDataService>();
        services.AddSingleton<PermissionService, PermissionServiceImp>();
        services.AddSingleton<XmlConvertService, XmlConvertServiceImp>();
        services.AddTransient<ILogService, LogServiceImp>();
        services.AddScoped<LogDirectlyService, LogDirectlyServiceImp>();

        services.AddTransient<IScoreSetService, ScoreSetServiceImp>();
        services.AddTransient<ScaleOutSettleService, ScaleOutSettleServiceImp>();
        services.AddTransient<ScaleOutSettleThirdPartyService, ScaleOutSettleThirdPartyServiceImp>();
        services.AddTransient<GeneralService, GeneralServiceImp>();
    }

    public static void ConfigureMediator(this IServiceCollection services)
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

    public static void ConfigureAutoMapper(this IServiceCollection services)
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
    }

    public static void OnebookUM(this IServiceCollection services, IConfiguration configuration)
    {
        services.RegisterServiceCollection(configuration);
    }

    public static void ConfigureMessagePack(this IServiceCollection services)
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
            options.MimeTypes = new[]{
                    "text/html",
                    "text/css",
                    "application/javascript",
                    "application/json",
                    "application/x-msgpack"
            };
        });
    }
}