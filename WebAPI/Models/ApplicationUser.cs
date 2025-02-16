using Microsoft.AspNetCore.Identity;

public class ApplicationUser : IdentityUser
{
    public DateTime CreatedAt { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}