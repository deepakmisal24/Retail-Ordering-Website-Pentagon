using System.Threading.Tasks;

namespace RetailOrdering.Application.Interfaces
{
    public interface IInventoryService
    {
        Task<bool> CheckAndDeductStockAsync(int productId, int quantity);
        Task<bool> UpdateStockAsync(int productId, int availableStock, int lowStockThreshold);
        event System.Action<int, int>? OnLowStockAlert;
    }
}
