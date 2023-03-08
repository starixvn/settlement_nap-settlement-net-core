using MediatR;
using Settlement.Setting.Models;

namespace Settlement.Setting.Requests;

public class GetRemarkInfoRequest : IRequest<MatchAndPermission>
{
    public int MatchId { get; set; }
}