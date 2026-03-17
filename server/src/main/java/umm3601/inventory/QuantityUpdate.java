package umm3601.inventory;

/**
 * Helper class used for PUT /api/inventory/{id}.
 *
 * This wrapper exists so that updates only modify quantityAvailable,
 * rather than replacing the entire Inventory object.
 *
 * This keeps updates safe and predictable in Iteration 1.
 */
public class QuantityUpdate {

  private int quantityAvailable;

  public int getQuantityAvailable() {
    return quantityAvailable;
  }

  public void setQuantityAvailable(int quantityAvailable) {
    this.quantityAvailable = quantityAvailable;
  }
}
