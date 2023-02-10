using MediatR;
using Settlement.Gaming.Models.Happy5;
using System;

namespace Settlement.Gaming.Requests;

public class Happy5MatchRequest : IRequest<HappyFive>
{
    public string MatchCode { get; set; }

    public string Status { get; set; }

    public DateTime FromDate { get; set; } = DateTime.Now.AddDays(-1);

    public DateTime ToDate { get; set; } = DateTime.Now;
}