import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Navbar.css'; // Adjust the path if necessary

const Home = () => {
  const [dropdownOptions, setDropdownOptions] = useState({
    fields: [],
    institutions: [],
    regions: [],
  });
  const [selectedOptions, setSelectedOptions] = useState({
    field: '',
    institution: '',
    region: '',
  });

  useEffect(() => {
    // Fetch unique fields
    console.log('Fetching unique fields...');
    axios.get('http://localhost:4000/api/experts/fields')
      .then(response => {
        console.log('Received unique fields:', response.data);
        setDropdownOptions(prevState => ({
          ...prevState,
          fields: response.data,
        }));
      })
      .catch(error => {
        console.error('Error fetching fields:', error);
      });

    // Fetch unique institutions
    console.log('Fetching unique institutions...');
    axios.get('http://localhost:4000/api/experts/institutions')
      .then(response => {
        console.log('Received unique institutions:', response.data);
        setDropdownOptions(prevState => ({
          ...prevState,
          institutions: response.data,
        }));
      })
      .catch(error => {
        console.error('Error fetching institutions:', error);
      });

    // Fetch unique regions
    console.log('Fetching unique regions...');
    axios.get('http://localhost:4000/api/experts/regions')
      .then(response => {
        console.log('Received unique regions:', response.data);
        setDropdownOptions(prevState => ({
          ...prevState,
          regions: response.data,
        }));
      })
      .catch(error => {
        console.error('Error fetching regions:', error);
      });
  }, []);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setSelectedOptions(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    // Implement search functionality based on selectedOptions
    console.log('Selected options:', selectedOptions);
    // You can use the selected options to make a search request or filter the data
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="navbar-title">
          For the People, Find the People
        </div>
      </nav>
      <div className="dropdown-container">
        <select name="field" value={selectedOptions.field} onChange={handleSelectChange}>
          <option value="">Select Field</option>
          {dropdownOptions.fields.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        <select name="institution" value={selectedOptions.institution} onChange={handleSelectChange}>
          <option value="">Select Institution</option>
          {dropdownOptions.institutions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        <select name="region" value={selectedOptions.region} onChange={handleSelectChange}>
          <option value="">Select Region</option>
          {dropdownOptions.regions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>
    </div>
  );
};

export default Home;
