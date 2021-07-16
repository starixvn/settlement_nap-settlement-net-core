using MediatR;
using System;

namespace Settlement.Sportsbook.Aio.Requests
{
    public class ResultSettingRequest : IRequest<Boolean>
    {
        public int MatchId { get; set; }

        public int Type { get; set; }

        public bool IsEnabled { get; set; }

        public string ResourceIds { get; set; }
    }
}
