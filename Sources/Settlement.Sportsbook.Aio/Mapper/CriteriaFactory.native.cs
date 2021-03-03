using Fanex.Data.Repository;
using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Settlement.Sportsbook.Aio.Mapper
{
    public interface ICriteriaFactory
    {
        Type GetCriteriaType(string apiKey);

        ICriteria CreateCriteria(Type criteriaType, object queryModel);

        INonQueryCommand CreateNonQueryCommand(Type commandType, object queryModel);
    }

    public class CriteriaFactoryBase : ICriteriaFactory
    {
        protected static readonly Dictionary<string, Type> CriteriaTypes = new Dictionary<string, Type>();

        public virtual ICriteria CreateCriteria(Type criteriaType, object queryModel)
        {
            var criteria = JsonConvert.DeserializeObject(JsonConvert.SerializeObject(queryModel), criteriaType);

            return (ICriteria)criteria;
        }

        public virtual INonQueryCommand CreateNonQueryCommand(Type commandType, object queryModel)
        {
            var nonQueryCommand = JsonConvert.DeserializeObject(JsonConvert.SerializeObject(queryModel), commandType);

            return (INonQueryCommand)nonQueryCommand;
        }

        public virtual Type GetCriteriaType(string apiKey)
        {
            return CriteriaTypes.ContainsKey(apiKey) ? CriteriaTypes[apiKey] : null;
        }
    }
}