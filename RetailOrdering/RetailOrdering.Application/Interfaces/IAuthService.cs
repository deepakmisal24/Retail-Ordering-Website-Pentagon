using System.Threading.Tasks;
using RetailOrdering.Domain.Entities;

namespace RetailOrdering.Application.Interfaces
{
    public class AuthDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int LoyaltyPoints { get; set; }
    }

    public interface IAuthService
    {
        Task<AuthDto> RegisterAsync(string username, string email, string password);
        Task<AuthDto> LoginAsync(string email, string password);
        Task<Customer?> GetCustomerByIdAsync(int id);
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
    }
}
