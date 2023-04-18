using MediatR;

namespace Settlement.Outright.Requests;

public class FilterRequest : IRequest<SportOutright>
{
    public string FromDate { get; set; }

    public string ToDate { get; set; }

    public string LeagueIds { get; set; }

    public byte StatusId { get; set; }

    public bool IsIncludeTest { get; set; }
}