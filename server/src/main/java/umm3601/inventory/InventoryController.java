package umm3601.inventory;

import java.util.ArrayList;

import org.bson.UuidRepresentation;
import org.mongojack.JacksonMongoCollection;

import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import umm3601.Controller;

public class InventoryController implements Controller {

  private static final String API_INVENTORY = "/api/inventory";
  private static final String API_INVENTORY_BY_ID = "/api/inventory/{id}";

  private final JacksonMongoCollection<Inventory> inventoryCollection;

  public InventoryController(MongoDatabase database) {
    inventoryCollection = JacksonMongoCollection.builder().build(
      database,
      "inventory",
      Inventory.class,
      UuidRepresentation.STANDARD);
  }

  // GET all inventory
  public void getInventory(Context ctx) {
    ArrayList<Inventory> inventory = inventoryCollection
      .find()
      .into(new ArrayList<>());

    ctx.json(inventory);
    ctx.status(HttpStatus.OK);
  }

  // GET inventory by ID
  public void getInventoryById(Context ctx) {
    String id = ctx.pathParam("id");
    Inventory item = inventoryCollection.findOneById(id);

    if (item == null) {
      throw new NotFoundResponse("Inventory item not found");
    }
    ctx.json(item);
    ctx.status(HttpStatus.OK);
  }

  // POST new inventory item
  public void addInventory(Context ctx) {
    Inventory newItem = ctx.bodyValidator(Inventory.class)
      .check(i -> i.quantityAvailable >= 0, "Quantity must be >= 0")
      .get();

    inventoryCollection.insertOne(newItem);
    ctx.status(HttpStatus.CREATED);
  }

  // PUT update quantity
  public void updateInventoryQuantity(Context ctx) {
    String id = ctx.pathParam("id");
    QuantityUpdate update = ctx.bodyValidator(QuantityUpdate.class)
      .check(quantity -> quantity.quantityAvailable >= 0, "Quantity must be >= 0")
      .get();
    Inventory existing = inventoryCollection.findOneById(id);

    if (existing == null) {
      throw new NotFoundResponse("Inventory item not found");
    }

    existing.quantityAvailable = update.quantityAvailable;
    inventoryCollection.replaceOneById(id, existing);
    ctx.status(HttpStatus.OK);
  }

  // DELETE inventory item
  public void deleteInventory(Context ctx) {
    String id = ctx.pathParam("id");
    var deleteResult = inventoryCollection.removeById(id);

    if (deleteResult.getDeletedCount() != 1) {
      throw new NotFoundResponse(
        "Was unable to delete ID "
          + id
          + "; perhaps illegal ID or an ID for an item not in the system?");
    }
    ctx.status(HttpStatus.OK);
  }

  @Override
  public void addRoutes(Javalin server) {
    server.get(API_INVENTORY, this::getInventory);
    server.post(API_INVENTORY, this::addInventory);
    server.get(API_INVENTORY_BY_ID, this::getInventoryById);
    server.put(API_INVENTORY_BY_ID, this::updateInventoryQuantity);
    server.delete(API_INVENTORY_BY_ID, this::deleteInventory);
  }
}
