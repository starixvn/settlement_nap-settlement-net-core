using MediatR;
using Settlement.EventManagement.Models;
using System;
using System.Collections.Generic;

namespace Settlement.EventManagement.Requests
{
    public class LeagueCalculationRequest : IRequest<List<LeagueTypeModel>>
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

    }
}
