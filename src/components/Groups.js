import React, { useState, useEffect } from 'react';

import './Groups.css';

import CreateGroupForm from './CreateGroupForm';

import { api } from '../services/api';



function Groups() {

  const [groups, setGroups] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    loadGroups();

  }, []);



  const loadGroups = async () => {

    try {

      const fetchedGroups = await api.getGroups();

      setGroups(fetchedGroups);

    } catch (error) {

      console.error('Error loading groups:', error);

    } finally {

      setLoading(false);

    }

  };



  const handleCreateGroup = async (newGroup) => {

    try {

      await api.createGroup(newGroup);

      await loadGroups();

      setShowForm(false);

    } catch (error) {

      console.error('Error creating group:', error);

    }

  };



  if (loading) {

    return <div>Loading groups...</div>;

  }



  return (

    <div className="groups-container">

      <h2>My Groups</h2>

      <div className="groups-list">

        {groups.length === 0 ? (

          <p>No groups yet. Create one to get started!</p>

        ) : (

          groups.map(group => (

            <div key={group.id} className="group-card">

              <h3>{group.name}</h3>

              <p>{group.members.length} members</p>

              <div className="members-list">

                {group.members.join(', ')}

              </div>

            </div>

          ))

        )}

      </div>

      

      {showForm ? (

        <CreateGroupForm 

          onSubmit={handleCreateGroup}

          onCancel={() => setShowForm(false)}

        />

      ) : (

        <button 

          className="add-group-btn"

          onClick={() => setShowForm(true)}

        >

          + Create New Group

        </button>

      )}

    </div>

  );

}



export default Groups; 
