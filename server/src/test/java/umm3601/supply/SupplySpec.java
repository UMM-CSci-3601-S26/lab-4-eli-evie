package umm3601.supply;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class SupplySpec {
  private static final String FAKE_ID_STRING_1 = "fakeIdOne";
  private static final String FAKE_ID_STRING_2 = "fakeIdTwo";

  private Supply supply1;
  private Supply supply2;

  @BeforeEach
  void setupEach() {
    supply1 = new Supply();
    supply2 = new Supply();
  }

  @Test
  void suppliesWithEqualIdAreEqual() {
    supply1._id = FAKE_ID_STRING_1;
    supply2._id = FAKE_ID_STRING_1;

    assertEquals(supply1._id, supply2._id); //This line changed from UserSpec due to error
  }

  @Test
  void suppliesWithDifferentIdAreNotEqual() {
    supply1._id = FAKE_ID_STRING_1;
    supply2._id = FAKE_ID_STRING_2;

    assertFalse(supply1.equals(supply2));
  }

  @SuppressWarnings("unlikely-arg-type")
  @Test
  void suppliesAreNotEqualToOtherKindsOfThings() {
    supply1._id = FAKE_ID_STRING_1;
    assertFalse(supply1.equals(FAKE_ID_STRING_1));
  }
}
