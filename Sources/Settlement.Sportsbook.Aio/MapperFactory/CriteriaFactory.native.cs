using Newtonsoft.Json;

namespace Settlement.Sportsbook.Aio.MapperFactory;

public interface ICriteriaFactory
{
    Type GetCriteriaType(string apiKey);

    ICriteria CreateCriteria(Type criteriaType, object queryModel);

    INonQueryCommand CreateNonQueryCommand(Type commandType, object queryModel);
}

public class CriteriaFactoryBase : ICriteriaFactory
{
    protected static readonly Dictionary<string, Type> CriteriaTypes = new();

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

    public Type GetCriteriaType(string apiKey)
    {
        return CriteriaTypes.TryGetValue(apiKey, out var type) ? type : null;
    }
}