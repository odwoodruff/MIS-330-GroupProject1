namespace MIS330_GroupProject1.Models;

public class Employee
{
    public int EmployeeId { get; set; }
    public string EmpFName { get; set; } = string.Empty;
    public string EmpLName { get; set; } = string.Empty;
    public string EmpEmail { get; set; } = string.Empty;
    public string EmpPhoneNum { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public DateTime HireDate { get; set; }
    public string Password { get; set; } = string.Empty;
    public Trainer? Trainer { get; set; }
    public List<Class> Classes { get; set; } = new();
}
