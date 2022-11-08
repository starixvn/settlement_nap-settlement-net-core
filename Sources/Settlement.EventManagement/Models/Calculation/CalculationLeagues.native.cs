using MessagePack;
using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.EventManagement.Models.Calculation
{
    [MessagePackObject]
    public class CalculationLeagues
    {
        [Key("permission")]
        public Permission Permission { get; set; }

        [Key("sports")]
        public List<League> Leagues { get; set; }
    }
}