namespace RetailOrdering.Application.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int AvailableStock { get; set; }
        public int LowStockThreshold { get; set; }
        public string SizeOptionsJson { get; set; } = "[]";
        public string ToppingOptionsJson { get; set; } = "[]";
        public bool IsAvailable { get; set; }
        public bool IsStockLow { get; set; }
    }
}
