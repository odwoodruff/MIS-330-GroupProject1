namespace MIS330_GroupProject1.Models;

public class Customer
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // Customer, Trainer, Admin, Employee
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int? TrainerId { get; set; }
    public Trainer? Trainer { get; set; }
    public int? EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public List<Pet> Pets { get; set; } = new();
    public List<Booking> Bookings { get; set; } = new();
}

