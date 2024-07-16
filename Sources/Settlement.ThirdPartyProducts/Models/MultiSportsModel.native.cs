using Settlement.Core.Models;

namespace Settlement.ThirdPartyProducts.Models;

public class MultiSportsModel
{
    public Permission Permission { get; set; }

    public List<SportModel> SportLeagues { get; set; }
}