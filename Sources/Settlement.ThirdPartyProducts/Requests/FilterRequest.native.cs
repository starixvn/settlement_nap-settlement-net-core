using MediatR;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.Requests;

public class FilterRequest : IRequest<MultiSportsModel>
{
    public string MatchCode { get; set; }

    public string Status { get; set; }

    public string LeagueIds { get; set; }

    public string SportTypes { get; set; }

    public DateTime FromDate { get; set; } = DateTime.Now.AddDays(-1);

    public DateTime ToDate { get; set; } = DateTime.Now;
}