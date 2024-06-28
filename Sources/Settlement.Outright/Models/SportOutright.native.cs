using Settlement.Models;

namespace Settlement.Outright.Models;

public class SportOutright
{
    public IEnumerable<OutrightModel> SportLeague { get; set; }

    public Permission Permission { get; set; }
}