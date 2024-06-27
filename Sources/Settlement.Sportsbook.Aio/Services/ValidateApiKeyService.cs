using Settlement.Sportsbook.Aio.MapperFactory;

namespace Settlement.Sportsbook.Aio.Services;

public interface IValidateApiKeyService
{
    string GetApiKey(string apiKey);

    ICriteria CriteriaName(object queryModel, string apiKey);

    INonQueryCommand CreateNonQueryCommand(object queryModel, string apiKey);
}

public class ValidateApiKeyServiceImp(ICriteriaFactory simpleCriteriaFactory) : IValidateApiKeyService
{
    private const string RefundKey = "-refund";

    public string GetApiKey(string apiKey)
    {
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new EmptyKeyException($"apiKey({apiKey}) is empty");
        }


        return apiKey.Replace(RefundKey, "");
    }

    public ICriteria CriteriaName(object queryModel, string apiKey)
    {
        var criteriaType = simpleCriteriaFactory.GetCriteriaType(apiKey);
        if (criteriaType == null)
        {
            throw new EmptyKeyException($"Data api is not found. Please check the method GetCriteriaType({apiKey})");
        }

        var criteria = simpleCriteriaFactory.CreateCriteria(criteriaType, queryModel);
        if (criteria == null)
        {
            throw new EmptyKeyException($"Data api is not found. Please check the method CreateCriteria({apiKey})");
        }

        return criteria;
    }

    public INonQueryCommand CreateNonQueryCommand(object queryModel, string apiKey)
    {
        var criteriaType = simpleCriteriaFactory.GetCriteriaType(apiKey);
        if (criteriaType == null)
        {
            throw new EmptyKeyException($"Data api is not found. Please check the method GetCriteriaType({apiKey})");
        }

        var criteria = simpleCriteriaFactory.CreateNonQueryCommand(criteriaType, queryModel);
        if (criteria == null)
        {
            throw new EmptyKeyException($"Data api is not found. Please check the method CreateCriteria({apiKey})");
        }

        return criteria;
    }
}