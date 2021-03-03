using System;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Mapper
{
    public interface IMapperFactory
    {
        IMapperService GetMapperService(string apiKey);
        IGetFetchService GetFetchService(string apiKey);
    }

    public class MapperFactoryBase : IMapperFactory
    {
        private static readonly Dictionary<string, Type> MapperServices = new Dictionary<string, Type>();
        private static readonly Dictionary<string, Type> GetServices = new Dictionary<string, Type>();

        protected static void AddMapperService(string apiKey, Type type)
        {
            MapperServices.Add(apiKey, type);
        }

        protected static void AddGetService(string apiKey, Type type)
        {
            GetServices.Add(apiKey, type);
        }

        public virtual IMapperService GetMapperService(string apiKey)
        {
            return MapperServices.ContainsKey(apiKey) ? Activator.CreateInstance(MapperServices[apiKey]) as IMapperService : null;
        }

        public virtual IGetFetchService GetFetchService(string apiKey)
        {
            return GetServices.ContainsKey(apiKey) ? Activator.CreateInstance(GetServices[apiKey]) as IGetFetchService : null;
        }
    }
}