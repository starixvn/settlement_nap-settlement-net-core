namespace Settlement.Core.Models;

public interface IReturnValue
{
    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }
}