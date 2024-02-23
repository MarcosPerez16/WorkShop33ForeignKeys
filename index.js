const pg = require("pg");
const express = require("express");
const app = express();
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_hr_database"
);

//parse body into JS objects
app.use(express.json());

//log the requests as they come in
app.use(require("morgan")("dev"));

//Routes

const init = async () => {
  try {
    await client.connect();
    console.log("Connected to database");

    //drop tables if they exist
    await client.query("DROP TABLE IF EXISTS employees CASCADE");
    await client.query("DROP TABLE IF EXISTS departments CASCADE");

    //create departments table
    let SQL = `
        CREATE TABLE departments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        );
    `;
    await client.query(SQL);

    //create employees table with FK reference to departments
    SQL = `
            CREATE TABLE employees (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE
            );
            `;
    await client.query(SQL);

    console.log("Tables created");

    //Seed tables with data

    SQL = `
        INSERT INTO departments (name) VALUES
            ('HR'), ('Finance'), ('IT');
    
    `;
    await client.query(SQL);

    SQL = `
        INSERT INTO employees (name, department_id) VALUES
            ('John Doe', 1),
            ('Jane Smith', 2),
            ('Bob Johnson', 3);
        `;
    await client.query(SQL);

    console.log("Data seeded");

    //start the server after initializing the database
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

//Initialize database
init();
