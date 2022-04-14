using System.Collections.Generic;
using MediatR;
using Settlement.EventManagement.Models;

namespace Settlement.EventManagement.Requests
{
    public class RefreshMatchesRequest : IRequest<IList<MultiSportMatchWaiting>>
    {
        public string LeagueIds { get; set; }
        public string MatchIds { get; set; }
    }
}