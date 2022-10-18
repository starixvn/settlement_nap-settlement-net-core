using MediatR;
using Settlement.Gaming.Models.NumberGame;
using System;

namespace Settlement.Gaming.Requests
{
    public class NumberGameMatchRequest : IRequest<NumberGameModel>
    {
        public string MatchCode { get; set; }

        public string MatchStatus { get; set; }

        public DateTime FromDate { get; set; } = DateTime.Now.AddDays(-1);

        public DateTime ToDate { get; set; } = DateTime.Now;
    }
}