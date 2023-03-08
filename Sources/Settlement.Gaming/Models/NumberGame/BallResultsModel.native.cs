using System.Xml.Serialization;

namespace Settlement.Gaming.Models.NumberGame;

[XmlRoot("Balls")]
public class BallResultsModel
{
    [XmlElement("Ball")]
    public List<BallModel> BallResultsItems { get; set; }
}