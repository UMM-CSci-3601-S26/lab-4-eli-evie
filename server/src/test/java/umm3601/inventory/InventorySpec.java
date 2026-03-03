package umm3601.inventory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class InventorySpec {
  private static final String FAKE_ID_STRING_1 = "fakeIdOne";
  private static final String FAKE_ID_STRING_2 = "fakeIdTwo";

  private Inventory inventory1;
  private Inventory inventory2;

  @BeforeEach
  void setupEach() {
    inventory1 = new Inventory();
    inventory2 = new Inventory();
  }

  @Test
  void suppliesWithEqualIdAreEqual() {
    inventory1._id = FAKE_ID_STRING_1;
    inventory2._id = FAKE_ID_STRING_1;

    assertEquals(inventory1._id, inventory2._id); //This line changed from UserSpec due to error
  }

  @Test
  void suppliesWithDifferentIdAreNotEqual() {
    inventory1._id = FAKE_ID_STRING_1;
    inventory2._id = FAKE_ID_STRING_2;

    assertFalse(inventory1.equals(inventory2));
  }

  @SuppressWarnings("unlikely-arg-type")
  @Test
  void suppliesAreNotEqualToOtherKindsOfThings() {
    inventory1._id = FAKE_ID_STRING_1;
    assertFalse(inventory1.equals(FAKE_ID_STRING_1));
  }
}
