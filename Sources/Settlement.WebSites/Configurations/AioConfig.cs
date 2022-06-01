using System.Reflection;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Settlement.Sportsbook.Aio.Controllers;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Services;

namespace Settlement.WebSites.Configurations
{
    public static class AioConfig
    {
        public static void ConfigAioServices(this IServiceCollection services)
        {
            services.AddTransient<IAioService, AioServiceImp>();
            services.AddTransient<IMapperFactory, MapperFactoryBase>();
            services.AddTransient<IMapperFactory, MapperFactoryImp>();
            services.AddTransient<IValidateApiKeyService, ValidateApiKeyServiceImp>();
            services.AddTransient<ICriteriaFactory, CriteriaFactoryImp>();
            services.AddTransient<ICreateQueryService, CreateQueryServiceImp>();
        }

        public static void ConfigAioMediator(this IServiceCollection services)
        {
            services.AddMediatR(typeof(AioController).GetTypeInfo().Assembly);
        }
    }
}