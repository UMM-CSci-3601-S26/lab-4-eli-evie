package umm3601.inventory;

import org.mongojack.Id;
import org.mongojack.ObjectId;

/**
 * The Inventory model represents the *physical stock* available for each supply item.
 *
 * Iteration 1 intentionally keeps this model extremely simple:
 *  - Only one stable identifier (itemKey)
 *  - A human-readable name (itemName)
 *  - A single mutable field (quantityAvailable)
 *
 * This minimal structure makes Inventory easy to evolve in future iterations.
 * Later teams may add:
 *  - location-based stock (like the bin base system)
 *  - item categories (Brand, count, color, etc)
 *
 * Currently, Inventory exists as a lightweight placeholder for future expansion.
 */
@SuppressWarnings({"VisibilityModifier"})
public class Inventory {

  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id; // MongoDB ObjectId stored as a string

  /**
   * itemKey is the stable identifier shared across:
   *  - Supply (requirements)
   *  - Family requests
   *  - Inventory (stock)
   *
   * Using itemKey instead of _id allows the same supply item
   * to appear in multiple school/grade lists.
   */
  public String itemKey;

  // Human-readable name for display purposes.
  public String itemName;

  public int quantityAvailable;
}
