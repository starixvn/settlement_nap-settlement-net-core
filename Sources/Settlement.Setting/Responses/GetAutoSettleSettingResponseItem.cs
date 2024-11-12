using Settlement.Setting.Constants;

namespace Settlement.Setting.Responses;
public class GetAutoSettleSettingResponseItem
{
    public AutoSettleType SettleType { get; set; }
    public ResourceType ResourceType { get; set; }
    public bool Enabled { get; set; }
    public int WaitingTime { get; set; }
    public bool IsTraderRequired { get; set; }
    public byte MinProvider { get; set; }
    public List<Provider> Providers { get; set; }
}