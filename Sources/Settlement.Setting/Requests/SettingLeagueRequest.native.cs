using MediatR;
using Settlement.Models;

namespace Settlement.Setting.Requests;

public class SettingLeagueRequest : IRequest<Result>
{
    public int LeagueId { get; set; }

    public int AutoType { get; set; }

    public bool IsEnabled { get; set; }

    public bool IsApplyAll { get; set; }
}