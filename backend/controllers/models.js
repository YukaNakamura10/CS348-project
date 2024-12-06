require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize instance
const sequelize = new Sequelize({
  dialect: 'oracle',
  username: process.env.DB_USER, // Replace with your Oracle DB username
  password: process.env.DB_PASSWORD, // Replace with your Oracle DB password
  dialectOptions: {
    connectString: process.env.DB_CONNECT_STRING, // Replace with your Oracle DB connection string
  }
});

// Test the connection to ensure it works
sequelize.authenticate()
  .then(() => {
    console.log('Connection to the Oracle database successful!');
  })
  .catch((error) => {
    console.error('Unable to connect to the Oracle database:', error);
  });

// Define the Organization model
const Organization = sequelize.define('Organizations', {
  organization_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'ORGANIZATION_ID',
  },
  organization_name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'ORGANIZATION_NAME',
  },
  organization_description: {
    type: DataTypes.STRING,
    field: 'ORGANIZATION_DESCRIPTION',
  },
}, {
  tableName: 'ORGANIZATIONS',
  timestamps: false,
});

// Define the Event model
const Event = sequelize.define('Events', {
  event_id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    field: 'EVENT_ID',
  },
  event_name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'EVENT_NAME',
  },
  event_date: {
    type: DataTypes.DATE,
    field: 'EVENT_DATE',
  },
  event_location: {
    type: DataTypes.STRING,
    field: 'EVENT_LOCATION',
  },
  event_description: {
    type: DataTypes.STRING,
    field: 'EVENT_DESCRIPTION',
  },
  // organization_id: {
  //   type: DataTypes.INTEGER,
  //   references: {
  //     model: Organization, // Refers to the Organization model
  //     key: 'organization_id',
  //   },
  //   field: 'ORGANIZATION_ID', 
  // },
  organization_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    // Index definition
    indexes: [
      {
        name: 'idx_organization_id',
        fields: ['organization_id']
      }
    ],
    field: 'ORGANIZATION_ID'

  },
  participants_count: {
    type: DataTypes.INTEGER,
    field: 'PARTICIPANTS_COUNT', 
  },
}, {
  tableName: 'EVENTS',
  timestamps: false,
});

Event.belongsTo(Organization, { foreignKey: 'organization_id' });
Organization.hasMany(Event, { foreignKey: 'organization_id' });

// Export sequelize and models
module.exports = { sequelize, Organization, Event };
