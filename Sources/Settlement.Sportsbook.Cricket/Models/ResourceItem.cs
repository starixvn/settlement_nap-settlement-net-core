using Kaden.Extensions;
using System.Xml.Serialization;

namespace Settlement.Sportsbook.Cricket.Models
{
    public class ResourceItem
    {
        private string isSettleDetermined;

        [XmlAttribute("Id")]
        public string ResourceId { get; set; }

        [XmlAttribute("Home")]
        public string HomeValue { get; set; }

        [XmlAttribute("Away")]
        public string AwayValue { get; set; }

        [XmlAttribute("IsDetermined")]
        public string IsSettleDetermined
        {
            get
            {
                return isSettleDetermined;
            }
            set
            {
                isSettleDetermined = value.IgnoreCaseEquals("true") ? "1" : "0";
            }
        }
    }
}