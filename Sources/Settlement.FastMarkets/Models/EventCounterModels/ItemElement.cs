using System.Xml.Serialization;

namespace Settlement.FastMarkets.Models.EventCounterModels
{
    public class ItemElement
    {
        [XmlAttribute]
        public int Position { get; set; }

        [XmlAttribute]
        public string Result { get; set; }
    }
}