using Settlement.Models;

namespace Settlement.ThirdPartyProducts.Models;

public class VoidBetApiModel
{
    public IEnumerable<VoidBetInfo> VoidBetInfos { get; set; }
}