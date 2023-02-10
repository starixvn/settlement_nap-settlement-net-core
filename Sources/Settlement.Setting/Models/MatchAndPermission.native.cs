using Settlement.Core.Models;

namespace Settlement.Setting.Models;

public class MatchAndPermission
{
    public Permission Permission { get; set; }

    public RemarkQueryModel Match { get; set; }
}