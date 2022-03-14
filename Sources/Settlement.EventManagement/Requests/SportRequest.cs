using System;
using System.Collections.Generic;
using MediatR;
using Settlement.EventManagement.Models;

namespace Settlement.EventManagement.Requests
{
    public class SportRequest : IRequest<List<SportTypeModel>>
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }
    }
}