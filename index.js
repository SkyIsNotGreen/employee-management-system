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