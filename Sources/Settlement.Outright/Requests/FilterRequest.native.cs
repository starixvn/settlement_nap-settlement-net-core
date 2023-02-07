using MediatR;

namespace Settlement.Outright.Requests;

public class FilterRequest : IRequest<OutrightModel>
{
    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public DateTime MoveBetsDay { get; set; }

    public int SportType { get; set; }

    public int LeagueId { get; set; }

    public byte StatusId { get; set; }
}