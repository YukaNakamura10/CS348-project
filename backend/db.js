require('dotenv').config();
const fs = require('fs');
const oracledb = require('oracledb');

// Initialize and return a database connection
async function initDB() {
  const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
  });
  console.log('Database connected successfully.');
  return connection;
}

// Run setup (optional: creates tables and seeds data)
async function setupDatabase(connection) {
  try {

    // Drop only the foreign key constraints:

// You can then proceed to alter tables or add new constraints if necessary

await connection.execute(`
  begin
    -- Check if the Students table exists
    begin
      -- Try to select from the table to check if it exists
      execute immediate 'select 1 from Students where 1=0';
    exception
      -- If an error occurs (table does not exist), create the table
      when others then
        if sqlcode = -942 then  -- ORA-00942: table or view does not exist
          execute immediate 'CREATE TABLE Students (student_id NUMBER PRIMARY KEY, student_name VARCHAR2(100))';
        else
          raise;
        end if;
    end;
  end;
`);

await connection.execute(`
  begin
    -- Check if the Organizations table exists
    begin
      -- Try to select from the table to check if it exists
      execute immediate 'select 1 from Organizations where 1=0';
    exception
      -- If an error occurs (table does not exist), create the table
      when others then
        if sqlcode = -942 then  -- ORA-00942: table or view does not exist
          execute immediate 'CREATE TABLE Organizations (organization_id NUMBER PRIMARY KEY, organization_name VARCHAR2(100), organization_description VARCHAR2(255))';
        else
          raise;
        end if;
    end;
  end;
`);
// await connection.execute('DROP TABLE Events');
await connection.execute(`
 BEGIN
  -- Check if the Events table exists
  BEGIN
    -- Try to access the Events table
    EXECUTE IMMEDIATE 'SELECT 1 FROM Events WHERE ROWNUM = 1';
  EXCEPTION
    WHEN OTHERS THEN
      -- If the table does not exist, sqlcode = -942
      IF SQLCODE = -942 THEN
        -- Create the Events table
        EXECUTE IMMEDIATE '
          CREATE TABLE Events (
            event_id VARCHAR2(36),
            event_name VARCHAR2(100) NOT NULL,
            event_date DATE,
            event_location VARCHAR2(100),
            event_description VARCHAR2(255),
            organization_id NUMBER,
            participants_count NUMBER,
            FOREIGN KEY (organization_id) REFERENCES Organizations(organization_id)
          )';
      ELSE
        -- If the error is not about the table not existing, raise it
        RAISE;
      END IF;
  END;
  
END;
`);

await connection.execute(`
  BEGIN
    -- Declare a variable to hold the result of the query
    DECLARE
      dummy NUMBER;
    BEGIN
      -- Check if the index already exists
      SELECT 1 
      INTO dummy 
      FROM user_indexes 
      WHERE index_name = 'IDX_EVENT_ID';
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        -- Index does not exist; create it
        EXECUTE IMMEDIATE 'CREATE INDEX idx_event_id ON Events (event_id)';
    END;
  END;
  `);
  
  
 

// await connection.execute(`
//   BEGIN
//     -- Insert dummy data into the Events table
//     INSERT INTO Events (event_id, event_name, event_date, event_location, event_description, organization_id, participants_count) 
//     VALUES ('E1', 'Tech Expo 2024', TO_DATE('2024-12-10', 'YYYY-MM-DD'), 'Tech Center', 'A showcase of the latest tech innovations.', 1, 50);

//     INSERT INTO Events (event_id, event_name, event_date, event_location, event_description, organization_id, participants_count) 
//     VALUES ('E2', 'Health Summit 2024', TO_DATE('2024-12-15', 'YYYY-MM-DD'), 'Health Arena', 'Conference on healthcare advancements.', 2, 40);

//     INSERT INTO Events (event_id, event_name, event_date, event_location, event_description, organization_id, participants_count) 
//     VALUES ('E3', 'EduTech Conference', TO_DATE('2024-12-20', 'YYYY-MM-DD'), 'Education Hall', 'Discussion on emerging trends in EdTech.', 3, 30);

//     INSERT INTO Events (event_id, event_name, event_date, event_location, event_description, organization_id, participants_count) 
//     VALUES ('E4', 'Eco Summit', TO_DATE('2024-12-25', 'YYYY-MM-DD'), 'Green Pavilion', 'Event promoting environmental conservation.', 4, 25);

//     INSERT INTO Events (event_id, event_name, event_date, event_location, event_description, organization_id, participants_count) 
//     VALUES ('E5', 'Tech Hackathon', TO_DATE('2024-12-30', 'YYYY-MM-DD'), 'Tech Lab', 'Hackathon for innovative solutions.', 1, 60);

//     INSERT INTO Events (event_id, event_name, event_date, event_location, event_description, organization_id, participants_count) 
//     VALUES ('E6', 'Wellness Workshop', TO_DATE('2024-12-05', 'YYYY-MM-DD'), 'Health Center', 'Workshop on mental and physical health.', 2, 20);

//     COMMIT;
//   END;
// `);

await connection.execute(`
  begin
    -- Check if the EventStudent table exists
    begin
      -- Try to select from the table to check if it exists
      execute immediate 'select 1 from EventStudent where 1=0';
    exception
      -- If an error occurs (table does not exist), create the table
      when others then
        if sqlcode = -942 then  -- ORA-00942: table or view does not exist
          execute immediate '
            CREATE TABLE EventStudent (
              event_id NUMBER,
              student_id NUMBER,
              PRIMARY KEY (event_id, student_id),
              FOREIGN KEY (event_id) REFERENCES Events(event_id),
              FOREIGN KEY (student_id) REFERENCES Students(student_id)
            )';
        else
          raise;
        end if;
    end;
  end;
`);

    //await connection.execute(`begin execute immediate 'drop table Students'; exception when others then if sqlcode <> -942 then raise; end if; end;`);
    // await connection.execute(`CREATE TABLE Students ( student_id NUMBER PRIMARY KEY, student_name VARCHAR2(100) )`);

    // await connection.execute(`begin execute immediate 'drop table Organizations'; exception when others then if sqlcode <> -942 then raise; end if; end;`);
    // await connection.execute(`CREATE TABLE Organizations ( organization_id NUMBER PRIMARY KEY, organization_name VARCHAR2(100), organization_description VARCHAR2(255))`);

    // await connection.execute(`begin execute immediate 'drop table Events'; exception when others then if sqlcode <> -942 then raise; end if; end;`);
    // await connection.execute(`CREATE TABLE Events (
    // event_id NUMBER PRIMARY KEY,
    // event_name VARCHAR2(100) NOT NULL,
    // event_date DATE,
    // event_location VARCHAR2(100),
    // event_description VARCHAR2(255),
    // organization_id NUMBER,
    // participants_count NUMBER,
    // FOREIGN KEY (organization_id) REFERENCES Organizations(organization_id)
    // )`);

    // await connection.execute(`begin execute immediate 'drop table EventStudent'; exception when others then if sqlcode <> -942 then raise; end if; end;`);
    // await connection.execute(`CREATE TABLE EventStudent (
    // event_id NUMBER,
    // student_id NUMBER,
    // PRIMARY KEY (event_id, student_id),
    // FOREIGN KEY (event_id) REFERENCES Events(event_id),
    // FOREIGN KEY (student_id) REFERENCES Students(student_id)
    // )`);






    console.log('Data seeded successfully.');

    await connection.commit();
    console.log('Database setup complete.');
  } catch (err) {
    console.error('Error during setup:', err);
  }
}

module.exports = {
  initDB,
  setupDatabase,
};
