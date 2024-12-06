import React, { useState, useEffect } from 'react';
import { addEvent } from '../services/api';

function AddEvent() {
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        location: '',
        description: '',
        organization_id: ''
    });

    const [organizations, setOrganizations] = useState([]);  // State for organizations

    // Fetch organizations when the component mounts
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addEvent(formData);
        alert('Event added');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" onChange={handleChange} placeholder="Event Name" />
            <input name="date" onChange={handleChange} type="date" />
            <input name="location" onChange={handleChange} placeholder="Location" />
            <textarea name="description" onChange={handleChange} placeholder="Description" />
            <select 
                name="organization_id" 
                onChange={handleChange} 
                value={formData.organization_id}
            >
                <option value="">Select Organization</option>
                {organizations.map(org => (
                    <option key={org.organization_id} value={org.organization_id}>
                        {org.organization_name}
                    </option>
                ))}
            </select>
            <button type="submit">Add Event</button>
        </form>
    );
}

export default AddEvent;
