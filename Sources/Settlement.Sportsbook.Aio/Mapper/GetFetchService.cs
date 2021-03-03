

using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Mapper
{
    public interface IGetFetchService
    {
        Task<dynamic> Fetch(params dynamic[] obj);
    }
}
