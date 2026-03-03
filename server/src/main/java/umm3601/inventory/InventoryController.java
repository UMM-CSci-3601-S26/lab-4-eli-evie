package umm3601.inventory;

import static com.mongodb.client.model.Filters.eq;

import java.util.ArrayList;
import java.util.Map;

import org.bson.UuidRepresentation;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;

import umm3601.Controller;

/* FamilyController Contains the Following:
- getAllInventory()
- getInventoryById() /By ID/
- addInventory()
- updateInventoryQuantity() /By ID/
- deleteInventory() /By ID/
*/

/* Notes:

*/

public class InventoryController implements Controller {

  private static final String API_INVENTORY = "/api/inventory";
  private static final String API_INVENTORY_BY_ID = "/api/inventory/{id}";

  public static final String ITEMKEY_REGEX = "^[a-z_]+$";

  private final JacksonMongoCollection<Inventory> inventoryCollection;

  public InventoryController(MongoDatabase database) {
    inventoryCollection = JacksonMongoCollection.builder().build(
      database,
      "inventory",
      Inventory.class,
      UuidRepresentation.STANDARD);
  }

  // GET all inventory
  public void getAllInventory(Context ctx) {
    ArrayList<Inventory> inventory = inventoryCollection
      .find()
      .into(new ArrayList<>());

    ctx.json(inventory);
    ctx.status(HttpStatus.OK);
  }

  // GET inventory by ID
  public void getInventoryById(Context ctx) {
    String id = ctx.pathParam("id");
    Inventory inventory;

    try {
      inventory = inventoryCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested inventory id wasn't a legal Mongo Object ID.");
    }
    if (inventory == null) {
      throw new NotFoundResponse("The requested inventory was not found");
    } else {
      ctx.json(inventory);
      ctx.status(HttpStatus.OK);
    }
    }

  // POST new inventory item
  public void addInventory(Context ctx) {
    //String body = ctx.body();
    Inventory newItem = ctx.bodyValidator(Inventory.class)
      .check(inventory -> inventory.quantityAvailable >= 0,
        "Quantity must be >= 0")
      .check(inventory -> inventory.itemKey != null,
        "Inventory must have a non-empty item key")
      .check(inventory -> inventory.itemKey.matches(ITEMKEY_REGEX),
        "Inventory Item Key must be lowercase with no spaces")
      .check(inventory -> inventory.itemName != null,
        "Inventory must have a non-empty item name")
      .get();

    inventoryCollection.insertOne(newItem);

    ctx.json(Map.of("id", newItem._id));
    ctx.status(HttpStatus.CREATED);
  }

  // PUT update quantity
  public void updateInventoryQuantity(Context ctx) {
    String id = ctx.pathParam("id");
    QuantityUpdate update = ctx.bodyValidator(QuantityUpdate.class)
      .check(quantity -> quantity.getQuantityAvailable() >= 0,
        "Quantity must be >= 0")
      .get();
    Inventory existing = inventoryCollection.findOneById(id);

    if (existing == null) {
      throw new NotFoundResponse("Inventory item not found");
    }

    existing.quantityAvailable = update.getQuantityAvailable();
    inventoryCollection.replaceOneById(id, existing);
    ctx.status(HttpStatus.OK);
  }

  // DELETE inventory item
  public void deleteInventory(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = inventoryCollection.deleteOne(eq("_id", new ObjectId(id)));

    if (deleteResult.getDeletedCount() != 1) {
      ctx.status(HttpStatus.NOT_FOUND);
      throw new NotFoundResponse(
        "Was unable to delete ID "
          + id
          + "; perhaps illegal ID or an ID for an item not in the system?");
    }
    ctx.status(HttpStatus.OK);
  }

  @Override
  public void addRoutes(Javalin server) {
    server.get(API_INVENTORY, this::getAllInventory);
    server.post(API_INVENTORY, this::addInventory);
    server.get(API_INVENTORY_BY_ID, this::getInventoryById);
    server.put(API_INVENTORY_BY_ID, this::updateInventoryQuantity);
    server.delete(API_INVENTORY_BY_ID, this::deleteInventory);
  }
}
