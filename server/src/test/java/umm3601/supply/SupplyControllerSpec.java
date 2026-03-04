package umm3601.supply;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
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
//import io.javalin.json.JavalinJackson;

@SuppressWarnings({ "MagicNumber" })
public class SupplyControllerSpec {
  private SupplyController supplyController;
  private ObjectId schoolSupplyId;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  //private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Supply>> supplyArrayListCaptor;

  @Captor
  private ArgumentCaptor<Supply> supplyCaptor;

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

    MongoCollection<Document> supplyDocuments = db.getCollection("supplies");
    supplyDocuments.drop();
    List<Document> testSupply = new ArrayList<>();

    testSupply.add(
      new Document()
        .append("school", "MAES")
        .append("grade", "1")
        .append("year", "2025-2026")
        .append("itemKey", "backpack")
        .append("itemName", "Backpack")
        .append("quantityRequired", 1)
        .append("details", "")
        .append("required", false));
    testSupply.add(
      new Document()
        .append("school", "MAHS")
        .append("grade", "K")
        .append("year", "2025-2026")
        .append("itemKey", "crayons")
        .append("itemName", "Crayons")
        .append("quantityRequired", 2)
        .append("details", "24 count, Crayola only")
        .append("required", true));
    testSupply.add(
      new Document()
        .append("school", "SMS")
        .append("grade", "K")
        .append("year", "2025-2026")
        .append("itemKey", "notebook")
        .append("itemName", "Notebook")
        .append("quantityRequired", 3)
        .append("details", "Wide ruled, 70 sheets")
        .append("required", true));
    schoolSupplyId = new ObjectId();
    Document schoolSupply = new Document()
      .append("_id", schoolSupplyId)
      .append("school", "MAES")
      .append("grade", "3")
      .append("year", "2025-2026")
      .append("itemKey", "folder_red")
      .append("itemName", "Folder")
      .append("quantityRequired", 1)
      .append("details", "Red plastic 3-prong (NOT binder)")
      .append("required", true);

  supplyDocuments.insertMany(testSupply);
    supplyDocuments.insertOne(schoolSupply);

    supplyController = new SupplyController(db);
  }

  @Test
  void addsRoutes() {
    Javalin mockServer = mock(Javalin.class);

    supplyController.addRoutes(mockServer);

    verify(mockServer, Mockito.atLeast(2)).get(any(), any());
    // verify(mockServer, Mockito.atLeastOnce()).post(any(), any());
    // verify(mockServer, Mockito.atLeastOnce()).delete(any(), any());
    // verify(mockServer, Mockito.atLeastOnce()).put(any(), any());
  }

  @Test
  void canGetAllSupplies() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());

    supplyController.getSupplies(ctx);

    verify(ctx).json(supplyArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals(
        db.getCollection("supplies").countDocuments(),
        supplyArrayListCaptor.getValue().size());
  }

  @Test
  void getSupplyWithExistentId() throws IOException {
    String id = schoolSupplyId.toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    supplyController.getSupply(ctx);

    verify(ctx).json(supplyCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals("folder_red", supplyCaptor.getValue().itemKey);
    assertEquals(schoolSupplyId.toHexString(), supplyCaptor.getValue()._id);
  }

  @Test
  void getUserWithNonexistentId() throws IOException {
    String id = "588935f5c668650dc77df581";
    when(ctx.pathParam("id")).thenReturn(id);

    Throwable exception = assertThrows(NotFoundResponse.class, () -> {
      supplyController.getSupply(ctx);
    });

    assertEquals("The requested supply was not found", exception.getMessage());
  }

  @Test
  void getInventoryWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      supplyController.getSupply(ctx);
    });

    assertEquals("The requested supply id wasn't a legal Mongo Object ID.", exception.getMessage());
  }

  @Test
  void canGetSupplyWithSchool() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(SupplyController.SCHOOL_KEY, Arrays.asList(new String[] {"SMS"}));
    when(ctx.queryParamMap()).thenReturn(queryParams);
    when(ctx.queryParam(SupplyController.SCHOOL_KEY)).thenReturn("SMS");

    supplyController.getSupplies(ctx);

    verify(ctx).json(supplyArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    // Confirm that all the users passed to `json` work for OHMNET.
    for (Supply supply : supplyArrayListCaptor.getValue()) {
      assertEquals("SMS", supply.school);
    }
  }

  @Test
  void canGetSupplyWithGrade() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(SupplyController.GRADE_KEY, Arrays.asList(new String[] {"1"}));
    when(ctx.queryParamMap()).thenReturn(queryParams);
    when(ctx.queryParam(SupplyController.GRADE_KEY)).thenReturn("1");

    supplyController.getSupplies(ctx);

    verify(ctx).json(supplyArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    // Confirm that all the users passed to `json` work for OHMNET.
    for (Supply supply : supplyArrayListCaptor.getValue()) {
      assertEquals("1", supply.grade);
    }
  }

  @Test
  void canGetSupplyWithYear() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(SupplyController.YEAR_KEY, Arrays.asList(new String[] {"2025-2026"}));
    when(ctx.queryParamMap()).thenReturn(queryParams);
    when(ctx.queryParam(SupplyController.YEAR_KEY)).thenReturn("2025-2026");

    supplyController.getSupplies(ctx);

    verify(ctx).json(supplyArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    // Confirm that all the users passed to `json` work for OHMNET.
    for (Supply supply : supplyArrayListCaptor.getValue()) {
      assertEquals("2025-2026", supply.year);
    }
  }

  @Test
  void canGetSupplyWithItemKey() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(SupplyController.ITEM_KEY, Arrays.asList(new String[] {"backpack"}));
    when(ctx.queryParamMap()).thenReturn(queryParams);
    when(ctx.queryParam(SupplyController.ITEM_KEY)).thenReturn("backpack");

    supplyController.getSupplies(ctx);

    verify(ctx).json(supplyArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    // Confirm that all the users passed to `json` work for OHMNET.
    for (Supply supply : supplyArrayListCaptor.getValue()) {
      assertEquals("backpack", supply.itemKey);
    }
  }

  @Test
  void canGetSupplyWithThree() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(SupplyController.YEAR_KEY, Arrays.asList(new String[] {"2025-2026"}));
    queryParams.put(SupplyController.SCHOOL_KEY, Arrays.asList(new String[] {"SMS"}));
    queryParams.put(SupplyController.GRADE_KEY, Arrays.asList(new String[] {"K"}));
    when(ctx.queryParamMap()).thenReturn(queryParams);
    when(ctx.queryParam(SupplyController.YEAR_KEY)).thenReturn("2025-2026");
    when(ctx.queryParam(SupplyController.SCHOOL_KEY)).thenReturn("SMS");
    when(ctx.queryParam(SupplyController.GRADE_KEY)).thenReturn("K");

    supplyController.getSupplies(ctx);

    verify(ctx).json(supplyArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    for (Supply supply : supplyArrayListCaptor.getValue()) {
      assertEquals("2025-2026", supply.year);
      assertEquals("SMS", supply.school);
      assertEquals("K", supply.grade);
    }
  }
}
