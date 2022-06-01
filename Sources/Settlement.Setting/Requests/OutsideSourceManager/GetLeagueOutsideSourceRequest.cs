using MediatR;
using Settlement.Setting.Models.OutsideSourceManager;

namespace Settlement.Setting.Requests.OutsideSourceManager
{
    public class GetLeagueOutsideSourceRequest : IRequest<LeagueOutsideSourceModel>
    {
        public int LeagueID { get; set; }
    }
}