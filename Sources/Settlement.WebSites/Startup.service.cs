using AutoMapper;
using Fanex.Caching;
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
using Fanex.NAP.Client.Web;
using Fanex.RemotingRef;
using MediatR;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sentry;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio;
using Settlement.Sportsbook.Aio.Controllers;
using Settlement.Sportsbook.Aio.Services;
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
                        builder.WithOrigins("https://localhost:44346",
                                            "http://localhost:58793")
                              .AllowAnyMethod()
                              .AllowAnyHeader()
                              .AllowCredentials();
                    });
            });
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
            services.AddTransient<ICricketService, CricketService>();
        }

        private void ConfigureNapServices(IServiceCollection services)
        {
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            services.AddTransient<ILogger, Logger>();
            services.AddSingleton<INapSettings>(new NapSettings(Configuration));
            services.AddSingleton<INapSession, NapSession>();
            services.AddSingleton<IRestClient, RestClient>();
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
              .UseDefaultDbSettingProvider(resourcePath: "~/App_Data")
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
        }

        private static void ConfigureMediator(IServiceCollection services)
        {
            services.AddMediatR(typeof(CricketController).GetTypeInfo().Assembly);
        }

        private static void ConfigureAutoMapper(IServiceCollection services)
        {
            var mapperConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile(typeof(SportsbookAioAutoMapperProfile));
            });

            IMapper mapper = mapperConfig.CreateMapper();
            services.AddSingleton(mapper);

            services.AddMvc();
        }
    }
}