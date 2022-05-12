using MediatR;
using Settlement.Setting.Models;

namespace Settlement.Setting.Requests
{
    public class UpdateRemarkRequest : IRequest<MatchAndPermission>
    {
        public int MatchId { get; set; }

        public int Type { get; set; }

        public bool IsEnabled { get; set; }
    }
}