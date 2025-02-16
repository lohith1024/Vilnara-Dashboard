using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using WebApi.Services;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        IEmailService emailService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterModel model)
    {
        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            FirstName = model.FirstName,
            LastName = model.LastName,
            EmailConfirmed = false
        };

        var result = await _userManager.CreateAsync(user, model.Password);
        if (result.Succeeded)
        {
            /* Original Email Verification Code (Commented)
            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            await _emailService.SendVerificationEmailAsync(
                model.Email,
                code,
                $"Your verification code is: {code}"
            );
            return Ok(new { message = "Registration successful. Please check your email for verification code." });
            */

            // Dummy Verification Strategy
            var dummyCode = "123456";  // Fixed code for testing
            return Ok(new
            {
                message = "Registration successful. For testing purposes only.",
                verificationCode = dummyCode
            });
        }

        return BadRequest(result.Errors);
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail(VerificationModel model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null) return BadRequest("Invalid email");

        /* Original Email Verification Code (Commented)
        var result = await _userManager.ConfirmEmailAsync(user, model.Code);
        if (result.Succeeded)
        {
            return Ok(new { message = "Email verified successfully" });
        }
        */

        // Dummy Verification Strategy
        if (model.Code == "123456")  // Accept fixed code
        {
            user.EmailConfirmed = true;
            await _userManager.UpdateAsync(user);
            return Ok(new { message = "Email verified successfully" });
        }

        return BadRequest("Invalid verification code");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginModel model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        // Check if email is confirmed
        if (!user.EmailConfirmed)
        {
            return Unauthorized(new { message = "Please verify your email before logging in" });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var token = await GenerateJwtToken(user);
        return Ok(new { token });
    }

    private async Task<string> GenerateJwtToken(ApplicationUser user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:ExpirationInMinutes"]));

        var token = new JwtSecurityToken(
            _configuration["JwtSettings:Issuer"],
            _configuration["JwtSettings:Audience"],
            claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private bool VerifyPassword(string password, string passwordHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }
}