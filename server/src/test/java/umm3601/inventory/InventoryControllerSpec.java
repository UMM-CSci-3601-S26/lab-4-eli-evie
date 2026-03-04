package umm3601.inventory;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import io.javalin.json.JavalinJackson;
import io.javalin.validation.BodyValidator;
import io.javalin.validation.ValidationException;

@SuppressWarnings({ "MagicNumber" })
public class InventoryControllerSpec {
  private InventoryController inventoryController;
  private Object crayonsID;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  // Used to translate between JSON and POJOs.
  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Inventory>> inventoryArrayListCaptor;

  @Captor
  private ArgumentCaptor<Inventory> inventoryCaptor;

  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;

  @BeforeAll
  static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build());
    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  void setupEach() throws IOException {
    MockitoAnnotations.openMocks(this);

    MongoCollection<Document> inventoryDocuments = db.getCollection("inventory");
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

    crayonsID = new ObjectId();
    Document crayonsDoc = new Document()
      .append("_id", crayonsID)
      .append("itemKey", "crayons")
      .append("itemName", "Crayons")
      .append("quantityAvailable", 9);

    inventoryDocuments.insertMany(testInventory);
    inventoryDocuments.insertOne(crayonsDoc);

    inventoryController = new InventoryController(db);
  }

  @Test
  void addsRoutes() {
    Javalin mockServer = mock(Javalin.class);

    inventoryController.addRoutes(mockServer);

    verify(mockServer, Mockito.atLeast(2)).get(any(), any());
    verify(mockServer, Mockito.atLeastOnce()).post(any(), any());
    verify(mockServer, Mockito.atLeastOnce()).delete(any(), any());
    verify(mockServer, Mockito.atLeastOnce()).put(any(), any());
  }

  @Test
  void canGetAllIventory() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());
    inventoryController.getAllInventory(ctx);
    verify(ctx).json(inventoryArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(
        db.getCollection("inventory").countDocuments(),
        inventoryArrayListCaptor.getValue().size());
  }

  @Test
  void getInventoryWithExistentId() throws IOException {
    String id = crayonsID.toString();
    when(ctx.pathParam("id")).thenReturn(id);

    inventoryController.getInventoryById(ctx);

    verify(ctx).json(inventoryCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals("crayons", inventoryCaptor.getValue().itemKey);
    assertEquals(crayonsID.toString(), inventoryCaptor.getValue()._id);
  }

  @Test
  void getInventoryWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      inventoryController.getInventoryById(ctx);
    });

    assertEquals("The requested inventory id wasn't a legal Mongo Object ID.", exception.getMessage());
  }

  @Test
  void getInventoryWithNonexistentId() throws IOException {
    String id = "588935f5c668650dc77df581";
    when(ctx.pathParam("id")).thenReturn(id);

    Throwable exception = assertThrows(NotFoundResponse.class, () -> {
      inventoryController.getInventoryById(ctx);
    });

    assertEquals("The requested inventory was not found", exception.getMessage());
  }

  @Test
  void addInventory() throws IOException {
    Inventory newInventory = new Inventory();
    newInventory.itemKey = "disinfecting_wipes";
    newInventory.itemName = "Disinfecting Wipes";
    newInventory.quantityAvailable = 3;

    String newInventoryJson = javalinJackson.toJsonString(newInventory, Inventory.class);

    when(ctx.bodyValidator(Inventory.class))
      .thenReturn(new BodyValidator<Inventory>(newInventoryJson, Inventory.class,
                    () -> javalinJackson.fromJsonString(newInventoryJson, Inventory.class)));

    inventoryController.addInventory(ctx);
    verify(ctx).json(mapCaptor.capture());

    verify(ctx).status(HttpStatus.CREATED);

    Document addedInventory = db.getCollection("inventory")
        .find(eq("_id", new ObjectId(mapCaptor.getValue().get("id")))).first();

    assertNotEquals("", addedInventory.get("_id"));
    assertEquals(newInventory.itemKey, addedInventory.get("itemKey"));
    assertEquals(newInventory.itemName, addedInventory.get("itemName"));
    assertEquals(newInventory.quantityAvailable, addedInventory.get("quantityAvailable"));
  }

  @Test
  void addInvalidQuantityToInventory() throws IOException {
    String newInventoryJson = """
      {
        "itemKey": "composition_notebook",
        "itemName": "Composition Notebook",
        "quantityAvailable": -1
      }
      """;

    when(ctx.body()).thenReturn(newInventoryJson);
    when(ctx.bodyValidator(Inventory.class))
      .thenReturn(new BodyValidator<Inventory>(newInventoryJson, Inventory.class,
                    () -> javalinJackson.fromJsonString(newInventoryJson, Inventory.class)));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      inventoryController.addInventory(ctx);
    });

    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

    assertTrue(exceptionMessage.contains("Quantity must be >= 0"));
  }

  @Test
  void addInvalidItenKeyToInventory() throws IOException {
    String newInventoryJson = """
      {
        "itemKey": "Composition Notebook",
        "itemName": "Composition Notebook",
        "quantityAvailable": 5
      }
      """;

    when(ctx.body()).thenReturn(newInventoryJson);
    when(ctx.bodyValidator(Inventory.class))
      .thenReturn(new BodyValidator<Inventory>(newInventoryJson, Inventory.class,
                    () -> javalinJackson.fromJsonString(newInventoryJson, Inventory.class)));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      inventoryController.addInventory(ctx);
    });

    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

    assertTrue(exceptionMessage.contains("Inventory Item Key must be lowercase with no spaces"));
  }

  @Test
  void addInventoryWithEmptyItemKeyFails() {

    String body = """
      {
        "itemKey": "",
        "itemName": "Markers",
        "quantityAvailable": 5
      }
    """;

    when(ctx.bodyValidator(Inventory.class))
      .thenReturn(new BodyValidator<>(
        body,
        Inventory.class,
        () -> javalinJackson.fromJsonString(body, Inventory.class)
      ));

    ValidationException exception =
      assertThrows(ValidationException.class, () -> {
        inventoryController.addInventory(ctx);
      });

    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

    assertTrue(exceptionMessage.contains("non-empty item key"));
  }

  @Test
  void addInventoryWithEmptyItemNameFails() {

    String body = """
      {
        "itemKey": "markers",
        "itemName": "",
        "quantityAvailable": 5
      }
    """;

    when(ctx.bodyValidator(Inventory.class))
      .thenReturn(new BodyValidator<>(
        body,
        Inventory.class,
        () -> javalinJackson.fromJsonString(body, Inventory.class)
      ));

    ValidationException exception =
      assertThrows(ValidationException.class, () -> {
        inventoryController.addInventory(ctx);
      });

    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

    assertTrue(exceptionMessage.contains("non-empty item name"));
  }

  @Test
  void updateInventoryQuantityWorks() {
    String id = crayonsID.toString();
    when(ctx.pathParam("id")).thenReturn(id);

    String body = """
      { "quantityAvailable": 42 }
    """;

    when(ctx.bodyValidator(QuantityUpdate.class))
      .thenReturn(new BodyValidator<>(
        body,
        QuantityUpdate.class,
        () -> javalinJackson.fromJsonString(body, QuantityUpdate.class)
      ));

    inventoryController.updateInventoryQuantity(ctx);

    verify(ctx).status(HttpStatus.OK);

    Document updated = db.getCollection("inventory")
      .find(eq("_id", new ObjectId(id))).first();

    assertEquals(42, updated.get("quantityAvailable"));
  }

  @Test
  void updateInventoryQuantityNegativeFails() {
    String id = crayonsID.toString();
    when(ctx.pathParam("id")).thenReturn(id);

    String body = """
      { "quantityAvailable": -5 }
    """;

    when(ctx.bodyValidator(QuantityUpdate.class))
      .thenReturn(new BodyValidator<>(
        body,
        QuantityUpdate.class,
        () -> javalinJackson.fromJsonString(body, QuantityUpdate.class)
      ));

    ValidationException exception =
      assertThrows(ValidationException.class, () -> {
        inventoryController.updateInventoryQuantity(ctx);
      });

    assertTrue(
      exception.getErrors()
        .get("REQUEST_BODY")
        .get(0)
        .toString()
        .contains("Quantity must be >= 0")
    );
  }

  @Test
  void updateInventoryQuantityNotFound() {

    String fakeId = new ObjectId().toString();
    when(ctx.pathParam("id")).thenReturn(fakeId);

    String body = """
      { "quantityAvailable": 10 }
    """;

    when(ctx.bodyValidator(QuantityUpdate.class))
      .thenReturn(new BodyValidator<>(
        body,
        QuantityUpdate.class,
        () -> javalinJackson.fromJsonString(body, QuantityUpdate.class)
      ));

    NotFoundResponse exception =
      assertThrows(NotFoundResponse.class, () -> {
        inventoryController.updateInventoryQuantity(ctx);
      });

    assertEquals("Inventory item not found", exception.getMessage());
  }

  @Test
  void deleteFoundInventory() throws IOException {
    String testID = crayonsID.toString();
    when(ctx.pathParam("id")).thenReturn(testID);

    assertEquals(1, db.getCollection("inventory").countDocuments(eq("_id", new ObjectId(testID))));

    inventoryController.deleteInventory(ctx);

    verify(ctx).status(HttpStatus.OK);

    assertEquals(0, db.getCollection("inventory").countDocuments(eq("_id", new ObjectId(testID))));
  }

  @Test
  void tryToDeleteNotFoundInventory() throws IOException {
    String testID = crayonsID.toString();
    when(ctx.pathParam("id")).thenReturn(testID);

    inventoryController.deleteInventory(ctx);
    assertEquals(0, db.getCollection("inventory").countDocuments(eq("_id", new ObjectId(testID))));

    assertThrows(NotFoundResponse.class, () -> {
      inventoryController.deleteInventory(ctx);
    });

    verify(ctx).status(HttpStatus.NOT_FOUND);
    assertEquals(0, db.getCollection("inventory").countDocuments(eq("_id", new ObjectId(testID))));
  }

  @Test
  void deleteInventoryWithBadId() {
    when(ctx.pathParam("id")).thenReturn("bad");

    assertThrows(IllegalArgumentException.class, () -> {
      inventoryController.deleteInventory(ctx);
    });
  }
}
