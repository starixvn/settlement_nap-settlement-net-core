using System.Xml.Serialization;

namespace Settlement.Core.Models;

public class SaveScoreModel
{
    [XmlAttribute("SourceId")]
    public int SourceId { get; set; }

    [XmlAttribute("ResourceId")]
    public string ResourceId { get; set; }

    [XmlAttribute("HomeValue")]
    public string HomeValue { get; set; }

    [XmlAttribute("AwayValue")]
    public string AwayValue { get; set; }
}