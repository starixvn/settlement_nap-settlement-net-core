namespace Settlement.Core.Models;

public class Result
{
    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }

    public string ChildMatchIds { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    public bool IsSuccessful => string.IsNullOrEmpty(ErrMsg) && ErrCode == 0;

    public Result()
    {
    }

    public Result(int errCode, string errMsg)
    {
        ErrMsg = errMsg;
        ErrCode = errCode;
    }
}