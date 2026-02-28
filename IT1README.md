# Notes on Iteration 1

Here is an overview of our iteration 1 code. We will tell you how and why it is setup up the way it is.

## Family Model

### Family Purpose

The `Family` model represents households registering for school supplies.  
Each family may register multiple students, and each student may request multiple supplies.

This structure allows us to:

- Track guardian contact information
- Associate multiple students with one guardian
- Track supply requests per student
- Generate dashboard statistics by school and grade

---

### Family Data Structure

#### Family Java

```java
public class Family {
  @ObjectId @Id
  public String _id;

  public String guardianName;
  public String email;
  public String address;
  public String timeSlot;

  public List<StudentInfo> students;

  public static class StudentInfo {
    public String name;
    public String grade;
    public String school;
    public List<String> requestedSupplies;
  }
}
```

#### Family JSON/Database

```json
{
  "_id": "238829384928374",
  "guardianName": "Jane Doe",
  "email": "jane@email.com"
  "address": "123 Street",
  "timeSlot": "9:00-10:00",
  "students": [
    {
      "name": "Tim",
      "grade": "3",
      "school": "MAHS",
      "requestedSupplies": ["Headphones"]
    },
    {
      "name": "Sara",
      "grade": "5",
      "school": "MAHS",
      "requestedSupplies": ["Backpack"]
    }
  ]
}
```

---

### Why We Structured It This Way

#### Families as a Top-Level Document

We modeled each **family** as a single Mongo document rathers than storing students separately.

**Reasoning:**

- Families register together.
- Time slot selection applies to the entire household.
- Contact information belongs to the guardian/parent, not each student.
- It simplifies retrieval when viewing or editing a registration.

This avoids needing joins or multiple queries.

---

#### Nested `StudentInfo` Class

Students are embedded inside the Family document.

**Why embedded instead of separate collection?**

- Students are tightly coupled to a single family.
- Students do not exits independently in this system.
- We never query students globally without first refernceing families.
- Embedding reduces database complexity and keeps reads efficient.

---

#### `requestedSupplies` as a List of Strinsg

```java
public List<String> requestedSupplies;
```

We chose a simple list of strings instead of embedding full supply objects.

**Reasoning:**

- Iteration 1 focuses on request tracking, not inventory linking.
- Supply definitions already exist in the `Supply` collection.
- This keeps Family documents lightweight.
- It avoids data duplication of full supply metadata.

Future iterations could link by `itemKey` if stronger relational integrity is needed.

---

#### Why Grade and School Are Stored Per Student

```java
public String grade;
public String school;
```

We store these on each student rather than on Family.

**Reasoning:**

- A family may have students in different grades.
- A family may have students in different schools.
- The dashboard requires grouping by school and grade.
  
Storing this at the student level enables:

- Student count per school
- Student count per grade
- Student count per school + grade
  
without complex transformations.

---

### Dashboard Support

This structure directly supports dashboard aggregation.

```java
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
```

Example logic:

- Loop through `families`
- Loop thourgh `students` inside each family
- Group counts by:
  - `student.school`
  - `student.grade`

Because students are embedded, we can perform process of computing summary statistics after a single query.

---

### Tradeoffs Considered

#### Alternative 1: Separate `Student` Collection

Rejected because:

- Would require joins or multiple queries
- Increase complexity for minimal benefit
- Students are not independent entities in this system

#### Alternative 2: Store Supplies as Embedded Objects

Rejected because:

- Supply metadata is already defined elsewhere
- Would duplicate information
- Makes inventory updates more complex

---

### Family API Overview

| Method | Route | Purpose |
| -------- | -------- | ---------- |
| GET | `/api/families` | Retrieve all registered families |
| GET | `/api/families/{id}` | Retrieve a specific family by ID |
| POST | `/api/families` | Register a new family |
| DELETE | `/api/families/{id}` | Remove a family registration |

---

## Inventory Model

### Inventory Purpose

The `Inventory` model represents the actual stock available for each supply item.
While `Supply` defines what is required per school/grade, `Inventory` tracks what is physically available.

This separation allows us to:

- Track stock levels independently of school requirements.
- Update quantities without modifying supply definitions.
- Support future inventory adjustment workflows.

---

## Inventory Data Structure

### Inventory Java

```java
public class Inventory {
  public String _id;

  public String itemKey;
  public String itemName;

  public int quantityAvailable;
}
```

### Inventory JSON/Database

```json
{
  "_id": "ll29dk38slq5",
  "itemKey": "water_bottle",
  "itemName": "Water Bottle",
  "quantityAvailable": 1
}
```

