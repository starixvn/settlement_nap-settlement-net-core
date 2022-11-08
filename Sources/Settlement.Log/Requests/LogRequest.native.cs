using MediatR;
using Settlement.Log.Models;
using System;
using System.Collections.Generic;

namespace Settlement.Log.Requests
{
    public class LogRequest : IRequest<List<LogModel>>
    {
        public LogRequest()
        {
            FromDate = Convert.ToDateTime(DateTime.Now.AddDays(-1).ToShortDateString());
            ToDate = DateTime.Today;
            ProductType = "ALL";
        }

        public string MatchCode { get; set; }

        public string ProductType { get; set; }

        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }
    }
}