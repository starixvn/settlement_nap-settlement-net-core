using MediatR;

namespace Settlement.Outright.Requests;

public class SportLeagueRequest : IRequest<SportLeague>
{
    public string FromDate { get; set; }

    public string ToDate { get; set; }
}