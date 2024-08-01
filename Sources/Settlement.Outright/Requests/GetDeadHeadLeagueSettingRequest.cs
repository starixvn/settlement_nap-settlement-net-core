using MediatR;

namespace Settlement.Outright.Requests;
public class GetDeadHeadLeagueSettingRequest : IRequest<byte?>
{
    public int LeagueId { get; set; }
}
