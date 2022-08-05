using System.Xml.Serialization;

namespace Settlement.FastMarkets.Models.TimeMachineOldResult
{
    public class OldResult
    {
        [XmlIgnore]
        public int BetType { get; set; }

        [XmlElement("p")]
        public int Position { get; set; }

        [XmlIgnore]
        public int Result { get; set; }

        [XmlElement("oa")]
        public int AccumulatedResult { get; set; }

        [XmlIgnore]
        public int ResultStatus { get; set; }
    }
}
