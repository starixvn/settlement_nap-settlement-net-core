using Settlement.Core.Models;
using CoreConsts = Settlement.Core.Constants;

namespace Settlement.Setting.Models;

public class RemarkQueryModel
{
    private string eventStatus = string.Empty;
    private string originalEventStatus = string.Empty;
    private AutoCalculationSetting autoCalcSetting;
    private const int ConvertToBase = 2;

    private readonly List<string> eventStatusReasonTitles =
    [
        CoreConsts.EventStatus.IrregularTime1H,
       CoreConsts.EventStatus.IrregularTime,
      CoreConsts.EventStatus.WrongTeamName,
      CoreConsts.EventStatus.Suspended
    ];

    private readonly List<int> eventStatusReasons = [1, 2, 3, 4];

    public string EventStatus
    {
        get => eventStatus.MapToString(BetStatus, Remark.IsPending);

        set
        {
            originalEventStatus = value;
            eventStatus = value;
        }
    }

    public string NewEventStatus
    {
        get
        {
            var status = EventStatusReason ?? 0;

            return originalEventStatus.IgnoreCaseEquals(CoreConsts.EventStatus.Running) &&
                   eventStatusReasons.Contains(status) ? eventStatusReasonTitles[status - 1] : EventStatus;
        }
    }

    public byte SettlementStatus { get; set; }

    public string BetStatus { get; set; }

    public RemarkSettingModel Remark => new(SettlementStatus);

    public int? EventStatusReason { get; set; }

    public int AutoSetting { get; set; }

    public AutoCalculationSetting AutoCalcSetting => autoCalcSetting ?? getDefaultAutoCalculationSetting();

    private AutoCalculationSetting getDefaultAutoCalculationSetting()
    {
        autoCalcSetting = new AutoCalculationSetting
        {
            MatchSetting = Convert.ToString(AutoSetting, ConvertToBase).Reverse()
        };

        return autoCalcSetting;
    }
}