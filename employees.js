const mysql = require("mysql");
const cTable = require('console.table');

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
  
  afterConnection();
});

function afterConnection() {
  connection.query("SELECT * FROM employees;", function (err, data) {
    if (err) throw err;
    let values = [];
    for (x in data) {
      let value = [];
      value.push(data[x].first_name + ' ' + data[x].last_name);
      value.push(data[x].role_id);
      value.push(data[x].manager_id);
      values.push(value);
    }
    console.table(['Name', 'Role', 'Manager'], values);
  })
}