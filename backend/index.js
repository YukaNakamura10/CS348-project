const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const eventRoutes = require('./routes/events');
const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use('/api/events', eventRoutes);

const organizationRoutes = require('./routes/organization');
app.use('/api/organizations', organizationRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
