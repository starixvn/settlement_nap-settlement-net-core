using MediatR;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.Requests;

public class LeaguesRequest : IRequest<List<LeagueTypeModel>>
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string SportTypes { get; set; }
}