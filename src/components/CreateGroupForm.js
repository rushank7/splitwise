import React, { useState } from 'react';
import './CreateGroupForm.css';

function CreateGroupForm({ onSubmit, onCancel }) {
  const [groupData, setGroupData] = useState({
    name: '',
    members: [''] // Start with one empty member field
  });

  const addMember = () => {
    setGroupData({
      ...groupData,
      members: [...groupData.members, '']
    });
  };

  const removeMember = (index) => {
    const newMembers = groupData.members.filter((_, i) => i !== index);
    setGroupData({
      ...groupData,
      members: newMembers
    });
  };

  const updateMember = (index, value) => {
    const newMembers = [...groupData.members];
    newMembers[index] = value;
    setGroupData({
      ...groupData,
      members: newMembers
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out empty member fields
    const validMembers = groupData.members.filter(member => member.trim() !== '');
    onSubmit({
      ...groupData,
      members: validMembers,
      id: Date.now() // Simple way to generate unique ID
    });
  };

  return (
    <form className="create-group-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Group Name:</label>
        <input
          type="text"
          value={groupData.name}
          onChange={(e) => setGroupData({...groupData, name: e.target.value})}
          placeholder="e.g., Roommates"
          required
        />
      </div>

      <div className="form-group">
        <label>Members:</label>
        {groupData.members.map((member, index) => (
          <div key={index} className="member-input">
            <input
              type="text"
              value={member}
              onChange={(e) => updateMember(index, e.target.value)}
              placeholder="Enter member name"
              required
            />
            {groupData.members.length > 1 && (
              <button 
                type="button" 
                className="remove-member-btn"
                onClick={() => removeMember(index)}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button 
          type="button" 
          className="add-member-btn"
          onClick={addMember}
        >
          + Add Member
        </button>
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn">Create Group</button>
        <button 
          type="button" 
          className="cancel-btn"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default CreateGroupForm; 