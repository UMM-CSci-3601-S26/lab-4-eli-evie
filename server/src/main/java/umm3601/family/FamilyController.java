package umm3601.family;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.bson.UuidRepresentation;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;
import io.javalin.http.HttpStatus;
import io.javalin.Javalin;
import io.javalin.http.Context;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.NotFoundResponse;

import static com.mongodb.client.model.Filters.eq;

import umm3601.Controller;

public class FamilyController implements Controller {
  private static final String API_FAMILY = "/api/family";
  private static final String API_DASHBOARD = "/api/dashboard";
  private static final String API_FAMILY_BY_ID = "/api/family/{id}";

  public static final String EMAIL_REGEX = "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$";

  private final JacksonMongoCollection<Family> familyCollection;

  public FamilyController(MongoDatabase database) {
    familyCollection = JacksonMongoCollection.builder().build(
        database,
        "family",
        Family.class,
        UuidRepresentation.STANDARD);
  }

  public void getFamily(Context ctx) {
    String id = ctx.pathParam("id");
    Family family;

    try {
      family = familyCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested family id wasn't a legal Mongo Object ID.");
    }
    if (family == null) {
      throw new NotFoundResponse("The requested family was not found");
    } else {
      ctx.json(family);
      ctx.status(HttpStatus.OK);
    }
  }

  public void getFamilies(Context ctx) {
    ArrayList<Family> matchingFamilies = familyCollection
      .find()
      .into(new ArrayList<>());

    ctx.json(matchingFamilies);
    ctx.status(HttpStatus.OK);
  }

  public void addNewFamily(Context ctx) {

    String body = ctx.body();
    Family newFamily = ctx.bodyValidator(Family.class)
      .check(fam -> fam.email.matches(EMAIL_REGEX),
        "Family must have a valid email; body was " + body)
      // .check(fam -> fam.students,
      //   "Family must have a legal family role; body was " + body)
      .get();
    familyCollection.insertOne(newFamily);
    ctx.json(Map.of("id", newFamily._id));
    ctx.status(HttpStatus.CREATED);
  }

  public void deleteFamily(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = familyCollection.deleteOne(eq("_id", new ObjectId(id)));
    if (deleteResult.getDeletedCount() != 1) {
      ctx.status(HttpStatus.NOT_FOUND);
      throw new NotFoundResponse(
        "Was unable to delete Family ID"
          + id
          + "; perhaps illegal Family ID or an ID for an item not in the system?");
    }
    ctx.status(HttpStatus.OK);
  }

  public void getDashboardStats (Context ctx){
    ArrayList<Family> families = familyCollection
      .find()
      .into(new ArrayList<>());

    Map<String, Integer> studentsPerSchool = new HashMap<>();
    Map<String, Integer> studentsPerGrade = new HashMap<>();

    for (Family family : families){
      for (Family.StudentInfo student : family.students){
        //count per school
        studentsPerSchool.merge(student.school, 1, Integer::sum);

        //count per grade
        studentsPerGrade.merge(student.grade, 1, Integer::sum);
      }
    }
    Map<String, Object> result = new HashMap<>();
    result.put("studentsPerSchool", studentsPerSchool);
    result.put("studentsPerGrade", studentsPerGrade);
    result.put("totalFamilies", families.size());

    ctx.json(result);
  }

  @Override
  public void addRoutes(Javalin server) {
    server.get(API_FAMILY, this::getFamilies);
    server.get(API_FAMILY_BY_ID, this::getFamily);
    server.get(API_DASHBOARD, this::getDashboardStats);
    server.post(API_FAMILY, this::addNewFamily);
    server.delete(API_FAMILY_BY_ID, this::deleteFamily);
  }
}
