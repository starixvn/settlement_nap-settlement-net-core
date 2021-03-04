using Fanex.Data.Repository;
using Settlement.Sportsbook.Aio.Mapper;

namespace Settlement.Sportsbook.Aio.Services
{
    public interface IValidateApiKeyService
    {
        string GetApiKey(string apiKey);

        ICriteria CriteriaName(object queryModel, string apiKey);

        INonQueryCommand CreateNonQueryCommand(object queryModel, string apiKey);
    }

    public class ValidateApiKeyServiceImp : IValidateApiKeyService
    {
        private readonly ICriteriaFactory criteriaFactory;

        public ValidateApiKeyServiceImp(ICriteriaFactory simpleCriteriaFactory)
        {
            criteriaFactory = simpleCriteriaFactory;
        }

        public string GetApiKey(string apiKey)
        {
            if (string.IsNullOrEmpty(apiKey))
            {
                throw new EmptyKeyException($"apikey({ apiKey}) is empty");
            }

            return apiKey;
        }

        public ICriteria CriteriaName(object queryModel, string apiKey)
        {
            var criteriaType = criteriaFactory.GetCriteriaType(apiKey);
            if (criteriaType == null)
            {
                throw new EmptyKeyException($"Data api is not found. Please check the method GetCriteriaType({ apiKey })");
            }

            var criteria = criteriaFactory.CreateCriteria(criteriaType, queryModel);
            if (criteria == null)
            {
                throw new EmptyKeyException($"Data api is not found. Please check the method CreateCriteria({ apiKey })");
            }

            return criteria;
        }

        public INonQueryCommand CreateNonQueryCommand(object queryModel, string apiKey)
        {
            var criteriaType = criteriaFactory.GetCriteriaType(apiKey);
            if (criteriaType == null)
            {
                throw new EmptyKeyException($"Data api is not found. Please check the method GetCriteriaType({ apiKey })");
            }

            var criteria = criteriaFactory.CreateNonQueryCommand(criteriaType, queryModel);
            if (criteria == null)
            {
                throw new EmptyKeyException($"Data api is not found. Please check the method CreateCriteria({ apiKey })");
            }

            return criteria;
        }
    }
}