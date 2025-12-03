namespace MIS330_GroupProject1.Models;

public class Customer
{
    public int CustomerId { get; set; }
    public string CustFName { get; set; } = string.Empty;
    public string CustLName { get; set; } = string.Empty;
    public string CustEmail { get; set; } = string.Empty;
    public string CustPhoneNum { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public List<Pet> Pets { get; set; } = new();
    public List<Booking> Bookings { get; set; } = new();
}
