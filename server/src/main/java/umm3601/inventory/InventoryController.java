package umm3601.inventory;

import static com.mongodb.client.model.Filters.eq;

import java.util.ArrayList;
import java.util.Map;

import org.bson.UuidRepresentation;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.result.DeleteResult;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;

import umm3601.Controller;

/**
 * Controller for Inventory API routes.
 *
 * Inventory in Iteration 1 is intentionally minimal:
 *  - No linking to Supply objects
 *  - No validation against existing supply lists
 *  - No complex update logic
 *
 * The goal is to provide a clean, stable foundation that future teams
 * can expand into a full inventory management system.
 *
 * Routes include:
 *  - GET /api/inventory              → list all inventory
 *  - GET /api/inventory/{id}         → get a single inventory item
 *  - POST /api/inventory             → add a new inventory item
 *  - PUT /api/inventory/{id}         → updates quantity
 *  - DELETE /api/inventory/{id}      → delete a inventory item
 */

public class InventoryController implements Controller {

  private static final String API_INVENTORY = "/api/inventory";
  private static final String API_INVENTORY_BY_ID = "/api/inventory/{id}";

  // itemKey must be lowercase and underscore-separated (e.g., "water_bottle")
  public static final String ITEMKEY_REGEX = "^[a-z_]+$";

  private final JacksonMongoCollection<Inventory> inventoryCollection;

  public InventoryController(MongoDatabase database) {
    inventoryCollection = JacksonMongoCollection.builder().build(
      database,
      "inventory",
      Inventory.class,
      UuidRepresentation.STANDARD);
  }

  // GET /api/inventory
  // Returns all inventory items sorted alphabetically by itemName.
  public void getAllInventory(Context ctx) {
    ArrayList<Inventory> inventory = inventoryCollection
      .find()
      .sort(Sorts.ascending("itemName"))
      .into(new ArrayList<>());

    ctx.json(inventory);
    ctx.status(HttpStatus.OK);
  }

  /**
   * GET /api/inventory/{id}
   * Retrieves a single inventory item by MongoDB ObjectId.
   *
   * Includes error handling for:
   *  - invalid ObjectId format
   *  - non-existent inventory item
   */
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

  /**
   * POST /api/inventory
   * Adds a new inventory item.
   *
   * Validation ensures:
   *  - quantityAvailable is non-negative
   *  - itemKey is present and follows naming rules
   *  - itemName is present
   *
   * Iteration 1 does NOT check whether itemKey exists in Supply.
   * This is intentional to keep Inventory loosely coupled and easy to extend.
   */
  public void addInventory(Context ctx) {
    //String body = ctx.body();
    Inventory newItem = ctx.bodyValidator(Inventory.class)
      .check(inventory -> inventory.quantityAvailable >= 0,
        "Quantity must be >= 0")
      .check(inventory -> inventory.itemKey != null && inventory.itemKey.length() > 0,
        "Inventory must have a non-empty item key")
      .check(inventory -> inventory.itemKey.matches(ITEMKEY_REGEX),
        "Inventory Item Key must be lowercase with no spaces")
      .check(inventory -> inventory.itemName != null && inventory.itemName.length() > 0,
        "Inventory must have a non-empty item name")
      .get();

    inventoryCollection.insertOne(newItem);

    ctx.json(Map.of("id", newItem._id));
    ctx.status(HttpStatus.CREATED);
  }


  //PUT /api/inventory/{id}
  // Updates ONLY the quantityAvailable field.
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

  // DELETE /api/inventory/{id}
  // Removes an inventory item.
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

  // Registers all Inventory API routes.
  @Override
  public void addRoutes(Javalin server) {
    server.get(API_INVENTORY, this::getAllInventory);
    server.post(API_INVENTORY, this::addInventory);
    server.get(API_INVENTORY_BY_ID, this::getInventoryById);
    server.put(API_INVENTORY_BY_ID, this::updateInventoryQuantity);
    server.delete(API_INVENTORY_BY_ID, this::deleteInventory);
  }
}
