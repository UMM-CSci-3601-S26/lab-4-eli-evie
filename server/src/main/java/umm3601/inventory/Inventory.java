package umm3601.inventory;

import org.mongojack.Id;
import org.mongojack.ObjectId;

@SuppressWarnings({"VisibilityModifier"})
public class Inventory {
  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String itemKey;
  public String itemName;

  public int quantityAvailable;
}
