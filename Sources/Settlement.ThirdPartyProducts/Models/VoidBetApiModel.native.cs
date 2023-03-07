using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.ThirdPartyProducts.Models;

public class VoidBetApiModel
{
    public IEnumerable<VoidBetInfo> VoidBetInfos { get; set; }
}