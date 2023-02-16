using MediatR;

namespace Settlement.Outright.Requests;

public class GetLeagueInfoRequest : IRequest<LeagueInfo>
{
	public int LeagueId { get; set; }

	public int SportType { get; set; }

	public byte StatusId { get; set; }
}