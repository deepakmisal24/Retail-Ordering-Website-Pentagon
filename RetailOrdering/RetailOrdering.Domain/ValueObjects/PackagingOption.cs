using System;

namespace RetailOrdering.Domain.ValueObjects
{
    public class PackagingOption
    {
        public string Name { get; private set; } = string.Empty;
        public decimal Price { get; private set; }
        public string Description { get; private set; } = string.Empty;

        private PackagingOption() { } // EF Core required

        public PackagingOption(string name, decimal price, string description = "")
        {
            if (price < 0) throw new ArgumentException("Price cannot be negative.", nameof(price));
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Price = price;
            Description = description ?? string.Empty;
        }
    }
}
