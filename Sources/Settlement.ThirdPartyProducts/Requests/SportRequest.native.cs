using MediatR;
using Settlement.Core.Models;

namespace Settlement.ThirdPartyProducts.Requests;

public class SportRequest : IRequest<List<Sport>>
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }
}