using MediatR;

namespace Settlement.Setting.Requests;

public class LeagueRequest : IRequest<string>
{
    public int LeagueId { get; set; }
}