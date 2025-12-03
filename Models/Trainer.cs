namespace MIS330_GroupProject1.Models;

public class Trainer
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public List<Class> Classes { get; set; } = new();
    public List<Customer> Customers { get; set; } = new();
}

