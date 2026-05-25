using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Application.Interfaces;
using RetailOrdering.Domain.Entities;

namespace RetailOrdering.Infrastructure.Persistence
{
    public class AppDbContext : DbContext, IAppDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Coupon> Coupons => Set<Coupon>();

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure value objects as owned types in Order table
            modelBuilder.Entity<Order>(entity =>
            {
                entity.OwnsOne(o => o.ShippingAddress, address =>
                {
                    address.Property(a => a.Street).HasColumnName("ShippingStreet");
                    address.Property(a => a.City).HasColumnName("ShippingCity");
                    address.Property(a => a.ZipCode).HasColumnName("ShippingZipCode");
                    address.Property(a => a.Country).HasColumnName("ShippingCountry");
                });

                entity.OwnsOne(o => o.SelectedPackaging, packaging =>
                {
                    packaging.Property(p => p.Name).HasColumnName("PackagingName");
                    packaging.Property(p => p.Price).HasColumnName("PackagingPrice");
                    packaging.Property(p => p.Description).HasColumnName("PackagingDescription");
                });
            });

            // Relationships cascading/restricting
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany()
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany()
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
