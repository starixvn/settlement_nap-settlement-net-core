using Settlement.Setting.Constants;

namespace Settlement.Setting.Responses;
public class Provider
{
    public int SourceId { get; set; }
    public string SourceName { get; set; }
    public ProviderPriority Priority { get; set; }
    public bool IsActive { get; set; }
}