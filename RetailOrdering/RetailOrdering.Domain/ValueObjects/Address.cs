using System;

namespace RetailOrdering.Domain.ValueObjects
{
    public class Address
    {
        public string Street { get; private set; } = string.Empty;
        public string City { get; private set; } = string.Empty;
        public string ZipCode { get; private set; } = string.Empty;
        public string Country { get; private set; } = "USA";

        private Address() { } // EF Core required

        public Address(string street, string city, string zipCode, string country = "USA")
        {
            Street = street ?? throw new ArgumentNullException(nameof(street));
            City = city ?? throw new ArgumentNullException(nameof(city));
            ZipCode = zipCode ?? throw new ArgumentNullException(nameof(zipCode));
            Country = country ?? "USA";
        }

        public string FullAddress => $"{Street}, {City}, {ZipCode}, {Country}";
    }
}
