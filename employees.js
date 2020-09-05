const mysql = require("mysql");
const cTable = require("console.table");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "employees_db"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  mainMenu();
});

function mainMenu() {
  console.log("---------------------------------------");
  console.log("Employee Manager - Main Menu");
  console.log("---------------------------------------");
  console.log(" ");
  inquirer.prompt([{
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: ["View All Employees",
              "View Employees by Department",
              "View Employees by Role",
              "Add Employee", 
              "Remove Employee",
              "Update Employee", 
              "Add Role",  
              "Add Department",
              "Quit"]
  }]).then(function(response) {
    if (response.action === "View All Employees") { viewAllEmployees(); }
    if (response.action === "View Employees by Department") { viewDepartment(); }
    if (response.action === "View Employees by Role") { viewRole(); }
    if (response.action === "Add Employee") { addEmployee(); }
    if (response.action === "Remove Employee") {
      console.log(" ");
      console.log("Deleting an employee...");
      selectEmployee("delete");
    }
    if (response.action === "Update Employee") {
      console.log(" ");
      console.log("Updating employee...");
      selectEmployee("update");
    }
    if (response.action === "Add Role") { addRole(); }
    if (response.action === "Add Department") { addDepartment(); }
    if (response.action === "Quit") { quitPrompt(); }
  })
}

function viewAllEmployees() {
  connection.query("SELECT employees.id, employees.first_name, employees.last_name, employees.role_id, employees.manager_id, roles.title, roles.salary, roles.department_id, departments.name FROM `employees` INNER JOIN roles ON (employees.role_id = roles.id) INNER JOIN departments ON (roles.department_id = departments.id) ORDER BY department_id, role_id, id", function (err, data) {
    if (err) throw err;
    renderTable(data);
    mainMenu();
  })
}

function renderTable(data) {
  let values = [];
  for (x in data) {
    let value = [];

    value.push(data[x].id);
    value.push(data[x].first_name + ' ' + data[x].last_name);
    value.push(data[x].title);
    value.push(data[x].salary);
    value.push(data[x].name);
    if (!data[x].manager_id) {
      value.push(" ");
      values.push(value);
    }
    else {
      value.push(data[x].manager_id);
      values.push(value);
    } 
  }
  console.log(" ");
  console.log("Employee Query Results");
  console.log(" ");
  console.table(['ID', 'Name', 'Role', 'Salary ($ yearly)', 'Department', 'Manager'], values);
}

function viewDepartment() {
  connection.query("SELECT * FROM departments", function (err, data) {
    if (err) throw (err);
    let choiceQuery = [];
    let IDs = [];
    for (x in data) {
      let value = data[x].name;
      let id = data[x].id;
      choiceQuery.push(value);
      IDs.push(id);
    }
    
    inquirer.prompt([
      {
        type: "list",
        name: "department",
        message: "Which department would you like to view?",
        choices: choiceQuery
      }
    ]).then(function(response) {
      let deptID;
    
      for (x in IDs) { if (response.department === choiceQuery[x]) { deptID = IDs[x] } }

      connection.query("SELECT employees.id, employees.first_name, employees.last_name, employees.role_id, employees.manager_id, roles.title, roles.salary, roles.department_id, departments.name FROM `employees` INNER JOIN roles ON (employees.role_id = roles.id) INNER JOIN departments ON (roles.department_id = departments.id) WHERE department_id = " + deptID + " ORDER BY id", function(err, data) {
        if (err) throw (err);
        renderTable(data);
        mainMenu();
      })
    })
  })
}

