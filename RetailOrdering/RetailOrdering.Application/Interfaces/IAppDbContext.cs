using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Domain.Entities;

namespace RetailOrdering.Application.Interfaces
{
    public interface IAppDbContext
    {
        DbSet<Customer> Customers { get; }
        DbSet<Product> Products { get; }
        DbSet<Order> Orders { get; }
        DbSet<OrderItem> OrderItems { get; }
        DbSet<Coupon> Coupons { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
