
using System.Xml.Serialization;

public class ResourcesOutright
{
    [XmlAttribute("Orid")]
    public int OrId { get; set; }

    [XmlAttribute("Teamid")]
    public int TeamId { get; set; }

    [XmlAttribute("Result")]
    public string Result { get; set; }
}


public class DeadheatResourcesOutright : ResourcesOutright
{

    [XmlAttribute("IsDeadHeat")]
    public bool IsDeadheat { get; set; }

    [XmlAttribute("ResultStatusId")]
    public int ResultStatusId { get; set; }
}