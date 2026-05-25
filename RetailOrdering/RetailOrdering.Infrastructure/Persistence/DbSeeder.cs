using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using RetailOrdering.Domain.Entities;

namespace RetailOrdering.Infrastructure.Persistence
{
    public static class DbSeeder
    {
        public static void Seed(AppDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Products.Any()) return; // Already seeded

            // 1. Seed Products
            var products = new List<Product>
            {
                new Product
                {
                    Name = "Wood-Fired Margherita",
                    Description = "Crushed San Marzano tomatoes, fresh buffalo mozzarella, fresh basil leaves, and a drizzle of extra virgin olive oil.",
                    BasePrice = 12.99m,
                    Category = "Pizza",
                    Brand = "Tuscan Oven",
                    ImageUrl = "images/margherita.svg",
                    AvailableStock = 45,
                    LowStockThreshold = 10,
                    SizeOptionsJson = @"[
                        {""Name"":""Regular"",""PriceModifier"":0.0},
                        {""Name"":""Medium"",""PriceModifier"":3.00},
                        {""Name"":""Large"",""PriceModifier"":5.50}
                    ]",
                    ToppingOptionsJson = @"[
                        {""Name"":""Extra Mozzarella"",""Price"":1.50},
                        {""Name"":""Fresh Basil"",""Price"":0.50},
                        {""Name"":""Roma Tomatoes"",""Price"":0.75},
                        {""Name"":""Wood-Fired Mushrooms"",""Price"":1.00}
                    ]"
                },
                new Product
                {
                    Name = "Smoky Hot Pepperoni Feast",
                    Description = "Zesty pepperoni slices, loaded mozzarella, crushed red chili flakes, and a honey-infused spicy marinara sauce.",
                    BasePrice = 14.99m,
                    Category = "Pizza",
                    Brand = "Tuscan Oven",
                    ImageUrl = "images/pepperoni.svg",
                    AvailableStock = 45,
                    LowStockThreshold = 10,
                    SizeOptionsJson = @"[
                        {""Name"":""Regular"",""PriceModifier"":0.0},
                        {""Name"":""Medium"",""PriceModifier"":3.50},
                        {""Name"":""Large"",""PriceModifier"":6.50}
                    ]",
                    ToppingOptionsJson = @"[
                        {""Name"":""Double Pepperoni"",""Price"":2.25},
                        {""Name"":""Smoked Bacon"",""Price"":2.00},
                        {""Name"":""Pickled Jalapenos"",""Price"":0.75},
                        {""Name"":""Hot Honey Drizzle"",""Price"":0.50}
                    ]"
                },
                new Product
                {
                    Name = "Gourmet Garden Green",
                    Description = "Assorted bell peppers, sweet red onions, marinated artichoke hearts, black kalamata olives, and baby spinach with goat cheese.",
                    BasePrice = 13.49m,
                    Category = "Pizza",
                    Brand = "Bistro Express",
                    ImageUrl = "images/veggie.svg",
                    AvailableStock = 45,
                    LowStockThreshold = 10,
                    SizeOptionsJson = @"[
                        {""Name"":""Regular"",""PriceModifier"":0.0},
                        {""Name"":""Medium"",""PriceModifier"":3.00},
                        {""Name"":""Large"",""PriceModifier"":5.50}
                    ]",
                    ToppingOptionsJson = @"[
                        {""Name"":""Crumbled Feta"",""Price"":1.25},
                        {""Name"":""Artichoke Hearts"",""Price"":1.00},
                        {""Name"":""Kalamata Olives"",""Price"":0.75},
                        {""Name"":""Spinach Mix"",""Price"":0.50}
                    ]"
                },
                new Product
                {
                    Name = "Garlic Sourdough Breadsticks",
                    Description = "Slow-fermented artisan sourdough breadsticks brushed with melted garlic herb butter and heavily sprinkled with parmesan cheese.",
                    BasePrice = 5.99m,
                    Category = "Breads",
                    Brand = "Artisan Bakers",
                    ImageUrl = "images/breadsticks.svg",
                    AvailableStock = 45,
                    LowStockThreshold = 10,
                    SizeOptionsJson = @"[
                        {""Name"":""Standard Box"",""PriceModifier"":0.0}
                    ]",
                    ToppingOptionsJson = @"[
                        {""Name"":""Extra Garlic Butter"",""Price"":0.50},
                        {""Name"":""Spicy Marinara Dip"",""Price"":0.75},
                        {""Name"":""Warm Cheese Dip"",""Price"":1.00}
                    ]"
                },
                new Product
                {
                    Name = "Cheese-Stuffed Artisan Pull-Apart",
                    Description = "Delectable pull-apart bread stuffed with a rich blend of cheddar, provolone, and herb cream cheese.",
                    BasePrice = 7.99m,
                    Category = "Breads",
                    Brand = "Artisan Bakers",
                    ImageUrl = "images/pull_apart.svg",
                    AvailableStock = 45,
                    LowStockThreshold = 10,
                    SizeOptionsJson = @"[
                        {""Name"":""Standard Box"",""PriceModifier"":0.0}
                    ]",
                    ToppingOptionsJson = @"[
                        {""Name"":""Marinara Dip"",""Price"":0.75},
                        {""Name"":""Truffle Aioli Dip"",""Price"":1.25}
                    ]"
                },
                new Product
                {
                    Name = "Premium Cold Brew Coffee",
                    Description = "Triple-filtered cold brew made with organic Ethiopian dark roast beans, served chilled over ice.",
                    BasePrice = 4.50m,
                    Category = "Cold Drinks",
                    Brand = "Bistro Express",
                    ImageUrl = "images/cold_brew.svg",
                    AvailableStock = 45,
                    LowStockThreshold = 10,
                    SizeOptionsJson = @"[
                        {""Name"":""Regular (12oz)"",""PriceModifier"":0.0},
                        {""Name"":""Large (20oz)"",""PriceModifier"":1.50}
                    ]",
                    ToppingOptionsJson = @"[
                        {""Name"":""Sweet Cream Foam"",""Price"":0.75},
                        {""Name"":""Vanilla Bean Syrup"",""Price"":0.50},
                        {""Name"":""Oat Milk"",""Price"":0.60}
                    ]"
                },
                new Product
                {
                    Name = "Craft Ginger Beer",
                    Description = "Non-alcoholic spicy, fizzy craft ginger beer brewed with fresh ginger root juice and pure cane sugar.",
                    BasePrice = 3.75m,
                    Category = "Cold Drinks",
                    Brand = "Bistro Express",
                    ImageUrl = "images/ginger_beer.svg",
                    AvailableStock = 8, // Set low stock to trigger low-stock visual notifications
                    LowStockThreshold = 10,
                    SizeOptionsJson = @"[
                        {""Name"":""Standard (12oz)"",""PriceModifier"":0.0},
                        {""Name"":""Large (20oz)"",""PriceModifier"":1.00}
                    ]",
                    ToppingOptionsJson = @"[]"
                },
                new Product
                {
                    Name = "Sparkling Hibiscus Lemonade",
                    Description = "Refreshing, tart-sweet house lemonade infused with organic steeped hibiscus flower tea and light carbonation.",
                    BasePrice = 3.99m,
                    Category = "Cold Drinks",
                    Brand = "Tuscan Oven",
                    ImageUrl = "images/lemonade.svg",
                    AvailableStock = 45,
                    LowStockThreshold = 10,
                    SizeOptionsJson = @"[
                        {""Name"":""Standard (12oz)"",""PriceModifier"":0.0},
                        {""Name"":""Large (20oz)"",""PriceModifier"":1.00}
                    ]",
                    ToppingOptionsJson = @"[
                        {""Name"":""Fresh Lemon Slices"",""Price"":0.25},
                        {""Name"":""Mint Sprig"",""Price"":0.25}
                    ]"
                }
            };

            context.Products.AddRange(products);

            // 2. Seed Coupons
            var coupons = new List<Coupon>
            {
                new Coupon { Code = "PIZZA20", DiscountType = "Percentage", DiscountValue = 20, IsActive = true, ExpiryDate = DateTime.UtcNow.AddYears(1) },
                new Coupon { Code = "WELCOME10", DiscountType = "Percentage", DiscountValue = 10, IsActive = true, ExpiryDate = DateTime.UtcNow.AddYears(1) },
                new Coupon { Code = "FREEBREAD", DiscountType = "Flat", DiscountValue = 5.00m, IsActive = true, ExpiryDate = DateTime.UtcNow.AddYears(1) }
            };

            context.Coupons.AddRange(coupons);

            // 3. Seed Customers
            var admin = new Customer
            {
                Username = "Administrator",
                Email = "admin@pizza.com",
                PasswordHash = HashPassword("Admin@123"),
                Role = "Admin",
                LoyaltyPoints = 0,
                CreatedAt = DateTime.UtcNow
            };

            var customer = new Customer
            {
                Username = "Pizza Lover",
                Email = "customer@pizza.com",
                PasswordHash = HashPassword("Customer@123"),
                Role = "Customer",
                LoyaltyPoints = 250, // Starts with points for points-redemption demo
                CreatedAt = DateTime.UtcNow
            };

            context.Customers.AddRange(admin, customer);
            context.SaveChanges();
        }

        private static string HashPassword(string password)
        {
            using (var sha = SHA256.Create())
            {
                var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
                var builder = new StringBuilder();
                foreach (var b in bytes)
                {
                    builder.Append(b.ToString("x2"));
                }
                return builder.ToString();
            }
        }
    }
}
