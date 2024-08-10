import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './home.css'; // Adjust the path if necessary

const Home = () => {
  const [dropdownOptions, setDropdownOptions] = useState({
    fields: [],
    regions: [],
  });
  const [selectedOptions, setSelectedOptions] = useState({
    field: '',
    institution: '',
    region: '',
  });
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Fetch unique fields
    console.log('Fetching unique fields...');
    fetch('http://localhost:4000/api/dropdown/fields')
      .then(response => response.json())
      .then(data => {
        console.log('Received unique fields:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          fields: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching fields:', error);
      });

    // Fetch unique regions
    console.log('Fetching unique regions...');
    fetch('http://localhost:4000/api/dropdown/regions')
      .then(response => response.json())
      .then(data => {
        console.log('Received unique regions:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          regions: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching regions:', error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedOptions(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // raw_institution instead of institution because searchController uses raw_institution to format the institution string
  const handleSearch = () => {
    console.log('Selected options:', selectedOptions);
    fetch(`http://localhost:4000/api/search?field_of_study=${selectedOptions.field}&raw_institution=${selectedOptions.institution}&region=${selectedOptions.region}`)
      .then(response => response.json())
      .then(data => {
        console.log('Search results:', data);
        setSearchResults(data);
      })
      .catch(error => {
        console.error('Error during search:', error);
      });
  };

  const handleDownloadCSV = () => {
    window.open(`http://localhost:4000/api/download/export/csv?field_of_study=${selectedOptions.field}&raw_institution=${selectedOptions.institution}&region=${selectedOptions.region}`, '_blank');
  };

  return (
    <div>
      <nav className="navbar custom-navbar">
        <div className="navbar-title">For the People, Find the People</div>
      </nav>
      <div className="container">
        <div className="dropdown-container d-flex align-items-center mt-4">
          <select className="form-control mr-2" name="field" value={selectedOptions.field} onChange={handleInputChange}>
            <option value="">Field</option>
            {dropdownOptions.fields.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          
          {/* Replaced the institution dropdown with a text input */}
          <input
            type="text"
            className="form-control mr-2"
            name="institution"
            value={selectedOptions.institution}
            onChange={handleInputChange}
            placeholder="Enter Institution"
          />

          <select className="form-control mr-2" name="region" value={selectedOptions.region} onChange={handleInputChange}>
            <option value="">Region</option>
            {dropdownOptions.regions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4">
            <button className="btn download-button" onClick={handleDownloadCSV}>Download CSV</button>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Field of Study</th>
                  <th>Institution</th>
                  <th>Region</th>
                  <th>Times Cited</th>
                  <th>H-index</th>
                  <th>I10-index</th>
                  <th>Impact Factor</th>
                  <th>Age</th>
                  <th>Years In Field</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((result, index) => (
                  <tr key={index}>
                    <td>{result.name}</td>
                    <td>{result.field_of_study}</td>
                    <td>{result.institution}</td>
                    <td>{result.region}</td>
                    <td>{result.citations}</td>
                    <td>{result.hindex}</td>
                    <td>{result.i_ten_index}</td>
                    <td>{result.impact_factor}</td>
                    <td>{result.age}</td>
                    <td>{result.years_in_field}</td>
                    <td>{result.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
