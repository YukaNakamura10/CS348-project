const express = require('express');
const router = express.Router();
const { getEvents, addEvent, deleteEvent, updateEvent, getAverageParticipants } = require('../controllers/eventsController');

router.get('/', getEvents);
router.post('/', addEvent);
router.delete('/:event_id', deleteEvent);
router.put('/:event_id', updateEvent);
router.get('/average-participants', getAverageParticipants);


module.exports = router;
