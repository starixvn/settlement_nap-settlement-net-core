using MediatR;

namespace Settlement.Outright.Requests;

public class SportLeagueRequest : IRequest<SportLeague>
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }
}