using System.Collections.Generic;
using System.Xml.Serialization;

namespace Settlement.Setting.Models.ProviderManager;

[XmlRoot("Providers")]
public class ProviderResources<T>
{
    [XmlElement("Provider")]
    public List<T> ProviderItems { get; set; }
}