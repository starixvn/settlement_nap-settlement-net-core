using MediatR;
using Settlement.Sportsbook.Aio.Controllers;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Services;
using Settlement.Sportsbook.Aio.Services.Cricket;

namespace Settlement.WebSites.Configurations;

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
        services.AddTransient<MergeDataService, MergeDataServiceImp>();
        services.AddTransient<MultipleServerAioService, MultipleServerAioServiceImp>();
        services.AddTransient<NetPositionService, NetPositionServiceImp>();
    }

    public static void ConfigAioMediator(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(AioController).Assembly));
    }
}