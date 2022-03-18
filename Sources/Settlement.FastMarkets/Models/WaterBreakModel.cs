using System.Xml.Serialization;

namespace Settlement.FastMarkets.Models
{
    public class WaterBreakModel
    {
        [XmlAttribute("Id")]
        public string ResourceId { get; set; }

        [XmlAttribute("h")]
        public int HomeValue { get; set; }

        [XmlAttribute("a")]
        public int AwayValue { get; set; }

        [XmlAttribute("o")]
        public string OtherInfo { get; set; }

        [XmlAttribute("s")]
        public byte IsApply { get; set; }
    }
}