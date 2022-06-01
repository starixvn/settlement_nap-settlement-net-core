using System.Collections.Generic;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Aio.Models
{
    public class VoidBetApiModel
    {
        public IEnumerable<VoidBetInfo> VoidBetInfos { get; set; }
    }
}