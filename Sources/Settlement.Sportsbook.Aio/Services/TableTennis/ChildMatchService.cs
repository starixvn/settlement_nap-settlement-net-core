using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.TableTennis;

public class ChildMatchService : IMapperService
{
    public void Decorate(dynamic obj)
    {
        if (obj is Tuple<List<ChildMatchModel>, List<ResultDetail>> tuple)
        {
            var finalResult = tuple.Item2.FirstOrDefault(item => item.ResourceId == ResourceType.Final);
            var childMatchAfterFilter = tuple.Item1.OrderBy(child => child.ChildMatchType).ToList();

            tuple.Item1.Clear();
            tuple.Item1.AddRange(childMatchAfterFilter);
        }
    }
}