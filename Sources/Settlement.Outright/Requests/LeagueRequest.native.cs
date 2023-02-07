using MediatR;

namespace Settlement.Outright.Requests
{
    public class LeagueRequest : IRequest<IEnumerable<League>>
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public int SportType { get; set; }
    }
}