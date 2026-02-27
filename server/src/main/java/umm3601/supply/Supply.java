package umm3601.supply;

import org.mongojack.Id;
import org.mongojack.ObjectId;

@SuppressWarnings({"VisibilityModifier"})
public class Supply {
  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String school;
  public String grade;
  public String year;

  public String itemKey;
  public String itemName;

  public int quantityRequired;

  public String details;

  public boolean required;
}
