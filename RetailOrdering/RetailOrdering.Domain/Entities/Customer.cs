using System;

namespace RetailOrdering.Domain.Entities
{
    public class Customer
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Customer"; // Admin or Customer
        public int LoyaltyPoints { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public void AccruePoints(int points)
        {
            if (points > 0)
            {
                LoyaltyPoints += points;
            }
        }

        public bool RedeemPoints(int points)
        {
            if (points <= 0 || LoyaltyPoints < points) return false;
            LoyaltyPoints -= points;
            return true;
        }
    }
}
