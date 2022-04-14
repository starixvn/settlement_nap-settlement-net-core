using System.Xml.Serialization;

namespace Settlement.Log.Models.EventCounterElement
{
    public class ItemElement
    {
        [XmlAttribute]
        public int Position { get; set; }

        [XmlAttribute]
        public string Result { get; set; }
    }
}