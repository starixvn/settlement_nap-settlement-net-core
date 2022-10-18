using System.Xml.Serialization;

namespace Settlement.Log.Models.BetTypeElement
{
    public class ItemElement
    {
        [XmlAttribute]
        public string Position { get; set; }

        [XmlAttribute]
        public string Result { get; set; }

        [XmlAttribute]
        public string MinPosition { get; set; }

        [XmlAttribute]
        public string MaxPosition { get; set; }
    }
}