using AutoMapper;
using Fanex.Caching;
using Fanex.Caching.Redis;
using Fanex.Data;
using Fanex.Data.Repository;
using Fanex.Data.SqlServer;
using Fanex.Logging;
using Fanex.Logging.Extensions;
using Fanex.Logging.Extensions.AspNetCore;
using Fanex.Logging.Extensions.Database;
using Fanex.Logging.Sentry;
using Fanex.NAP.Client.AspNetCore.Configuration;
using Fanex.NAP.Client.AspNetCore.Session;
using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Client.Services;
using Fanex.RemotingRef;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sentry;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio;
using Settlement.Sportsbook.MoveTickets;
using Settlement.Sportsbook.OtherSports;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using Settlement.Sportsbook.Soccer;
using ONEbook.UM.Configurations;
using ONEbook.UM.AspNetCore;
using ONEbook.UM.Helpers;
using ONEbook.UM.Transport;
using Settlement.Log;
using Settlement.WebSites.Configurations;
using LogServiceImp = Settlement.Core.Services.LogServiceImp;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.ResponseCompression;
using MessagePack.AspNetCoreMvcFormatter;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Settlement.EventManagement;
using Settlement.FastMarkets;
using Settlement.ThirdPartyProducts;
using Settlement.Setting;

namespace Settlement.WebSites
{
    public partial class Startup
    {
        private const string allowOrigin = "AllowOrigin";

        private void ConfigureAuthentication(IServiceCollection services)
        {
            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                        .AddCookie(options =>
                        {
                            options.LoginPath = Configuration.GetSection("AuthSettings:LoginPath").Value;
                            options.LogoutPath = Configuration.GetSection("AuthSettings:LogoutPath").Value;
                            options.ExpireTimeSpan = TimeSpan.FromMinutes(int.Parse(Configuration.GetSection("AuthSettings:CookieTimeOut").Value));
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

        private static void ConfigureAuthorization(IServiceCollection services)
        {
            services.AddControllers(config =>
            {
                var policy = new AuthorizationPolicyBuilder()
                                 .RequireAuthenticatedUser()
                                 .Build();
                config.Filters.Add(new AuthorizeFilter(policy));
            });
        }

        private static void ConfigureCORS(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(allowOrigin,
                    builder =>
                    {
                        builder.WithOrigins("http://localhost:5001",
                                            "https://localhost:44346",
                                            "http://localhost:55201",
                                            "http://localhost:58793",

                                            "https://settlement.nexdev.net",
                                            "https://settlement-netcore.nexdev.net",
                                            "https://settlement-netcore-v1.nexdev.net",
                                            "https://settlement-netcore-v2.nexdev.net",
                                            "https://settlement-netcore-v3.nexdev.net",

                                            "https://nap-settlement.playthefun.com",
                                            "https://napsettlement.playthefun.com",
                                            "https://napsettlementcore.playthefun.com",
                                            "https://napsettlementcore2.playthefun.com",
                                            "https://napsettlementcore3.playthefun.com",

                                            "https://napsettlement.starixuat.com",
                                            "https://napsettlementcore.starixuat.com",
                                            "https://napsettlementcore2.starixuat.com",
                                            "https://napsettlementcore3.starixuat.com",

                                            "https://settlement.sportsfun.app",
                                            "https://settlementcore.sportsfun.app",

                                            "https://settlement.oneops.net",
                                            "https://settlementcore.oneops.net",

                                            "https://settlement2.oneops.net",
                                            "https://settlementcore2.oneops.net",

                                            "https://settlement3.oneops.net",
                                            "https://settlementcore3.oneops.net")
                              .AllowAnyMethod()
                              .AllowAnyHeader()
                              .AllowCredentials();
                    });
            });
        }

        private void ConfigureRedis(IServiceCollection services)
        {
            var redisConfig = Configuration.GetSection("AuthSettings:RedisConfig").Value;
            var redis = ConnectionMultiplexer.Connect(redisConfig);

            services.AddDataProtection()
                .PersistKeysToStackExchangeRedis(redis, "Fanex.Settlement-ProtectionKeys");

            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConfig;
                options.InstanceName = $"Fanex.Settlement.Session-";
            });

            services.AddRedisCache(Configuration.GetSection("fanex.caching.redis"));
        }

        private void ConfigureSession(IServiceCollection services)
        {
            services.AddSession(options =>
            {
                options.Cookie.IsEssential = true;
                options.IdleTimeout = TimeSpan.FromMinutes(int.Parse(Configuration.GetSection("AuthSettings:SessionTimeOut").Value));
                options.Cookie.Name = "Fanex.Settlement.Session";
            });
        }

        private static void ConfigInternalService(IServiceCollection services)
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
        }

        private void ConfigureNapServices(IServiceCollection services)
        {
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddTransient<ILogger, Logger>();
            services.AddSingleton<INapSettings>(new NapSettings(Configuration));
            services.AddSingleton<INapSession, NapSession>();
            services.AddSingleton<ICacheService, CacheService>();

            services.AddSingleton<IGroupService, GroupService>();
            services.AddSingleton<IUserService, UserService>();
            services.AddSingleton<ISecurityService, SecurityService>();
            services.AddTransient<IBalanceUpService, BalanceUpServiceImp>();
           
            RefDataTypeContainer
                .ConnectTo(new Uri(Configuration.GetSection("Fanex.RemotingRef.Service.Url").Value))
                .FromApplication("Settlement");
            services.Configure<IConfiguration>(Configuration);
            services.AddSingleton<IRemotingRefService, RemotingRefService>();
        }

        private void ConfigureFanex()
        {
            var connections = Configuration.GetSection("ConnectionStrings")
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
              .UseDefaultDbSettingProvider(resourcePath: Configuration.GetSection("StoredProcedurePath").Value)
              .Run();

            LogManager
            .SetDefaultLogCategory(Configuration.GetSection("LogCategory").Value)
            .Use(new List<ILogEngine>
            {
                new SentryLogging(new SentryEngineOptions
                {
                    Dsn = new Dsn(Configuration.GetSection("SentryEngineOptions:Dsn").Value)
                })
            });

            ExceptionHandler
                .UseConfig(new LoggingConfiguration())
                .UseGetDbExceptionInfo(DatabaseInfoGetters.GetDbExceptionInfo);
        }

        private void ConfigureCore(IServiceCollection services)
        {
            services.AddScoped<IDynamicRepository, DynamicRepository>();
            services.AddScoped<IRemotingRefService, RemotingRefService>();
            services.AddTransient<IRefDataService, RefDataService>();
            services.AddSingleton<PermissionService, PermissionServiceImp>();
            services.AddSingleton<XmlConvertService, XmlConvertServiceImp>();
            services.AddTransient<ILogService, LogServiceImp>();
            services.AddTransient<IScoreSetService, ScoreSetServiceImp>();
            services.AddSingleton<IUMCacheService, UMCacheService>();
            services.AddSingleton<IUMRestClient, UMRestClient>();
            services.AddSingleton(new UMClientConfiguration().Initialize(Configuration));
            services.AddSingleton<ONEbook.UM.Services.IMaintenanceService, ONEbook.UM.Services.MaintenanceService>();
        }

        private static void ConfigureMediator(IServiceCollection services)
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
        }

        private static void ConfigureAutoMapper(IServiceCollection services)
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
            });

            var mapper = mapperConfig.CreateMapper();
            services.AddSingleton(mapper);
        }

        private static void ConfigureMessagePack(IServiceCollection services)
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
}