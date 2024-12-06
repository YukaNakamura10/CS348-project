import axios from 'axios';

const API_URL = 'http://localhost:5001/api/events';

export const getEvents = async (organization_id = '') => {
    try {
      let url = 'http://localhost:5001/api/events';
      if (organization_id) {
        url += `?organization_id=${organization_id}`;  // Add organization_id to query params
      }
  
      const response = await fetch(url);
      const events = await response.json();
  
      return { data: events };
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
};

export const getAverageParticipantCount = async (organization_id = '') => {
    try {
      let url = 'http://localhost:5001/api/events/average-participants';
      if (organization_id) {
        url += `?organization_id=${organization_id}`;
      }
  
      const response = await fetch(url);
      const result = await response.json();
  
      return result.average_participant_count;  // Assuming your backend returns average_participant_count
    } catch (error) {
      console.error('Error fetching average participant count:', error);
      throw error;
    }
  };

export const addEvent = async (eventData) => {
    return await axios.post(API_URL, eventData);
};
