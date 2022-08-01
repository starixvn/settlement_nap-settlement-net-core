using System.Xml.Serialization;
using Kaden.Extensions;

namespace Settlement.Core.Models
{
    public class ResourceItem
    {
        private string isSettleDetermined;

        public ResourceItem()
        {
        }

        public ResourceItem(string id)
        {
            ResourceId = id;
        }

        [XmlAttribute("Id")]
        public string ResourceId { get; set; }

        [XmlAttribute("Home")]
        public string HomeValue { get; set; }

        [XmlAttribute("Away")]
        public string AwayValue { get; set; }

        [XmlAttribute("OtherInfo")]
        public string OtherInfo { get; set; }

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