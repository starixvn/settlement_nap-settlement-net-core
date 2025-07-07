using Settlement.Core.Models;
using Fanex.Caching;

namespace Settlement.Sportsbook.MoveTickets.Services;

public interface IAutoMoveStatusService
{
    Task<Result> GetAutoMoveStatus();
}

public class AutoMoveStatusService(ICacheService cacheService) : IAutoMoveStatusService
{
    private const string AutoMoveStatusKey = "AutoMoveStatus";

    public async Task<Result> GetAutoMoveStatus()
    {
        try
        {
            // ICacheService is usually synchronous, but wrap in Task for compatibility
            var status = cacheService.Get<string>(AutoMoveStatusKey);
            var isEnabled = status != null && status == "true";

            return new Result
            {
                ErrCode = 0,
                ErrMsg = string.Empty,
                ChildMatchIds = isEnabled.ToString()
            };
        }
        catch (Exception ex)
        {
            return new Result
            {
                ErrCode = 500,
                ErrMsg = $"Error reading auto move status from cache: {ex.Message}"
            };
        }
    }
} 