function viewRole() {
  connection.query("SELECT * FROM roles ORDER BY department_id, id", function (err, data) {
    if (err) throw (err);
    let choiceQuery = [];
    let IDs = [];
    for (x in data) {
      let value = data[x].title;
      let id = data[x].id;
      choiceQuery.push(value);
      IDs.push(id);
    }
    
    inquirer.prompt([
      {
        type: "list",
        name: "role",
        message: "Which role would you like to view?",
        choices: choiceQuery
      }
    ]).then(function(response) {
      let roleID;
    
      for (x in IDs) { if (response.role === choiceQuery[x]) { roleID = IDs[x] } }

      connection.query("SELECT employees.id, employees.first_name, employees.last_name, employees.role_id, employees.manager_id, roles.title, roles.salary, roles.department_id, departments.name FROM `employees` INNER JOIN roles ON (employees.role_id = roles.id) INNER JOIN departments ON (roles.department_id = departments.id) WHERE role_id = " + roleID + " ORDER BY id", function(err, data) {
        if (err) throw (err);
        renderTable(data);
        mainMenu();
      })
    })
  })
}

function addEmployee() {
  console.log(" ");
  console.log("Creating a new employee...");

  connection.query("SELECT * FROM roles ORDER BY department_id, id", function (err, data) {
    if (err) throw (err);
    let choiceQuery = [];
    let IDs = [];
    for (x in data) {
      let value = data[x].title;
      let id = data[x].id;
      choiceQuery.push(value);
      IDs.push(id);
    }

    inquirer.prompt([
      {
        type: "input",
        name: "fname",
        message: "What is the new employee's first name?",
      },
      {
        type: "input",
        name: "lname",
        message: "What is the new employee's last name?"
      },
      {
        type: "list",
        name: "role",
        message: "What is the new employee's role?",
        choices: choiceQuery
      }
    ]).then(function(response) {
      let roleID;
      
      for (x in IDs) { if (response.role === choiceQuery[x]) { roleID = IDs[x] } }

      connection.query("INSERT INTO employees SET ?",
      {
        first_name: response.fname,
        last_name: response.lname,
        role_id: roleID
      },
      function(err, res) {
        if (err) throw err;
        console.log(" ");
        console.log("New employee added successfully!");
        mainMenu();
      });
    })
  })
}

function selectEmployee(action) {
  connection.query("SELECT * FROM employees ORDER BY role_id, id", function (err, data) {
    if (err) throw (err);
    let choiceQuery = [];
    let IDs = [];
    for (x in data) {
      let value = data[x].first_name + " " + data[x].last_name;
      let ID = data[x].id;
      choiceQuery.push(value);
      IDs.push(ID);
    }

    inquirer.prompt([
      {
        type: "list",
        name: "employee",
        message: "Which employee?",
        choices: choiceQuery
      }
    ]).then(function(response) {
      let employeeID;

      for (x in IDs) {
        if (response.employee === choiceQuery[x]) { employeeID = IDs[x] }
      }

      if (action === "delete") { rmEmployee(employeeID); }
      if (action === "update") { updateEmployee(employeeID); }
      if (action === "newManager") { updateManager(employeeID) }
    })
  })
}

function rmEmployee(employeeID) {
  connection.query("DELETE FROM employees WHERE id = " + employeeID, function(err, data) {
    if (err) throw (err);
    console.log(" ");
    console.log("Employee deleted successfully.")
    mainMenu();
  })
}

function updateEmployee(employeeID) {
  connection.query("SELECT * FROM employees WHERE id = " + employeeID + " ORDER BY role_id, id", function(err, data) {
    let empName = data[0].first_name + " " + data[0].last_name;
    let empID = data[0].id;

    console.log(" ");
    console.log("Updating " + empName + "...");
    inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do with " + empName,
        choices: ["Change their role",
                  "Add a Manager",
                  "Cancel"]
      }
    ]).then(function(response) {
      if (response.action === "Change their role") { changeRole(empName, empID )}
      if (response.action === "Add a Manager") { updateManager(empName, empID) }
      if (response.action === "Cancel") { mainMenu() }
    })
  })
}

