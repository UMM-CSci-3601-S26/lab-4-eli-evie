package umm3601;

import io.javalin.Javalin;

public interface Controller {
  void addRoutes(Javalin server);
}
