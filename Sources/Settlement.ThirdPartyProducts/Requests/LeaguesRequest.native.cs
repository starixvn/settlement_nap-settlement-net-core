using MediatR;
using Settlement.ThirdPartyProducts.Models;
using System;
using System.Collections.Generic;

namespace Settlement.ThirdPartyProducts.Requests
{
    public class LeaguesRequest : IRequest<List<LeagueTypeModel>>
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public String SportTypes { get; set; }
    }
}