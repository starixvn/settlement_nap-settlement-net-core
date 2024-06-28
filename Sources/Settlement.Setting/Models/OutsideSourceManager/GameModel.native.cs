using System.Xml.Serialization;

namespace Settlement.Setting.Models.OutsideSourceManager;

public class GameModel
{
    private const int Dota2 = 1;
    private const int Lol = 2;
    private const int Csgo = 3;
    private const int Kog = 4;
    private const int WildRift = 5;

    [XmlAttribute("Id")]
    public int GameType { get; set; }

    [XmlIgnore]
    public string Name => GetGameNameById();

    [XmlAttribute("IsActive")]
    public bool IsActive { get; set; }

    private string GetGameNameById()
    {
        return GameType switch
        {
            Dota2 => "DOTA2",
            Lol => "LOL",
            Csgo => "CS:GO",
            Kog => "KOG",
            WildRift => "Wild Rift",
            _ => "Others"
        };
    }
}