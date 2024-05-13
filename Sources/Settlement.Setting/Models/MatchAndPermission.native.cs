using System.Xml.Serialization;
using Settlement.Core.Models;
using Settlement.Setting.Constants;

namespace Settlement.Setting.Models;

public class MatchAndPermission
{
    public Permission Permission { get; set; }

    public RemarkQueryModel Match { get; set; }
}