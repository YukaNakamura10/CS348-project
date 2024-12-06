import React, { useEffect, useState } from 'react';
import { getEvents, getAverageParticipantCount} from '../services/api';

function EventList() {
    const [events, setEvents] = useState([]);
    const [editingEvent, setEditingEvent] = useState(null); // To track which event is being edited
    const [eventDetails, setEventDetails] = useState({
        name: '',
        date: '',
        location: '',
        description: '',
    });
    const [organizations, setOrganizations] = useState([]); // Store organizations for the dropdown
    const [selectedOrganization, setSelectedOrganization] = useState('');
    const [averageParticipantCount, setAverageParticipantCount] = useState(0);

   

    useEffect(() => {
        async function fetchData() {
            setEvents([])
            const result = await getEvents();
            

            const formattedEvents = result.data.map(event => ({
                event_id: event[0],  // First value is event_id
                name: event[1],      // Second value is name
                date: event[2],      // Third value is date
                location: event[3],  // Fourth value is location
                description: event[4], // Fifth value is description
                organization_id: event[5], // Sixth value is organization_id
                participant_count: event[6]
            }));
        
            
            setEvents(formattedEvents);
            console.log(events)

        }
        fetchData();
    }, []);

    useEffect(() => {
        async function fetchOrganizations() {
          try {
            const response = await fetch('http://localhost:5001/api/organizations');
            const organizations = await response.json();
      
            // Map the response to a format usable in the dropdown
            const formattedOrganizations = organizations.map(([organization_id, organization_name]) => ({
              organization_id,
              organization_name,
            }));
      
            setOrganizations(formattedOrganizations);
          } catch (error) {
            console.error('Error fetching organizations:', error);
          }
        }
        fetchOrganizations();
      }, []);
      
    const handleDelete = async (event_id) => {
        try {
        // Log the event_id to ensure it's correct
        console.log('Sending DELETE request for event with ID:', event_id);

        const response = await fetch(`http://localhost:5001/api/events/${event_id}`, {
            method: 'DELETE',  // Set method to DELETE
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Update the state to remove the deleted event
            setEvents(events.filter(event => event.event_id !== event_id));
            alert('Event deleted successfully');
        } else {
            alert('Error deleting event');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event');
    }
    };
    const handleEdit = (event) => {
        setEditingEvent(event.event_id);
        setEventDetails({
            name: event.name,
            date: event.date,
            location: event.location,
            description: event.description,
        });
    };

    const handleOrganizationChange = async (e) => {
        const organizationId = e.target.value;
        setSelectedOrganization(organizationId);
        setEvents([]);
    
        // Fetch filtered events based on the selected organization
        const result = await getEvents(organizationId);
        const formattedEvents = result.data.map(event => ({
          event_id: event[0],
          name: event[1],
          date: event[2],
          location: event[3],
          description: event[4],
          organization_id: event[5],
          participant_count: event[6]
        }));
        setEvents(formattedEvents);
        console.log(result)
        const averageParticipantCount = await getAverageParticipantCount(organizationId);
        console.log(averageParticipantCount)
        setAverageParticipantCount(averageParticipantCount);
      };
    

    const handleSave = async () => {
        const updatedEvent = {
            event_id: editingEvent,
            ...eventDetails,
        };

        try {
            const response = await fetch(`http://localhost:5001/api/events/${editingEvent}`, {
                method: 'PUT',  // Assuming you have PUT method for update
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEvent),
            });

            if (response.ok) {
                // Update the event list with the updated event
                setEvents(events.map(event => event.event_id === editingEvent ? updatedEvent : event));
                setEditingEvent(null);
                alert('Event updated successfully');
            } else {
                alert('Error updating event');
            }
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Error updating event');
        }
    };

    const handleCancelEdit = () => {
        setEditingEvent(null);
    };

    console.log(organizations)


    return (
        <div>
        <h1>Events</h1>

        <select value={selectedOrganization} onChange={handleOrganizationChange}>
  <option value="">All Organizations</option>
  {organizations.map((organization) => (
    <option key={organization.organization_id} value={organization.organization_id}>
      {organization.organization_name}
    </option>
  ))}
</select>
{selectedOrganization && (
        <div>
          <p>Average Participants: {averageParticipantCount}</p>
        </div>
      )}

        {events.length === 0 ? (
            <p></p>
        ) : (
            <ul>
                    {events.map(event => (
                        <li key={event.event_id}>
                            {editingEvent === event.event_id ? (
                                <div>
                                    <input 
                                        type="text" 
                                        value={eventDetails.name} 
                                        onChange={(e) => setEventDetails({ ...eventDetails, name: e.target.value })} 
                                    />
                                    <input 
                                        type="date" 
                                        value={eventDetails.date} 
                                        onChange={(e) => setEventDetails({ ...eventDetails, date: e.target.value })} 
                                    />
                                    <input 
                                        type="text" 
                                        value={eventDetails.location} 
                                        onChange={(e) => setEventDetails({ ...eventDetails, location: e.target.value })} 
                                    />
                                    <textarea 
                                        value={eventDetails.description} 
                                        onChange={(e) => setEventDetails({ ...eventDetails, description: e.target.value })} 
                                    />
                                    <button onClick={handleSave}>Save</button>
                                    <button onClick={handleCancelEdit}>Cancel</button>
                                </div>
                            ) : (
                                <div>
                                    <span
                                        style={{ cursor: 'pointer', color: 'blue' }}
                                        onClick={() => handleEdit(event)}
                                    >
                                        {event.name}
                                        </span> - 
                                    {new Date(event.date).toLocaleDateString()} - 
                                    {organizations.find(org => org.organization_id === event.organization_id)?.organization_name || 'N/A'} - 
                                    {event.participant_count || 'N/A'} participants
                                    <button onClick={() => handleDelete(event.event_id)}>Delete</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
        )}
    </div>
    );
}

export default EventList;
