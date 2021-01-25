using System.Collections.Generic;
using System.Xml.Serialization;

namespace Settlement.Sportsbook.Aio.Models
{
    [XmlRoot("Resources")]
    class Resources<T>
    {
        [XmlElement("Resource")]
        public List<T> ResourceItems { get; set; }
    }
}
