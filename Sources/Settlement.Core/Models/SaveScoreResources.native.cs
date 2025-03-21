using System.Xml.Serialization;

namespace Settlement.Core.Models;

[XmlRoot("Sources")]
public class SaveScoreResources<T>
{
    [XmlElement("Source")]
    public List<T> SourceItems { get; set; }
}