function changeRole(name, ID) {
  connection.query("SELECT * FROM roles ORDER BY department_id, id", function (err, data) {
    if (err) throw (err);
    let choiceQuery = [];
    let IDs = [];
    for (x in data) {
      let value = data[x].title;
      let id = data[x].id;
      choiceQuery.push(value);
      IDs.push(id);
    }

    inquirer.prompt([
      {
        type: "list",
        name: "newrole",
        message: "Change " + name + "'s role to: ",
        choices: choiceQuery
      }
    ]).then(function(response) {
      let newroleID;
      
      for (x in IDs) {
        if (response.newrole === choiceQuery[x]) {
          newroleID = IDs[x]
        }
      }

      connection.query("UPDATE employees SET ? WHERE ?", 
      [
        {
          role_id: newroleID
        },
        {
          id: ID
        }
      ], function(err, res) {
        if (err) throw (err);
        console.log(" ");
        console.log(name + "'s role was successfully updated to " + response.newrole);
        mainMenu()
      })
    })
  })
}

function updateManager(name, ID) {
  
  connection.query("SELECT * FROM employees ORDER BY role_id, id", function (err, data) {
    if (err) throw (err);
    let choiceQuery = [];
    let IDs = [];
    for (x in data) {
      let value = data[x].first_name + " " + data[x].last_name;
      let ID = data[x].id;
      choiceQuery.push(value);
      IDs.push(ID);
    }

    inquirer.prompt([
      {
        type: "list",
        name: "manager",
        message: "Which employee will be " + name + "'s new manager?",
        choices: choiceQuery
      }
    ]).then(function(response) {
      let managerID;

      for (x in IDs) {
        if (response.manager === choiceQuery[x]) { managerID = IDs[x] }
      }

      connection.query("SELECT * FROM employees WHERE ?", 
      [
        {
          id: managerID
        }
      ], function (err, res) {
          if (err) throw (err);
          connection.query("UPDATE employees SET ? WHERE ?", [
            {
              manager_id: managerID
            },
            {
              id: ID
            }
          ], function(err, res) {
            if (err) throw (err);
            console.log(" ");
            console.log(response.manager + " is now " + name + "'s manager!");
            mainMenu();
          })
        })
      }
  )})
}

function addRole() {
  console.log(" ");
  console.log("Creating a new role...");
  
  connection.query("SELECT * FROM departments", function (err, data) {
    if (err) throw (err);
    let choiceQuery = [];
    let IDs = [];
    for (x in data) {
      let value = data[x].name;
      let id = data[x].id;
      choiceQuery.push(value);
      IDs.push(id);
    }

    inquirer.prompt([
      {
        type: "list",
        name: "department",
        message: "To which department will this new role belong?",
        choices: choiceQuery
      },
      {
        type: "input",
        name: "title",
        message: "What is this role's title?"
      },
      {
        type: "input",
        name: "salary",
        message: "What is this role's expected/average yearly salary?"
      }
    ]).then(function(response) {
      let deptID;
      
      for (x in IDs) {
        if (response.department === choiceQuery[x]) {
          deptID = IDs[x]
        }
      }

      let salaryRaw = (response.salary).trim();
      salaryRaw = salaryRaw.replace("$", "");
      salaryRaw = salaryRaw.replace(",", "");
      salaryRaw = salaryRaw.replace(" ", "");

      connection.query("INSERT INTO roles SET ?",
      {
        title: response.title,
        salary: salaryRaw,
        department_id: deptID
      },
      function(err, res) {
        if (err) throw err;
        console.log(" ");
        console.log(response.title + " created successfully!");
        mainMenu();
      });
    })
  })
}

function addDepartment() {
  console.log("Creating a new department...");
  inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "What will you call the new department?"
    }
  ]).then(function (response){
    connection.query("INSERT INTO departments SET ?",
    {
      name: response.name
    },
    function(err, res) {
      if (err) throw err;
      console.log(" ");
      console.log(response.name + " created successfully!");
      mainMenu();
    });
  })
}

function quitPrompt() {
  console.log(" ");
  console.log("Have a great day! (Press CTRL+C to exit)");
  return;
}