---

### Why We Structured It This Way

#### Inventory Is Separate from Supply

We intentionally separated Inventory from Supply.

**Supply = Requirement definition**
**Inventory = Physical stock**

This prevents:

- Changing required quantities when stock changes
- Duplicating school/grade data in inventory records
- Mixing configuration data with operational data

This is a clean separation of concerns.

---

#### `itemKay` as a Stable Identifier

```java
public String itemKey;
```

The `itemKey` is used to logically link items to Supply items.

**Why not link by `_id`?**

- Supply requirements vary by school/grade/year.
- Inventory is global stock.
- The same `itemKey` may appear in multiple school supply list.

Using `itemKey` provides a stable, shared identifier across collections.

---

#### Only Tracking Quantity in PUT

```java
public void updateInventoryQuantity(Context ctx)
```

The PUT route only updates `quantityAvailable`.

We intentionally avoid full-object replacement via PUT because:

- The only field subject to change in normal operations is stock quantity.
- `itemKey` and `itemName` should not change frequently.

This design improves clarity.

---

### Inventory API Overview

| Method | Route                 | Purpose                            |
| ------ | --------------------- | ---------------------------------- |
| GET    | `/api/inventory`      | Retrieve all inventory items       |
| GET    | `/api/inventory/{id}` | Retrieve a specific inventory item |
| POST   | `/api/inventory`      | Add a new inventory item           |
| PUT    | `/api/inventory/{id}` | Update quantity only               |
| DELETE | `/api/inventory/{id}` | Remove inventory item              |

---

## Supply Model

### Supply Purpose

The `Supply` model defines required supplies per:

- School
- Grade
- Year

It represents the official supply list configuration, not physical inventory.

---

## Supply Data Stucture

### Supply Java

```java
public class Supply {
  public String school;
  public String grade;
  public String year;

  public String itemKey;
  public String itemName;

  public int quantityRequired;

  public String details;

  public boolean required;
}
```

### Supply JSON/Database

```json
{
  "school": "MAES",
  "grade": "5",
  "year": "2025-2026",
  "itemKey": "tissues",
  "itemName": "Kleenex",
  "quantityRequired": 2,
  "details": "Boxes",
  "required": true
}
```

---

### Why We Structured It This Way

#### School + Grade + Year as Configuration Dimensions

```java
public String school;
public String grade;
public String year;
```

Supply requirements vary across:

- Different schools
- Different grade levels
- Different academic years

Storing these directly on the document allows filtering without joins.

Example query:

```code
GET /api/supplies?school=MAHS&grade=5&year=2025
```

This returns exactly one grade's supply list.

---

#### `itemKey` for Cross-Collection Consistency

```java
public String itemKey;
```

`itemKey` ensures consistent identification across:

- Supply
- Inventory
- Family student request

This allows future features such as:

- Checking inventory against supply requirements
- Tracking shortages
- Generating fulfillment reports

---

#### `quantityRequired` vs `quantityAvailable`

We intentionally separate:

- `quantityRequired` (What students need)
- `quantityAvailable` (What we have)

This allows comparison logic in future iterations.

---

#### Flexible `details` Field

```java
public String details;
```

Schools often have strict supply classifiers:

- Folder color
- Plastic vs paper
- 3-prong vs pocket
- Brand requirements

Rather then hardcoding these as separate fields, we use a flexible `details` string.

This keeps the database blueprint simple while allowing detailed descriptions.

Future iterations could expand this into structured attributes if needed.

---

#### `required` Boolean

```java
public boolean required;
```

This is a field we created with the intent Ready4Learning can assign what supplies they wish to provide.

This field allows:

- Differentiating optional vs required items
- Display filtering
- Conditional reporting

---

### Supply API Overview

| Method | Route                | Purpose                                         |
| ------ | -------------------- | ----------------------------------------------- |
| GET    | `/api/supplies/{id}` | Retrieve a specific supply item                 |
| GET    | `/api/supplies`      | Retrieve supplies filtered by school/grade/year |

Supported Query Parameters:

- `school`
- `grade`
- `year`
- `itemName` (case-insensitive search)

---

## Design Philosophy

The overall system follows a separation-of-concerns model:

- **Family -> Who is requesting supplies**
- **Supply -> What is required**
- **Inventory -> What is available**

This structure:

- Minimizes duplication
- Keeps collections focused
- Supports dashboard aggregation
- Allows future expansion (inventory matching, fulfillment tracking, reporting)

It favors clarity, maintainability, and alignment with Read4Learning needs.

*Authored by: Katelyn Money*
