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
using Fanex.NAP.Client.Transport;
using Fanex.RemotingRef;
using Kaden.XmlConverter;
using MediatR;
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
using Settlement.Sportsbook.Aio.Controllers;
using Settlement.Sportsbook.Aio.Mapper;
using Settlement.Sportsbook.Aio.Services;
using Settlement.Sportsbook.Cricket;
using Settlement.Sportsbook.Cricket.Controllers;
using Settlement.Sportsbook.Cricket.Services;
using Settlement.Sportsbook.MoveTickets;
using Settlement.Sportsbook.MoveTickets.Controllers;
using Settlement.Sportsbook.MoveTickets.Services;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

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
                                            "https://settlement-netcore-v1.nexdev.net",
                                            "https://settlement-netcore-v2.nexdev.net",
                                            "https://settlement-netcore-v3.nexdev.net",

                                            "https://nap-settlement.playthefun.com",
                                            "https://napsettlement.playthefun.com",

                                            "https://napsettlement.starixuat.com",
                                            "https://napsettlementcore.starixuat.com",

                                            "https://settlement.oneops.net",
                                            "https://settlementcore.oneops.net")
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
            services.AddTransient<IAioService, AioService>();
            services.AddTransient<ICricketBetTypeService, CricketBetTypeService>();
            services.AddTransient<IMatchResultDetailService, MatchResultDetailService>();
            services.AddTransient<IMatchService, MatchService>();
            services.AddTransient<IMoveTicketService, MoveTicketService>();
            services.AddTransient<IScoreService, ScoreService>();
            services.AddTransient<IScoreSetService, ScoreSetService>();
            services.AddTransient<ILogService, LogServiceImp>();
            services.AddTransient<IMapperFactory, MapperFactoryBase>();
            services.AddTransient<IMapperFactory, MapperFactoryImp>();
            services.AddTransient<IValidateApiKeyService, ValidateApiKeyServiceImp>();
            services.AddTransient<ICriteriaFactory, CriteriaFactoryImp>();
            services.AddTransient<ICricketService, CricketService>();
            services.AddTransient<ICreateQueryService, CreateQueryServiceImp>();
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
            services.AddSingleton<ISiteService, SiteService>();

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

        private static void ConfigureCore(IServiceCollection services)
        {
            services.AddScoped<IDynamicRepository, DynamicRepository>();
            services.AddScoped<IRemotingRefService, RemotingRefService>();
            services.AddTransient<IRefDataService, RefDataService>();
            services.AddSingleton<PermissionService, PermissionServiceImp>();
            services.AddSingleton<XmlConvertService, XmlConvertServiceImp>();
            services.AddSingleton<ILoggingService, LoggingService>();
        }

        private static void ConfigureMediator(IServiceCollection services)
        {
            services.AddMediatR(typeof(AioController).GetTypeInfo().Assembly);
            services.AddMediatR(typeof(MoveTicketController).GetTypeInfo().Assembly);
            services.AddMediatR(typeof(CricketController).GetTypeInfo().Assembly);
        }

        private static void ConfigureAutoMapper(IServiceCollection services)
        {
            var mapperConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile(typeof(SportsbookAioAutoMapperProfile));
                mc.AddProfile(typeof(SportsbookMoveTicketAutoMapperProfile));
                mc.AddProfile(typeof(SportsbookCricketAutoMapperProfile));
            });

            IMapper mapper = mapperConfig.CreateMapper();
            services.AddSingleton(mapper);

            services.AddMvc();
        }
    }
}