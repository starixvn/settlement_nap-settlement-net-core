using System.Collections.Generic;
using System.Xml.Serialization;

namespace Settlement.Setting.Models.OutsideSourceManager;

[XmlRoot("GameTypes")]
public class GameResources<T>
{
    [XmlElement("GameType")]
    public List<T> GameItems { get; set; }
}