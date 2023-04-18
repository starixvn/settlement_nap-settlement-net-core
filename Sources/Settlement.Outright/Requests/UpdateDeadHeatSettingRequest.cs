using MediatR;

namespace Settlement.Outright.Requests;

public class UpdateDeadHeatSettingRequest : IRequest<Unit>
{
    public int LeagueId { get; set; }

    public bool DeadHeat { get; set; }
}