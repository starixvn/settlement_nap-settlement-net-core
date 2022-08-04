using System.Collections.Generic;
using System.Xml.Serialization;

namespace Settlement.FastMarkets.Models.TimeMachineOldResult
{
    public class OldResultElement
    {
        [XmlElement("Id")]
        public int BetTypeId { get; set; }

        [XmlElement("r")]
        public List<OldResult> Results { get; set; }
    }
}
