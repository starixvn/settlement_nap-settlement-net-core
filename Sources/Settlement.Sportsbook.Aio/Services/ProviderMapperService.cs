using Settlement.Sportsbook.Aio.Mapper;
using Settlement.Sportsbook.Aio.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Settlement.Sportsbook.Aio.Services
{
    public class ProviderMapperService : IMapperService
    {
        public void Decorate(dynamic obj)
        {
            var tuple = obj as Tuple<List<ExternalResultDetailModel>, List<ExternalResultModel>>;
            var externalResults = new ExternalResultModel();
            externalResults.ResultDetails = tuple.Item1.ToList();

            tuple.Item2.Add(externalResults);
        }
    }
}
