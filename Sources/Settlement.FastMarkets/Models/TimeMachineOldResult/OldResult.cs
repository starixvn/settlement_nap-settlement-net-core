using System.Xml.Serialization;

namespace Settlement.FastMarkets.Models.TimeMachineOldResult
{
    public class OldResult
    {
        [XmlIgnore]
        public int BetType { get; set; }

        [XmlAttribute("p")]
        public int Position { get; set; }

        [XmlAttribute("or")]
        public int Result { get; set; }

        [XmlAttribute("oa")]
        public int AccumulatedResult { get; set; }

        [XmlIgnore]
        public int ResultStatus { get; set; }
    }
}
