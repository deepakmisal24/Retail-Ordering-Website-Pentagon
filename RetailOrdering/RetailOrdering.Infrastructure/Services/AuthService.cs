using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RetailOrdering.Application.Interfaces;
using RetailOrdering.Domain.Entities;
using RetailOrdering.Infrastructure.Persistence;

namespace RetailOrdering.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthDto> LoginAsync(string email, string password)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email.ToLower() == email.ToLower());
            if (customer == null || !VerifyPassword(password, customer.PasswordHash))
            {
                return new AuthDto { Success = false, Message = "Invalid email or password." };
            }

            var token = GenerateJwtToken(customer);

            return new AuthDto
            {
                Success = true,
                Message = "Login successful.",
                Token = token,
                CustomerId = customer.Id,
                Username = customer.Username,
                Email = customer.Email,
                Role = customer.Role,
                LoyaltyPoints = customer.LoyaltyPoints
            };
        }

        public async Task<AuthDto> RegisterAsync(string username, string email, string password)
        {
            var exists = await _context.Customers.AnyAsync(c => c.Email.ToLower() == email.ToLower());
            if (exists)
            {
                return new AuthDto { Success = false, Message = "Email is already registered." };
            }

            var customer = new Customer
            {
                Username = username,
                Email = email,
                PasswordHash = HashPassword(password),
                Role = "Customer",
                LoyaltyPoints = 100, // Sign-up bonus points!
                CreatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(customer);

            return new AuthDto
            {
                Success = true,
                Message = "Registration successful.",
                Token = token,
                CustomerId = customer.Id,
                Username = customer.Username,
                Email = customer.Email,
                Role = customer.Role,
                LoyaltyPoints = customer.LoyaltyPoints
            };
        }

        public async Task<Customer?> GetCustomerByIdAsync(int id)
        {
            return await _context.Customers.FindAsync(id);
        }

        public string HashPassword(string password)
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

        public bool VerifyPassword(string password, string hashedPassword)
        {
            var hashedInput = HashPassword(password);
            return string.Equals(hashedInput, hashedPassword, StringComparison.OrdinalIgnoreCase);
        }

        private string GenerateJwtToken(Customer customer)
        {
            var keyString = _configuration["Jwt:Key"] ?? "SUPER_SECRET_PIZZA_ORDERING_KEY_2026_DO_NOT_SHARE";
            if (keyString.Length < 32)
            {
                keyString = keyString.PadRight(32, '0');
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, customer.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, customer.Email),
                new Claim("role", customer.Role),
                new Claim("name", customer.Username),
                new Claim("unique_name", customer.Username)
            };

            var issuer = _configuration["Jwt:Issuer"] ?? "PizzaOrderingAPI";
            var audience = _configuration["Jwt:Audience"] ?? "PizzaOrderingWeb";

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
