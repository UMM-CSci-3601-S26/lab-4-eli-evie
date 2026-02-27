package umm3601.inventory;

import org.mongojack.Id;

@SuppressWarnings({"VisibilityModifier"})
public class Inventory {
  @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String itemKey;
  public String itemName;

  public int quantityAvailable;
}
