using Fanex.Caching;
using Settlement.Core.Constants;

namespace Settlement.Sportsbook.MoveTickets.Services;

public interface AutoMoveStatusService
{
    Task<bool> GetAutoMoveStatus();

    Task<bool> UpdateAutoMoveStatus(bool isAutoMoveTicketsEnabled);
}

public class AutoMoveStatusServiceImp(ICacheService cacheService) : AutoMoveStatusService
{
    public async Task<bool> GetAutoMoveStatus()
    {
        try
        {
            var isExistedKey = await cacheService.ContainAsync(CacheSettings.AutoMoveStatusKey);
            if (isExistedKey)
            {
                var (_, value) = await cacheService.TryGetAsync<bool>(CacheSettings.AutoMoveStatusKey);
                return value;
            }

            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> UpdateAutoMoveStatus(bool isAutoMoveTicketsEnabled)
    {
        await cacheService.SetAsync(CacheSettings.AutoMoveStatusKey, isAutoMoveTicketsEnabled);
        return await GetAutoMoveStatus();
    }
}