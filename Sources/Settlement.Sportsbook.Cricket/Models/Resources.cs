using System.Collections.Generic;
using System.Xml.Serialization;

namespace Settlement.Sportsbook.Cricket.Models
{
    [XmlRoot("Resources")]
    public class Resources<T>
    {
        [XmlElement("Resource")]
        public List<T> ResourceItems { get; set; }
    }
}