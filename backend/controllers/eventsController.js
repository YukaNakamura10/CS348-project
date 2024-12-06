const { initDB, setupDatabase } = require('../db');
const { Event, Organization } = require('./models');  // Adjust path as needed
const Sequelize = require('sequelize');

// Ensure the database is set up before handling requests
(async function initialize() {
  const connection = await initDB();
  await setupDatabase(connection);
  await connection.close();
  console.log('Database setup completed.');
})();

async function getAverageParticipants(req, res) {
    const { organization_id } = req.query; // Optionally filter by organization_id

    Organization.findOne({
        where: { organization_id: 1 }  // Adjust based on the actual data
      }).then(result => {
        console.log(result);
      }).catch(err => {
        console.error('Error fetching organization:', err);
      });

    console.log(organization_id)
  
    try {
      // Step 1: If an organization_id is provided, calculate the average for that organization
      const eventsQuery = {
        where: organization_id ? { organization_id } : {}, // Apply filter if organization_id is provided
  attributes: [
    [Sequelize.fn('AVG', Sequelize.col('PARTICIPANTS_COUNT')), 'average_participant_count']
  ],
  raw: true, 
  logging: console.log
      };
  
      // Step 2: Get the average participant count for events
      const result = await Event.findAll(eventsQuery);
      console.log(result)
  
      // Step 3: Return the average count
      const averageCount = result[0]?.average_participant_count || 0;
  
      res.json({
        average_participant_count: averageCount,
      });
    } catch (err) {
      console.error('Error fetching average participant count:', err);
      res.status(500).json({ message: 'Error fetching average participant count' });
    }
  }
  

async function getEvents(req, res) {
    const connection = await initDB();
    
    // Check if organization_id is passed as query parameter
    const { organization_id } = req.query;
  
    let query = 'SELECT * FROM Events';
    let binds = [];
  
    // If organization_id is provided, filter events by it
    if (organization_id) {
      query += ' WHERE organization_id = :organization_id';
      binds.push(organization_id);
    }
  
    try {
      const result = await connection.execute(query, binds);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching events:', err);
      res.status(500).json({ message: 'Error fetching events' });
    }
}

// async function getEvents(req, res) {
//     const connection = await initDB();
  
//     // Check if organization_id is passed as a query parameter
//     const { organization_id } = req.query;
  
//     let query = 'SELECT * FROM Events';
//     let binds = [];
  
//     // If organization_id is provided, filter events by it
//     if (organization_id) {
//       query += ' WHERE organization_id = :organization_id';
//       binds.push(organization_id);
//     }
  
//     try {
//       // Fetch events from the database
//       const result = await connection.execute(query, binds);
//       const events = result.rows;
  
//       // Calculate the participant count for each event
//       const eventIds = events.map(event => event.id);
  
//       // If no events, return response with an empty list
//       if (eventIds.length === 0) {
//         return res.json({
//           events: [],
//           average_participant_count: 0,
//         });
//       }
  
//       // Use Sequelize to calculate the average participants and participant count for the fetched events
//       const eventsWithAvgParticipants = await Event.findAll({
//         where: {
//           id: eventIds,
//           ...(organization_id ? { organization_id } : {}),
//         },
//         include: [
//           {
//             model: Participant,
//             attributes: [],
//           },
//           {
//             model: Organization,
//             attributes: ['organization_name'],
//           },
//         ],
//         attributes: {
//           include: [
//             [Sequelize.fn('COUNT', Sequelize.col('Participants.id')), 'participant_count'],
//           ],
//         },
//         group: ['Event.id', 'Organization.id'],
//       });
  
//       // Calculate the average participant count
//       const avgParticipants = await Event.findAll({
//         where: {
//           id: eventIds,
//           ...(organization_id ? { organization_id } : {}),
//         },
//         include: [
//           {
//             model: Participant,
//             attributes: [],
//           },
//         ],
//         attributes: [
//           [Sequelize.fn('AVG', Sequelize.col('Participants.id')), 'average_participant_count'],
//         ],
//       });
  
//       const averageParticipantCount = avgParticipants[0]?.dataValues.average_participant_count || 0;
  
//       // Return the events along with their participant counts and the average participant count
//       res.json({
//         events: eventsWithAvgParticipants,
//         average_participant_count: averageParticipantCount,
//       });
  
//     } catch (err) {
//       console.error('Error fetching events:', err);
//       res.status(500).json({ message: 'Error fetching events' });
//     }
//   }

async function addEvent(req, res) {
  const { name, date, location, description, organization_id } = req.body;
  const connection = await initDB();
  const { v4: uuidv4 } = require('uuid');  // Use the 'uuid' package for UUIDs

const event_id = uuidv4();  // Generates a new UUID
const formattedDate = new Date(date).toISOString().split('T')[0];

const sqlInsert = `
  INSERT INTO Events (event_id, event_name, event_date, event_location, event_description, organization_id)
  VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), :4, :5, :6)
`;

const binds = [
  [event_id, name, formattedDate, location, description, organization_id]
];

await connection.execute(sqlInsert, binds[0], { autoCommit: true });

  
  
  res.status(201).json({ message: 'Event added' });
}

async function deleteEvent(req, res) {
    const { event_id } = req.params; // Get the event_id from the URL parameter
    const connection = await initDB();
    console.log('yes')
  
    try {
      // Delete the event from the Events table
      const sqlDelete = 'DELETE FROM Events WHERE event_id = :1';
      const binds = [event_id];
  
      const result = await connection.execute(sqlDelete, binds, { autoCommit: true });
  
      // Check if any rows were deleted
      if (result.rowsAffected === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while deleting the event' });
    } finally {
      await connection.close();
    }
  }
  async function updateEvent(req, res) {
    const { event_id } = req.params;
    const { name, date, location, description } = req.body;

    const connection = await initDB();

    const formattedDate = new Date(date).toISOString().split('T')[0];

    const currentParticipantsQuery = `SELECT participants_count FROM Events WHERE event_id = :1`;
const result = await connection.execute(currentParticipantsQuery, [event_id]);

const currentParticipantsCount = result.rows[0][0]

    const sqlUpdate = `
        UPDATE Events
        SET event_name = :1, event_date = TO_DATE(:2, 'YYYY-MM-DD'), event_location = :3, event_description = :4, participants_count = :5
        WHERE event_id = :6
    `;
    const binds = [name, formattedDate, location, description, currentParticipantsCount, event_id];

    try {
        const result = await connection.execute(sqlUpdate, binds, { autoCommit: true });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event updated successfully' });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ message: 'An error occurred while updating the event' });
    } finally {
        await connection.close();
    }
}


module.exports = { getEvents, addEvent, deleteEvent, updateEvent, getAverageParticipants };
