package umm3601.supply;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatcher;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
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
import io.javalin.validation.Validation;
import io.javalin.validation.ValidationError;
import io.javalin.validation.ValidationException;
import io.javalin.validation.Validator;
import umm3601.user.UserController;

@SuppressWarnings({ "MagicNumber" })
public class SupplyControllerSpec {
  private SupplyController supplyController;
  private ObjectId schoolSupplyId;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  private static JavalinJackson javalinJackson = new JavalinJackson();

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
        .append("school", "MAES")
        .append("grade", "K")
        .append("year", "2025-2026")
        .append("itemKey", "crayons")
        .append("itemName", "Crayons")
        .append("quantityRequired", 2)
        .append("details", "24 count, Crayola only")
        .append("required", true));
    testSupply.add(
      new Document()
        .append("school", "MAES")
        .append("grade", "K")
        .append("year", "2025-2026")
        .append("itemKey", "notebook")
        .append("itemName", "Notebook")
        .append("quantityRequired", 3)
        .append("details", "Wide ruled, 70 sheets")
        .append("required", true));
    schoolSupplyId = new ObjectId();
    Document schoolSupply = new Document()
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

  // @Test
  // void addsRoutes() {
  //   Javalin mockServer = mock(Javalin.class);
  //   supplyController.addRoutes(mockServer);
  //   verify(mockServer, Mockito.atLeast(3)).get(any(), any());
  //   verify(mockServer, Mockito.atLeastOnce()).post(any(), any());
  //   verify(mockServer, Mockito.atLeastOnce()).delete(any(), any());
  // }

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

  // @Test
  // void getSupplyWithExistentId() throws IOException {
  //   String id = schoolSupplyId.toHexString();
  //   when(ctx.pathParam("id")).thenReturn(id);

  //   supplyController.getSupply(ctx);

  //   verify(ctx).json(supplyCaptor.capture());
  //   verify(ctx).status(HttpStatus.OK);
  //   assertEquals("folder_red", supplyCaptor.getValue().itemKey);
  //   assertEquals(schoolSupplyId.toHexString(), supplyCaptor.getValue()._id);
  // }

  @Test
  void getUserWithNonexistentId() throws IOException {
    String id = "588935f5c668650dc77df581";
    when(ctx.pathParam("id")).thenReturn(id);

    Throwable exception = assertThrows(NotFoundResponse.class, () -> {
      supplyController.getSupply(ctx);
    });

    assertEquals("The requested supply was not found", exception.getMessage());
  }
}
