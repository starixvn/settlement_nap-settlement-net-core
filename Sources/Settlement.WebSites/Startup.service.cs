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
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Services;
using Settlement.Sportsbook.MoveTickets;
using Settlement.Sportsbook.MoveTickets.Controllers;
using Settlement.Sportsbook.MoveTickets.Services;
using Settlement.Sportsbook.OtherSports;
using Settlement.Sportsbook.OtherSports.Controllers;
using Settlement.Sportsbook.OtherSports.Services;
using Settlement.Sportsbook.Soccer.Services;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Settlement.Sportsbook.Soccer;
using Settlement.Sportsbook.Soccer.Controllers;
using Settlement.Sportsbook.Soccer.Services.FullTimeBetStatus;
using Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus;
using ONEbook.UM.Configurations;
using ONEbook.UM.AspNetCore;
using ONEbook.UM.Helpers;
using ONEbook.UM.Transport;
using IMatchResultDetailService = Settlement.Sportsbook.MoveTickets.Services.IMatchResultDetailService;
using IMatchService = Settlement.EventManagement.Services.IMatchService;
using IScoreService = Settlement.Sportsbook.MoveTickets.Services.IScoreService;
using IScoreSetService = Settlement.Sportsbook.MoveTickets.Services.IScoreSetService;
using MatchResultDetailService = Settlement.Sportsbook.MoveTickets.Services.MatchResultDetailService;
using MatchService = Settlement.EventManagement.Services.MatchService;
using ScoreService = Settlement.Sportsbook.MoveTickets.Services.ScoreService;
using ScoreSetService = Settlement.Sportsbook.MoveTickets.Services.ScoreSetService;

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
            services.AddTransient<IAioService, AioService>();
            services.AddTransient<IMatchResultDetailService, MatchResultDetailService>();
            services.AddTransient<Sportsbook.MoveTickets.Services.IMatchService, Sportsbook.MoveTickets.Services.MatchService>();
            services.AddTransient<IMoveTicketService, MoveTicketService>();
            services.AddTransient<IScoreService, ScoreService>();
            services.AddTransient<IScoreSetService, ScoreSetService>();
            services.AddTransient<IMapperFactory, MapperFactoryBase>();
            services.AddTransient<IMapperFactory, MapperFactoryImp>();
            services.AddTransient<IValidateApiKeyService, ValidateApiKeyServiceImp>();
            services.AddTransient<ICriteriaFactory, CriteriaFactoryImp>();
            services.AddTransient<ICreateQueryService, CreateQueryServiceImp>();

            services.AddTransient<SettlementActionsService, SettlementActionsServiceImp>();
            services.AddTransient<SportsbookService, SportsbookServiceImp>();

            services.AddTransient<Core.Services.IFirstGoalLastGoalService, Core.Services.FirstGoalLastGoalServiceImp>();
            services.AddTransient<Sportsbook.Soccer.Services.IMatchService, Sportsbook.Soccer.Services.MatchService>();
            services.AddTransient<IGoalIconService, GoalIconServiceImp>();
            services.AddTransient<IBetStatusAllService, BetStatusAllServiceImp>();
            services.AddTransient<IGoalRecordService, GoalRecordServiceImp>();
            services.AddTransient<ICalculateService, CalculateServiceImp>();
            services.AddTransient<ISoccerBetStatusService, SoccerBetStatusServiceImp>();
            services.AddTransient<IValidationService, ValidationServiceImp>();
            services.AddTransient<Sportsbook.Soccer.Services.FullTimeBetStatus.IBetStatusService, Sportsbook.Soccer.Services.FullTimeBetStatus.BetStatusServiceImp>();
            services.AddTransient<Sportsbook.Soccer.Services.FullTimeBetStatus.IFirstGoalLastGoalService, Sportsbook.Soccer.Services.FullTimeBetStatus.FirstGoalLastGoalServiceImp>();
            services.AddTransient<IFullTimeService, FullTimeServiceImp>();
            services.AddTransient<IHalftimeFullTimeService, HalftimeFullTimeServiceImp>();
            services.AddTransient<IScoreAndGoalService, ScoreAndGoalServiceImp>();
            services.AddTransient<Sportsbook.Soccer.Services.HalfTimeBetStatus.IBetStatusService, Sportsbook.Soccer.Services.HalfTimeBetStatus.BetStatusServiceImp>();
            services.AddTransient<IHalftimeScoreAndGoalService, HalftimeScoreAndGoalServiceImp>();
            services.AddTransient<IHalftimeService, HalftimeServiceImp>();
            services.AddTransient<IResourceService, ResourceServiceImp>();
            services.AddTransient<IActionResourceService, ActionResourceServiceImp>();
            services.AddTransient<IInstantGoalCheckingService, InstantGoalCheckingServiceImp>();
            services.AddTransient<IInstantResourceService, InstantResourceServiceImp>();
            services.AddTransient<IInstantCalculateService, InstantCalculateServiceImp>();
            services.AddTransient<IRefundService, RefundServiceImp>();
            services.AddTransient<IMultiSportService, MultiSportService>();
            services.AddTransient<ITennisService, TennisService>();
            services.AddTransient<IExternalScoreService, ExternalScoreService>();
            services.AddTransient<EventManagement.Services.IMatchResultDetailService, EventManagement.Services.MatchResultDetailService>();
            services.AddTransient<IMatchService, MatchService>();
            services.AddTransient<EventManagement.Services.IScoreSetService, EventManagement.Services.ScoreSetService>();
            services.AddTransient<EventManagement.Services.IScoreService, EventManagement.Services.ScoreService>();
            services.AddTransient<EventManagement.Services.SpecificService.Tennis.IScoreService, EventManagement.Services.SpecificService.Tennis.ScoreService>();
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

        private void ConfigureCore(IServiceCollection services)
        {
            services.AddScoped<IDynamicRepository, DynamicRepository>();
            services.AddScoped<IRemotingRefService, RemotingRefService>();
            services.AddTransient<IRefDataService, RefDataService>();
            services.AddSingleton<PermissionService, PermissionServiceImp>();
            services.AddSingleton<XmlConvertService, XmlConvertServiceImp>();
            services.AddTransient<ILogService, LogServiceImp>();
            services.AddSingleton<IUMCacheService, UMCacheService>();
            services.AddSingleton<IUMRestClient, UMRestClient>();
            services.AddSingleton(new UMClientConfiguration().Initialize(Configuration));
            services.AddSingleton<ONEbook.UM.Services.IMaintenanceService, ONEbook.UM.Services.MaintenanceService>();
        }

        private static void ConfigureMediator(IServiceCollection services)
        {
            services.AddMediatR(typeof(AioController).GetTypeInfo().Assembly);
            services.AddMediatR(typeof(MoveTicketController).GetTypeInfo().Assembly);
            services.AddMediatR(typeof(OtherSportsController).GetTypeInfo().Assembly);
            services.AddMediatR(typeof(SoccerController).GetTypeInfo().Assembly);
            services.AddMediatR(typeof(MultiSportController).GetTypeInfo().Assembly);
        }

        private static void ConfigureAutoMapper(IServiceCollection services)
        {
            var mapperConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile(typeof(SportsbookAioAutoMapperProfile));
                mc.AddProfile(typeof(SportsbookMoveTicketAutoMapperProfile));
                mc.AddProfile(typeof(OtherSportsAutoMapperProfile));
                mc.AddProfile(typeof(SoccerAutoMapperProfile));
                mc.AddProfile(typeof(EventManagementAutoMapperProfile));
            });

            IMapper mapper = mapperConfig.CreateMapper();
            services.AddSingleton(mapper);

            services.AddMvc();
        }
    }
}