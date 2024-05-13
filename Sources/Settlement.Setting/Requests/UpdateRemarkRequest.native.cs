using MediatR;
using Settlement.Setting.Models;

namespace Settlement.Setting.Requests;

public class UpdateHoldMatchSettingRequest : IRequest<MatchAndPermission>
{
    public int MatchId { get; set; }

    public List<HoldSetting> HoldSettings { get; set; }
    public List<HoldSetting> OrgHoldSettings { get; set; }
}