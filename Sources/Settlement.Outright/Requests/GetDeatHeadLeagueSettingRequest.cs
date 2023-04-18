using MediatR;

namespace Settlement.Outright.Requests;
public class GetDeatHeadLeagueSettingRequest : IRequest<byte?>
{
    public int LeagueId { get; set; }
}
