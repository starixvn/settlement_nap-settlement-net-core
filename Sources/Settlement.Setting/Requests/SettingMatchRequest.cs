using MediatR;
using Settlement.Core.Models;

namespace Settlement.Setting.Requests
{
    public class SettingMatchRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public int AutoType { get; set; }

        public bool IsEnabled { get; set; }
    }
}