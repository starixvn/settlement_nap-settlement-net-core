using System.Xml.Serialization;

namespace Settlement.Log.Models.BetTypeElement
{
    public class BetTypeElement
    {
        [XmlAttribute]
        public int Id { get; set; }

        [XmlElement]
        public ItemElement Item { get; set; }
    }
}