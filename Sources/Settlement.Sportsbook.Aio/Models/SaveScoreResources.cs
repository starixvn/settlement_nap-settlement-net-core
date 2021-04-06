using System.Collections.Generic;
using System.Xml.Serialization;

namespace Settlement.Sportsbook.Aio.Models
{
    [XmlRoot("Sources")]
    public class SaveScoreResources<T>
    {
        [XmlElement("Source")]
        public List<T> SourceItems { get; set; }
    }
}
