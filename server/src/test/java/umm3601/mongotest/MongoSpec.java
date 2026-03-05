package umm3601.mongotest;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoIterable;

import org.bson.Document;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Some simple "tests" that demonstrate our ability to
 * connect to a Mongo database and run some basic queries
 * against it.
 * <p>
 * Note that none of these are actually tests of any of our
 * code; they are mostly demonstrations of the behavior of
 * the MongoDB Java libraries. Thus if they test anything,
 * they test that code, and perhaps our understanding of it.
 * <p>
 * To test "our" code we'd want the tests to confirm that
 * the behavior of methods in things like the InventoryController
 * do the "right" thing.
 */
// The tests here include a ton of "magic numbers" (numeric constants).
// It wasn't clear to me that giving all of them names would actually
// help things. The fact that it wasn't obvious what to call some
// of them says a lot. Maybe what this ultimately means is that
// these tests can/should be restructured so the constants (there are
// also a lot of "magic strings" that Checkstyle doesn't actually
// flag as a problem) make more sense.
@SuppressWarnings({"MagicNumber"})
class MongoSpec {

  private MongoCollection<Document> inventoryDocuments;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  @BeforeAll
  static void setupDB() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
      MongoClientSettings.builder()
      .applyToClusterSettings(builder ->
        builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
      .build());

    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  void clearAndPopulateDB() {
    inventoryDocuments = db.getCollection("inventory");
    inventoryDocuments.drop();
    List<Document> testInventory = new ArrayList<>();
    testInventory.add(
      new Document()
        .append("itemKey", "backpack")
        .append("itemName", "Backpack")
        .append("quantityAvailable", 5));
    testInventory.add(
      new Document()
        .append("itemKey", "colored_pencils")
        .append("itemName", "Colored Pencils")
        .append("quantityAvailable", 3));
    testInventory.add(
      new Document()
        .append("itemKey", "composition_notebook")
        .append("itemName", "Composition Notebook")
        .append("quantityAvailable", 2));


    inventoryDocuments.insertMany(testInventory);
  }

  private List<Document> intoList(MongoIterable<Document> documents) {
    List<Document> inventory = new ArrayList<>();
    documents.into(inventory);
    return inventory;
  }

  private int countInventory(FindIterable<Document> documents) {
    List<Document> inventory = intoList(documents);
    return inventory.size();
  }

  @Test
  void shouldBeThreeInventory() {
    FindIterable<Document> documents = inventoryDocuments.find();
    int numberOfInventory = countInventory(documents);
    assertEquals(3, numberOfInventory, "Should be 3 total inventory");
  }

  @Test
  void shouldBeOneChris() {
    FindIterable<Document> documents = inventoryDocuments.find(eq("itemKey", "backpack"));
    int numberOfInventory = countInventory(documents);
    assertEquals(1, numberOfInventory, "Should be 1 backpack profile");
  }

  // @Test
  // void ageCounts() {
  //   List<Document> docs
  //     = inventoryDocuments.aggregate(
  //     Arrays.asList(
  //       /*
  //        * Groups data by the "age" field, and then counts
  //        * the number of documents with each given age.
  //        * This creates a new "constructed document" that
  //        * has "age" as it's "_id", and the count as the
  //        * "ageCount" field.
  //        */
  //       Aggregates.group("$age",
  //         Accumulators.sum("ageCount", 1)),
  //       Aggregates.sort(Sorts.ascending("_id"))
  //     )
  //   ).into(new ArrayList<>()); //Attempts to coerce the resulting AggregateIterable object into an ArrayList.
  //   assertEquals(2, docs.size(), "Should be two distinct ages");
  //   assertEquals(25, docs.get(0).get("_id"));
  //   assertEquals(1, docs.get(0).get("ageCount"));
  //   assertEquals(37, docs.get(1).get("_id"));
  //   assertEquals(2, docs.get(1).get("ageCount"));
  // }

  // @Test
  // void averageAge() {
  //   List<Document> docs
  //     = inventoryDocuments.aggregate(
  //     Arrays.asList(
  //       Aggregates.group("$company",
  //         Accumulators.avg("averageAge", "$age")),
  //       Aggregates.sort(Sorts.ascending("_id"))
  //     )).into(new ArrayList<>());
  //   assertEquals(3, docs.size(), "Should be three companies");

  //   assertEquals("Frogs, Inc.", docs.get(0).get("_id"));
  //   assertEquals(37.0, docs.get(0).get("averageAge"));
  //   assertEquals("IBM", docs.get(1).get("_id"));
  //   assertEquals(37.0, docs.get(1).get("averageAge"));
  //   assertEquals("UMM", docs.get(2).get("_id"));
  //   assertEquals(25.0, docs.get(2).get("averageAge"));
  // }

}
