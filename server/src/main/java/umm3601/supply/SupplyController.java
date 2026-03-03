package umm3601.supply;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.bson.Document;
import org.bson.UuidRepresentation;
import org.mongojack.JacksonMongoCollection;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;

import umm3601.Controller;

/* FamilyController Contains the Following:
- getSupplies()
- getSupply() /By ID/
*/

/* Notes:
I'd like to add more functions to add and such,
but its not our focus at the moment
*/

public class SupplyController implements Controller {
  private static final String API_SUPPLIES = "/api/supplies";
  private static final String API_SUPPLY_BY_ID = "/api/supplies/{id}";

  static final String SCHOOL_KEY = "school";
  static final String GRADE_KEY = "grade";
  static final String YEAR_KEY = "year";
  static final String ITEM_KEY = "itemName";

  private final JacksonMongoCollection<Supply> supplyCollection;

  public SupplyController(MongoDatabase database) {
    supplyCollection = JacksonMongoCollection.builder().build(
      database,
      "supplies",
      Supply.class,
      UuidRepresentation.STANDARD);
  }

  // GET all supplies with itemKey, school, grade, and year filters
  // /api/supplies?school=X&grade=Y&year=Z
  public void getSupplies(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);

    ArrayList<Supply> matchingSupplies = supplyCollection
      .find(combinedFilter)
      .sort(Sorts.ascending("itemName"))
      .into(new ArrayList<>());

    ctx.json(matchingSupplies);
    ctx.status(HttpStatus.OK);
  }

  // GET supply by ID
  public void getSupply(Context ctx) {
    String id = ctx.pathParam("id");
    Supply supply;

    try {
      supply = supplyCollection
        .find(eq("_id", new ObjectId(id)))
        .first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested supply id wasn't a legal Mongo Object ID.");
    }
    if (supply == null) {
      throw new NotFoundResponse("The requested supply was not found");
    } else {
      ctx.json(supply);
      ctx.status(HttpStatus.OK);
    }
  }

  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>();

    if (ctx.queryParamMap().containsKey(SCHOOL_KEY)) {
      filters.add(eq(SCHOOL_KEY, ctx.queryParam(SCHOOL_KEY)));
    }
    if (ctx.queryParamMap().containsKey(GRADE_KEY)) {
      filters.add(eq(GRADE_KEY, ctx.queryParam(GRADE_KEY)));
    }
    if (ctx.queryParamMap().containsKey(ITEM_KEY)) {
      Pattern pattern = Pattern.compile(
        Pattern.quote(ctx.queryParam(ITEM_KEY)),
        Pattern.CASE_INSENSITIVE);
      filters.add(regex(ITEM_KEY, pattern));
    }
    if (ctx.queryParamMap().containsKey(YEAR_KEY)) {
      filters.add(eq(YEAR_KEY, ctx.queryParam(YEAR_KEY)));
    }

    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);
    return combinedFilter;
  }

  @Override
  public void addRoutes(Javalin server) {
    server.get(API_SUPPLY_BY_ID, this::getSupply);
    server.get(API_SUPPLIES, this::getSupplies);
  }
}
