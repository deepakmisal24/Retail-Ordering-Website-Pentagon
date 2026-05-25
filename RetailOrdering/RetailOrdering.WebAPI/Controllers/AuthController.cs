using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailOrdering.Application.Interfaces;

namespace RetailOrdering.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request.Username, request.Email, request.Password);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request.Email, request.Password);
            if (!result.Success)
            {
                return Unauthorized(new { message = result.Message });
            }
            return Ok(result);
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(idClaim) || !int.TryParse(idClaim, out int customerId))
            {
                return Unauthorized(new { message = "Invalid authentication claims." });
            }

            var customer = await _authService.GetCustomerByIdAsync(customerId);
            if (customer == null)
            {
                return NotFound(new { message = "Customer not found." });
            }

            return Ok(new
            {
                customerId = customer.Id,
                username = customer.Username,
                email = customer.Email,
                role = customer.Role,
                loyaltyPoints = customer.LoyaltyPoints,
                createdAt = customer.CreatedAt
            });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
