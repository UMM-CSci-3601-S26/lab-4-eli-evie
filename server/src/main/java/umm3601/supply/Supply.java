package umm3601.supply;

import org.mongojack.Id;
import org.mongojack.ObjectId;

/**
 * The Supply model represents the *official school supply requirements*
 * for a specific school, grade, and academic year.
 *
 * Iteration 1 intentionally keeps Supply simple and read‑only.
 * Future teams may add:
 *  - admin editing tools
 *  - versioning
 *  - richer item metadata
 *  - validation against Inventory
 */
@SuppressWarnings({"VisibilityModifier"})
public class Supply {

  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String school;
  public String grade;
  public String year;

  /**
   * itemKey is the stable identifier shared across:
   *  - Supply (requirements)
   *  - Inventory (stock)
   *  - Family requests
   *
   * Using itemKey instead of _id allows the same supply item
   * to appear in multiple school/grade lists.
   */
  public String itemKey;
  public String itemName;

  public int quantityRequired;

  /**
   * Flexible description field.
   * Schools often specify details like:
   *  - color
   *  - material
   *  - brand
   *  - size
   *
   * Iteration 1 keeps this as a simple string to avoid over‑structuring.
   */
  public String details;

  /**
   * Whether this item is required or optional.
   * Useful for filtering and future fulfillment logic.
   */
  public boolean required;
}
