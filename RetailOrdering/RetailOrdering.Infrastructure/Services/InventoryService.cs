using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Application.Interfaces;
using RetailOrdering.Infrastructure.Persistence;

namespace RetailOrdering.Infrastructure.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _context;
        private static readonly SemaphoreSlim _lock = new SemaphoreSlim(1, 1);

        public event Action<int, int>? OnLowStockAlert;

        public InventoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CheckAndDeductStockAsync(int productId, int quantity)
        {
            await _lock.WaitAsync();
            try
            {
                var product = await _context.Products.FindAsync(productId);
                if (product == null) return false;

                if (product.AvailableStock < quantity)
                {
                    return false; // Insufficient stock
                }

                product.DeductStock(quantity);
                var saved = await _context.SaveChangesAsync() > 0;

                // Raise low stock event alert
                if (saved && product.IsStockLow())
                {
                    OnLowStockAlert?.Invoke(productId, product.AvailableStock);
                }

                return saved;
            }
            finally
            {
                _lock.Release();
            }
        }

        public async Task<bool> UpdateStockAsync(int productId, int availableStock, int lowStockThreshold)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return false;

            product.AvailableStock = availableStock;
            product.LowStockThreshold = lowStockThreshold;

            var saved = await _context.SaveChangesAsync() > 0;

            if (saved && product.IsStockLow())
            {
                OnLowStockAlert?.Invoke(productId, product.AvailableStock);
            }

            return saved;
        }
    }
}
