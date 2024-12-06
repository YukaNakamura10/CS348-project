const express = require('express');
const router = express.Router();
const { initDB } = require('../db');

router.get('/', async (req, res) => {
    console.log('yes1')
  const connection = await initDB();
  try {
    const result = await connection.execute('SELECT organization_id, organization_name FROM Organizations');
    res.json(result.rows); // Send organization ID and name to the client
  } catch (err) {
    console.error('Error fetching organizations:', err);
    res.status(500).json({ message: 'Error fetching organizations' });
  } finally {
    await connection.close();
  }
});

module.exports = router;