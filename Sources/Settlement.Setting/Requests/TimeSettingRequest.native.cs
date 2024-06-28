using MediatR;
using Settlement.Models;

namespace Settlement.Setting.Requests;

public class TimeSettingRequest : IRequest<Result>
{
    public int LeagueId { get; set; }

    public int WaitingTime { get; set; }

    public int AutoType { get; set; }
}