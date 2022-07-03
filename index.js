// dependencies
const mysql2 = require("mysql2");
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const connection = require("./src/db/config/dbConnection");


//connect to database
connection.connect((error) => {
    if (error) throw error;

    console.log("Connected to database");

    promptUser();
});

// ---VIEW FUNCTIONS---

//view all employees
const viewAllEmployees = () => {
    const query = `
    SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, salary, IFNULL(concat(m.first_name, ' ', m.last_name), 'N/A') AS manager
    FROM employee e
    LEFT JOIN employee m
    ON m.id = e.manager_id
    JOIN role
    ON e.role_id = role.id
    JOIN department
    ON role.department_id = department.id;`

    connection.query(query, (error, results) => {
        if (error) throw error;

        console.table(results);
        promptUser();
    });
};






//start of app
//prompt user for action
const promptUser = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "View all employees",
                "View all departments",
                "View all roles",
                "Add employee",
                "Add department",
                "Add role",
                "Update employee role",
                "Budget Used",
                "Quit",
            ]
        }
    ])
    .then((response) => {
        switch (response.choice) {
            case "View all employees":
              viewAllEmployees();
              break;
            case "View all departments":
              viewAllDepartments();
              break;
            case "View all roles":
              viewAllRoles();
              break;
            case "Add employee":
              addEmployee();
              break;
            case "Add department":
              addDepartment();
              break;
            case "Add role":
              addRole();
              break;
            case "Update employee role":
              updateEmployeeRole();
              break;
            case "Budget Used":
              usedBudget();
              break;
            case "Exit":
              connection.end();
              break;
            default:
              throw new Error("invalid initial user choice");
          }
        });
    };