// dependencies
const mysql = require("mysql2");
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const connection = require("./src/db/config/dbConnection");

//---------------------------------VIEW FUNCTIONS---------------------------------

// view all employees
const viewAllEmployees = () => {
    const query = `
    SELECT e.id, e.first_name, e.last_name, job.title, department.department_name AS department, salary, IFNULL(concat(m.first_name, ' ', m.last_name), 'N/A') AS manager
    FROM employee e
    LEFT JOIN employee m
    ON m.id = e.manager_id
    JOIN job
    ON e.job_id = job.id
    JOIN department
    ON job.department_id = department.id;`

    connection.query(query, (error, results) => {
        if (error) throw error;

        console.log('\n');
        console.table(results);
        console.log('\n');

        promptUser();
    });
};

// view all departments
const viewAllDepartments = () => {
    const query = `
    SELECT department.id AS "Department ID", department.department_name AS Department 
    FROM employees_db.department`;

    connection.query(query, (error, results) => {
        if (error) throw error;

        console.log('\n');
        console.table(results);
        console.log('\n');

        promptUser();
    });
};
  
// view all roles
const viewAllRoles = () => {
    const query = `
    SELECT job.id AS "Role ID", job.title AS Role, job.salary AS Salary, job.department_id AS "Department ID" 
    FROM employees_db.job`;

    connection.query(query, (error, results) => {
        if (error) throw error;

        console.log('\n');
        console.table(results);
        console.log('\n');

        promptUser();
    });
};
  
//---------------------------------ADD FUNCTIONS---------------------------------

// add employee
const addEmployee = async () => {

    connection.query(`SELECT * FROM job`, async (error, jobs) => {
        if (error) throw error;

        connection.query(`SELECT * FROM employee WHERE manager_id IS NULL`, async (error, managers) => {
            if (error) throw error;

            managers = managers.map(manager => ({name:manager.first_name + " " + manager.last_name, value: manager.id}));
            managers.push({name:"N/A"});

            const questions = await inquirer
                .prompt([
                    {
                        type: "input",
                        name: "first_name",
                        message: "What is the employee's first name?"
                    },
                    {
                        type: "input",
                        name: "last_name",
                        message: "What is the employee's last name?"
                    },
                    {
                        type: "list",
                        name: "role_id",
                        message: "What is the employee's role?",
                        choices: jobs.map(job => ({name:job.title, value: job.id}))
                    },
                    {
                        type: "list",
                        name: "manager_id",
                        message: "Who is the employee's manager?",
                        choices: managers
                    }
                ]);

                if (questions.manager_id === "N/A") {
                    questions.manager_id = null;
                };

                connection.query(
                    `INSERT INTO employee SET ?`,
                    {
                        first_name: questions.first_name,
                        last_name: questions.last_name,
                        job_id: questions.job_id,
                        manager_id: questions.manager_id
                    },

                    (error) => {
                        if (error) throw error;

                        console.log('\n');
                        console.log("Employee added successfully!");
                        console.log('\n');

                        promptUser();
                    });
        });
    });
};

// add department
const addDepartment = async () => {
    
    const questions = await inquirer
    .prompt([
        {
            type: "input",
            name: "newDepartment",
            message: "What is the new department?"
        }
    ]);

    connection.query(
        `INSERT INTO employees_db.department SET ?`,
        {
            name: questions.newDepartment
        },

        (error) => {
            if (error) throw error;

            console.log('\n');
            console.log("Department added successfully!");
            console.log('\n');

            promptUser();
        });
};

// fetch departments for addRole function
const getDepartments = () => {

    return new Promise((resolve, reject) => {

        const query = `SELECT * FROM employees_db.department`;

        connection.query(query, (error, results) => {
            if (error) reject(error);

            resolve(results);
        });
    });
};

// add role
const addRole = async () => {
    //wait for getDepartments to finish
    const departments = await getDepartments();

    const questions = await inquirer
    .prompt([
        {
            type: "input",
            name: "newRole",
            message: "What is the new role?"
        },
        {
            type: "input",
            name: "newSalary",
            message: "What is the new role's salary?"
        },
        {
            type: "list",
            name: "newDepartment",
            message: "What is the new role's department?",
            choices: departments.map(department => department.name),
        }
    ]);

    departments.forEach(department => {
        if (department.name === questions.newDepartment) {
            questions.newDepartment = department.id;
        }
    });

    connection.query(
        `INSERT INTO employees_db.job SET ?`,
        {
            title: questions.newRole,
            salary: questions.newSalary,
            department_id: questions.newDepartment
        },

        (error) => {
            if (error) throw error;

            console.log('\n');
            console.log("Role added successfully!");
            console.log('\n');

            promptUser();
        });
};

//---------------------------------UPDATE FUNCTIONS---------------------------------

// update employee role

const updateEmployeeRole = async () => {

    connection.query(`SELECT * FROM employee`, async (error, employees) => {
        if (error) throw error;

        const selectedEmployee = await inquirer
        .prompt([
            {
                type: "list",
                name: "employee_id",
                message: "Which employee's role would you like to update?",
                choices: employees.map(employee => ({name:employee.first_name + " " + employee.last_name, value: employee.id}))
            }
        ]);

        connection.query(`SELECT * FROM job`, async (error, jobs) => {
            if (error) throw error;

            const selectedRole = await inquirer
            .prompt([
                {
                    type: "list",
                    name: "job_id",
                    message: "What is the employee's new role?",
                    choices: jobs.map(job => ({name:job.title, value: job.id}))
                }
            ]);

            connection.query(
                `UPDATE employees_db.employee SET ? WHERE ?`,
                [
                    {
                        job_id: selectedRole.job_id
                    },
                    {
                        id: selectedEmployee.employee_id
                    }
                ],

                (error) => {
                    if (error) throw error;

                    console.log('\n');
                    console.log("Employee role updated successfully!");
                    console.log('\n');

                    promptUser();
                });
        });
    });
};


                


  
//---------------------------------START---------------------------------
  
  const promptUser = () => {
    inquirer
      .prompt([
        {
          type: "list",
          message: "What would you like to do? ",
          choices: [
            "View all employees",
            "View all departments",
            "View all roles",
            "Add employee",
            "Add department",
            "Add role",
            "Update employee role",
            "Exit",
          ],
          name: "choice",
        },
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
          case "Exit":
            connection.end();
            break;
          default:
            throw new Error("invalid initial user choice");
        }
      });
  };
  
  connection.connect((error) => {
    if (error) throw error;

    console.log('\n');
    console.log("Connected to database");
    console.log('\n');

    promptUser();
});