using System.Reflection;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Settlement.Setting.Controllers;
using Settlement.Setting.Services;

namespace Settlement.WebSites.Configurations
{
    public static class SettingConfig
    {
        public static void SettingConfigServices(this IServiceCollection services)
        {
            services.AddTransient<NotificationService, NotificationServiceImp>();
            services.AddTransient<SettingService, SettingServiceImp>();
            services.AddTransient<ProviderSettingService, ProviderSettingServiceImp>();
            services.AddTransient<OutsideSourceSettingService, OutsideSourceSettingServiceImp>();
            services.AddTransient<SendMailService, SendMailServiceImp>();
        }

        public static void SettingConfigMediator(this IServiceCollection services)
        {
            services.AddMediatR(typeof(MatchSettingController).GetTypeInfo().Assembly);
            services.AddMediatR(typeof(SourceManagerController).GetTypeInfo().Assembly);
        }
    }
}
