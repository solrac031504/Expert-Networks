import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './home.css'; // Adjust the path if necessary

import { FaCheck } from 'react-icons/fa';

const Home = () => {
  const [dropdownOptions, setDropdownOptions] = useState({
    domains: [],
    fields: [],
    subfields: [],
    topics: [],
    continents: [],
    regions: [],
    subregions: [],
    countries: []
  });

  const [selectedOptions, setSelectedOptions] = useState({
    domain: [],
    field: [],
    subfield: [],
    topic: [],
    institution: '',
    continent: [],
    region: [],
    subregion: [],
    country: [],
    limit: '',
    sorting_sequence: '', 
    sorting: '',
    is_global_south: "0"
  });

  // searchResults are the results that are displayed
  const [searchResults, setSearchResults] = useState([]);
  // fullSearchResults are the full search results that are returned, sometimes more than the limit
  const [fullSearchResults, setFullSearchResults] = useState([]);

  // Log updated results when searchResults or fullSearchResults change
  useEffect(() => {
    console.log('Full search results updated:', fullSearchResults);
  }, [fullSearchResults]);

  useEffect(() => {
    console.log('Displayed search results updated:', searchResults);
  }, [searchResults]);

  const [searchController, setSearchController] = useState(null);

  // For the loading circle
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL; // Access the environment variable

  useEffect(() => {
    // Fetch unique domains
    console.log('Fetching unique domains...');
    fetch(`${apiUrl}/api/dropdown/study/domains`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique domains:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          domains: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching domains:', error);
      });

    // Fetch unique continents
    console.log('Fetching unique continents...');
    fetch(`${apiUrl}/api/dropdown/geo/continents`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique continents:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          continents: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching continents:', error);
      });
  }, [apiUrl]);

  // Fetch unique fields when domain changes
  useEffect(() => {
    const queryParams = new URLSearchParams({
      domain_id: selectedOptions.domain.id,
    }).toString();

    console.log('Fetching unique fields...');
    fetch(`${apiUrl}/api/dropdown/study/fields?${queryParams}`)
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
  }, [selectedOptions.domain])

  // Fetch unique subfields when field changes
  useEffect(() => {
    const queryParams = new URLSearchParams({
      field_id: selectedOptions.field.id,
    }).toString();

    console.log('Fetching unique subfields...');
    fetch(`${apiUrl}/api/dropdown/study/subfields?${queryParams}`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique subfields:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          subfields: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching subfields:', error);
      });
  }, [selectedOptions.field])

  // Fetch unique topics when subfield changes
  useEffect(() => {
    const queryParams = new URLSearchParams({
      subfield_id: selectedOptions.subfield.id,
    }).toString();

    console.log('Fetching unique topics...');
    fetch(`${apiUrl}/api/dropdown/study/topics?${queryParams}`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique topics:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          topics: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching topics:', error);
      });
  }, [selectedOptions.subfield])

  // Fetch unique regions when continent changes
  useEffect(() => {
    const queryParams = new URLSearchParams({
      continent_id: selectedOptions.continent.id,
    }).toString();

    console.log('Fetching unique regions...');
    fetch(`${apiUrl}/api/dropdown/geo/regions?${queryParams}`)
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
  }, [selectedOptions.continent])

  // Fetch unique subregions when region changes
  useEffect(() => {
    const queryParams = new URLSearchParams({
      region_id: selectedOptions.region.id,
    }).toString();

    console.log('Fetching unique subregions...');
    fetch(`${apiUrl}/api/dropdown/geo/subregions?${queryParams}`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique subregions:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          subregions: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching subregions:', error);
      });
  }, [selectedOptions.region])

  // Fetch unique countries when regions OR subregions changes
  useEffect(() => {
    const queryParams = new URLSearchParams({
      region_id: selectedOptions.region.id,
      subregion_id: selectedOptions.subregion.id
    }).toString();

    console.log('Fetching unique countries...');
    fetch(`${apiUrl}/api/dropdown/geo/countries?${queryParams}`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique countries:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          countries: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  }, [selectedOptions.region, selectedOptions.subregion])

  // Handle the change in the text box
  const handleInputChangeText = (e) => {
    const { name, value } = e.target;

    setSelectedOptions(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Dropdown menus
  const handleInputChange = (e) => {
    const { name, value, selectedOptions, options, type } = e.target;
  
    // Handle multiple selection for dropdowns
    if (e.target.multiple) {
      const selectedValues = Array.from(selectedOptions, option => {
        return {
          id: option.value,
          name: option.textContent // Assuming the textContent is the name
        };
      });
      
      setSelectedOptions(prevState => ({
        ...prevState,
        [name]: selectedValues,
      }));
    } 
    // Handle radio button inputs (and single dropdowns)
    else if (type === 'radio') {
      setSelectedOptions(prevState => ({
        ...prevState,
        [name]: value,  // For radio buttons, store just the value
      }));
    } 
    // Handle normal dropdowns (single select)
    else {
      const selectedData = {
        id: value,
        name: options ? options[e.target.selectedIndex].textContent : '' // Get name for dropdowns
      };
      
      setSelectedOptions(prevState => ({
        ...prevState,
        [name]: selectedData,
      }));
    }
  };
  

  const createURL = () => {
    // Create an object with only valid key-value pairs
    const validParams = Object.fromEntries(
      Object.entries({
        domain: selectedOptions.domain.id,
        field: selectedOptions.field.id,
        subfield: selectedOptions.subfield.id,
        topic: selectedOptions.topic.id,
        continent: selectedOptions.continent.id,
        region: selectedOptions.region.id,
        subregion: selectedOptions.subregion.id,
        country: selectedOptions.country.id,
        institution: selectedOptions.institution,
        limit: selectedOptions.limit
      }).filter(([key, value]) => value !== undefined && value !== null && value !== '')
    );

    const queryString = new URLSearchParams(validParams).toString();

    return queryString;
  };

  // Same as createURL but adds in the sorting that is selected
  const createDownloadURL = () => {
    // Create an object with only valid key-value pairs
    const validParams = Object.fromEntries(
      Object.entries({
        domain: selectedOptions.domain.id,
        field: selectedOptions.field.id,
        subfield: selectedOptions.subfield.id,
        topic: selectedOptions.topic.id,
        continent: selectedOptions.continent.id,
        region: selectedOptions.region.id,
        subregion: selectedOptions.subregion.id,
        country: selectedOptions.country.id,
        institution: selectedOptions.institution,
        limit: selectedOptions.limit,
        sorting: selectedOptions.sorting,
        is_global_south: selectedOptions.is_global_south
      }).filter(([key, value]) => value !== undefined && value !== null && value !== '')
    );

    const queryString = new URLSearchParams(validParams).toString();

    return queryString;
  };

// Search table based on values selected in the dropdown and sorting buttons
const handleSearch = async () => {
  console.log('Selected options:', selectedOptions);

  const queryString = createURL();
  const controller = new AbortController();  // Create a new AbortController instance
  const signal = controller.signal;         // Get the signal to pass to fetch

  // Store the controller to be able to abort later
  setSearchController(controller);

  try {
    setLoading(true);
    let full_search = [];

    let data;

    let prev_data_length = -1;

    // Continue to search through batches while
    // The length of the searches is less than the limit
    // AND
    // The full data set is growing in size
    // Loop will terminate when either
    // At least as many records as the LIMIT have been returned
    // OR 
    // The data set is no longer growing (i.e., the batch is no longer increasing the size)
    do {
      const response = await fetch(`${apiUrl}/api/search?${queryString}`, { signal });

      // Check if the response is okay before trying to parse JSON
      if (!response.ok) {
        const textResponse = await response.text(); // Get the raw text response for debugging
        console.error('Error response:', textResponse);
        throw new Error('Server error or timeout');
      }

      data = await response.json();

      console.log("Current iteration of search: ", data);

      // Only save the search if the there are records
      // This way, if the loop terminates because the next search did not return anything,
      // full search is preserved
      // if (data.length !== 0) full_search = data;
      full_search = data;

      let curr_data_length = full_search.length;

      // If the current full search length is NOT greater than the previous full length
      // i.e., leq prev full length, end loop
      // If not, then this will loop infinitely
      if (curr_data_length <= prev_data_length) {
        break;
      } else {
        prev_data_length = curr_data_length;
      }

    } while (full_search.length < selectedOptions.limit)

    // Only update results if the fetch was not aborted
    if (!signal.aborted) {
      setFullSearchResults(full_search);
      let limited_search = limitSearchResults(full_search, selectedOptions.limit);
      setSearchResults(limited_search);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log("Search was aborted");
    } else {
      console.error('Error during search:', error);
    }
  }

  setLoading(false);

  // Reset the value of is_global_south
  setSelectedOptions((prevOptions) => ({
    ...prevOptions,
    is_global_south: "0",
    sorting: []
  }))
  
  // Return controller to be used for cancellation
  return controller;
};

// Limit the search results
// Return the top 'limit' records
const limitSearchResults = (raw_search, limit) => {
  if (limit === '' || isNaN(Number(limit)) || limit === null) limit = 100;

  return raw_search.slice(0, Number(limit));
};

  // Download CSV
  const handleDownloadCSV = () => {
    console.log("Downloading CSV");
    const queryString = createDownloadURL();
    window.open(`${apiUrl}/api/download/export/csv?${queryString}`, '_blank');
  };
  
  // Download XLS
  const handleDownloadXLS = () => {
    console.log("Downloading XLS");
    const queryString = createDownloadURL();
    window.open(`${apiUrl}/api/download/export/xls?${queryString}`, '_blank');
  };

  // Download PDF
  const handleDownloadPDF = () => {
    console.log("Downloading PDF");
    const queryString = createDownloadURL();
    window.open(`${apiUrl}/api/download/export/pdf?${queryString}`, '_blank');
  };

  // Download PDF
  const handleDownloadDocx = () => {
    console.log("Downloading Docx");
    const queryString = createDownloadURL();
    window.open(`${apiUrl}/api/download/export/word?${queryString}`, '_blank');
  };

  //Clear filters function
  const clearFilters = () => {
    // If there is an ongoing search, cancel it
    if (searchController) {
      searchController.abort();
      console.log('Search has been cancelled due to filter reset.');
    }

    // Reset selected options
    setSelectedOptions({
      domain: [],
      field: [],
      subfield: [],
      topic: [],
      institution: '',
      continent: [],
      region: [],
      subregion: [],
      country: [],
      limit: '',
      sorting_sequence: '',
      is_global_south: "0"
    });

    setFullSearchResults([]);
    setSearchResults([]);
  };

  const handleFilterGlobalSouth = (event) => {
    const is_global_south_val = event.target.value;

    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      is_global_south: is_global_south_val
    }))

    filterGlobalSouth(is_global_south_val);
  }

  const filterGlobalSouth = (is_global_south_val) => {
    // Filter the full results based on the global south selection
    const filteredResults = fullSearchResults.filter(result => {
      if (is_global_south_val === "0") {
        console.log("Including Global South");
        return true; // Include all results
      } else if (is_global_south_val === "1") {
        console.log("Excluding Global South");
        return result.is_global_south === 0; // Exclude Global South
      } else if (is_global_south_val === "2") {
        console.log("Isolating Global South");
        return result.is_global_south === 1; // Only Global South
      }
      return true; // Default case (if no selection, include all)
    });

    // DON'T UPDATE FULL SEARCH RESULTS
    // You won't be able to undo the filtering
    // setFullSearchResults(filteredResults);

    let limited_results = limitSearchResults(filteredResults, selectedOptions.limit);

    // Set the displayed search results
    setSearchResults(limited_results);
  }

  const handleSortingChange = (event) => {
    const sortingValue = event.target.value;
  
    // Update selectedOptions state with the new sorting value
    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      sorting: sortingValue,
      sorting_sequence: getSortingDescription(sortingValue) // This will display a readable sorting description
    }));
  
    // Call the sorting function if necessary to apply the sorting logic immediately
    sortSearchResults(sortingValue);
  };

  const getSortingDescription = (sortingValue) => {
    switch (sortingValue) {
      case 'works_asc':
        return 'Works (Ascending)';
      case 'works_desc':
        return 'Works (Descending)';
      case 'citations_asc':
        return 'Citations (Ascending)';
      case 'citations_desc':
        return 'Citations (Descending)';
      case 'hindex_asc':
        return 'H-Index (Ascending)';
      case 'hindex_desc':
        return 'H-Index (Descending)';
      case 'i10index_asc':
        return 'i10-Index (Ascending)';
      case 'i10index_desc':
        return 'i10-Index (Descending)';
      case 'impact_factor_asc':
        return 'Impact Factor (Ascending)';
      case 'impact_factor_desc':
        return 'Impact Factor (Descending)';
      default:
        return '';
    }
  };

  const sortSearchResults = (sortingValue) => {
    // Create a copy of the full search results
    const sortedResults = [...fullSearchResults]; 
  
    // Sort the full search results
    switch (sortingValue) {
      case 'works_asc':
        sortedResults.sort((a, b) => a.works_count - b.works_count);
        break;
      case 'works_desc':
        sortedResults.sort((a, b) => b.works_count - a.works_count);
        break;
      case 'citations_asc':
        sortedResults.sort((a, b) => a.cited_by_count - b.cited_by_count);
        break;
      case 'citations_desc':
        sortedResults.sort((a, b) => b.cited_by_count - a.cited_by_count);
        break;
      case 'hindex_asc':
        sortedResults.sort((a, b) => a.hindex - b.hindex);
        break;
      case 'hindex_desc':
        sortedResults.sort((a, b) => b.hindex - a.hindex);
        break;
      case 'i10index_asc':
        sortedResults.sort((a, b) => a.i_ten_index - b.i_ten_index);
        break;
      case 'i10index_desc':
        sortedResults.sort((a, b) => b.i_ten_index - a.i_ten_index);
        break;
      case 'impact_factor_asc':
        sortedResults.sort((a, b) => a.impact_factor - b.impact_factor);
        break;
      case 'impact_factor_desc':
        sortedResults.sort((a, b) => b.impact_factor - a.impact_factor);
        break;
      default:
        break;
    }
  
    // Update the full search results with the sorted array
    setFullSearchResults(sortedResults);

    // limit the results
    let limited_results = limitSearchResults(sortedResults, selectedOptions.limit);
    // Set the search results displayed
    setSearchResults(limited_results);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const indexOfLastResult = currentPage * itemsPerPage;
  const indexOfFirstResult = indexOfLastResult - itemsPerPage;

  const currentResults = Array.isArray(searchResults)
  ? searchResults.slice(indexOfFirstResult, indexOfLastResult)
  : []; // Use an empty array if it's not an array

  const totalPages = Array.isArray(searchResults)
  ? Math.ceil(searchResults.length / itemsPerPage)
  : 0; // Use 0 if it's not an array


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <nav className="navbar custom-navbar">
        <div className="navbar-title">For the People, Find the People</div>
      </nav>
      <div className="container">
        {/* Dropdowns for the fields of study */}
        <div className="dropdown-container d-flex align-items-center mt-4">
          {/* Domain dropdown menu */}
          <select 
            className="form-control mr-2" 
            name="domain" 
            value={selectedOptions.domain.id || ''} 
            onChange={handleInputChange}
          >
            <option value="">Domain</option>
            {dropdownOptions.domains.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>

          {/* Field dropdown menu - only show if domain is selected */}
          {selectedOptions.domain.id && (
            <select
            className="form-control mr-2"
            name="field"
            value={selectedOptions.field.id || ''}
            onChange={handleInputChange}
          >
            <option value="">Field</option>
            {(Array.isArray(dropdownOptions.fields) ? dropdownOptions.fields : []).map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          )}

          {/* Subfield dropdown menu - only show if field is selected */}
          {selectedOptions.field.id && (
            <select
              className="form-control mr-2"
              name="subfield"
              value={selectedOptions.subfield.id || ''}
              onChange={handleInputChange}
            >
              <option value="">Subfield</option>
              {(Array.isArray(dropdownOptions.subfields) ? dropdownOptions.subfields : []).map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          )}

          {/* Topic dropdown menu - only show if subfield is selected */}
          {selectedOptions.subfield.id && (
            <select
              className="form-control mr-2"
              name="topic"
              value={selectedOptions.topic.id || ''}
              onChange={handleInputChange}
            >
              <option value="">Topic</option>
              {(Array.isArray(dropdownOptions.topics) ? dropdownOptions.topics : []).map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Dropdowns for the geographic regions */}
        <div className="dropdown-container d-flex align-items-center mt-4">
          {/* Continent dropdown menu */}
          <select 
            className="form-control mr-2" 
            name="continent" 
            value={selectedOptions.continent.id || ''} 
            onChange={handleInputChange}
          >
            <option value="">Continent</option>
            {dropdownOptions.continents.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>

          {/* Region dropdown menu */}
          {selectedOptions.continent.id && (
            <select 
              className="form-control mr-2" 
              name="region" 
              value={selectedOptions.region.id || ''} 
              onChange={handleInputChange}
            >
              <option value="">Region</option>
              {(Array.isArray(dropdownOptions.regions) ? dropdownOptions.regions : []).map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          )}

          {/* Subregion dropdown menu */}
          {selectedOptions.region.id && (
            <select 
              className="form-control mr-2" 
              name="subregion" 
              value={selectedOptions.subregion.id || ''} 
              onChange={handleInputChange}
            >
              <option value="">Subregion</option>
              {(Array.isArray(dropdownOptions.subregions) ? dropdownOptions.subregions : []).map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          )}

          {/* Country dropdown menu */}
          {selectedOptions.region.id && (
            <select 
              className="form-control mr-2" 
              name="country" 
              value={selectedOptions.country.id || ''} 
              onChange={handleInputChange}
            >
              <option value="">Country</option>
              {(Array.isArray(dropdownOptions.countries) ? dropdownOptions.countries : []).map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          )}

        </div>

        {/* Institution and limit text input */}
        <div className="textbox-container d-flex align-items-center mt-4">
          <input
            type="text"
            className="form-control mr-2"
            name="institution"
            value={selectedOptions.institution}
            onChange={handleInputChangeText}
            placeholder="Enter Institution(s)"
          />
        </div>

        {/* Limit text input */}
        <div className="textbox-container d-flex align-items-center mt-4">
          <input
            type="text"
            className="form-control mr-2"
            name="limit"
            value={selectedOptions.limit}
            onChange={handleInputChangeText}
            placeholder="Enter Limit: Default 100"
          />
        </div>

        <div className="center-horizontally">
          <div className="filterbutton-container">
            <button className="btn filter-button" onClick={handleSearch}>Search</button>
            <button className="btn filter-button" onClick={clearFilters}>Clear Filters</button>
          </div>
        </div>

        {/* If the data is loading, show the spinner
            Once it is done loading, display the resulting table */}
        {loading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          ) : (       
            <div>  
              {searchResults.length > 0 ? (
              <div className="mt-4">
                        {/* Sorting dropdown */}
              <div className="dropdown-container d-flex align-items-center mt-4 sortby-container">
                <select className="form-control mr-2" name="sorting" value={selectedOptions.sorting || ''} onChange={handleSortingChange}>
                  <option value="">Sort by</option>
                  <option value="works_asc">Works (Ascending)</option>
                  <option value="works_desc">Works (Descending)</option>
                  <option value="citations_asc">Citations (Ascending)</option>
                  <option value="citations_desc">Citations (Descending)</option>
                  <option value="hindex_asc">H-Index (Ascending)</option>
                  <option value="hindex_desc">H-Index (Descending)</option>
                  <option value="i10index_asc">i10-Index (Ascending)</option>
                  <option value="i10index_desc">i10-Index (Descending)</option>
                  <option value="impact_factor_asc">Impact Factor (Ascending)</option>
                  <option value="impact_factor_desc">Impact Factor (Descending)</option>
                </select>
              </div>

              <div className="dropdown-container mt-4 d-flex align-items-center">
                {/* Radio buttons */}
                <div className="radio-group d-flex align-items-center mr-4">
                  <label className="mr-3">
                    <input
                      type="radio"
                      name="is_global_south"
                      value="0"
                      checked={selectedOptions.is_global_south === '0'}
                      onChange={handleFilterGlobalSouth}
                    />
                    Include Global South
                  </label>
                  <label className="mr-3">
                    <input
                      type="radio"
                      name="is_global_south"
                      value="1"
                      checked={selectedOptions.is_global_south === '1'}
                      onChange={handleFilterGlobalSouth}
                    />
                    Exclude Global South
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="is_global_south"
                      value="2"
                      checked={selectedOptions.is_global_south === '2'}
                      onChange={handleFilterGlobalSouth}
                    />
                    Only Global South
                  </label>
                </div>

                {/* Download buttons */}
                <div className="downloadbutton-container d-flex gap-4">
                  <button className="btn download-button" onClick={handleDownloadCSV}>Download CSV</button>
                  <button className="btn download-button" onClick={handleDownloadXLS}>Download XLS</button>
                  <button className="btn download-button" onClick={handleDownloadPDF}>Download PDF</button>
                  <button className="btn download-button" onClick={handleDownloadDocx}>Download DOCX</button>
                </div>
              </div>

                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th title="Full name of the expert">Name</th>
                        <th title="Current institutional affiliation of the expert">Institution</th>
                        <th title="The country in which the expert's institutional affiliation is located">Country</th>
                        <th title="Total number of works published by this expert">Works Count</th>
                        <th title="How many times the expert has been cited">Times Cited</th>
                        <th title="The number of papers (h) that have received (h) or more citations">H-index</th>
                        <th title="The number of publications an expert has with at least 10 citations">I10-Index</th>
                        <th title="The average number of citations of an expert within the last 2 years starting at the last year">Impact Factor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentResults.map((result, index) => (
                        <tr key={index}>
                          <td>{result.author_name}</td>
                          <td>{result.institution_name}</td>
                          <td>{result.country_name || 'N/A'}</td>
                          <td>{result.works_count}</td>
                          <td>{result.cited_by_count}</td>
                          <td>{result.hindex}</td>
                          <td>{result.i_ten_index}</td>
                          <td>{result.impact_factor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination-controls">
                    <button className="btn-page" onClick={handlePreviousPage} disabled={currentPage === 1}>
                      Previous
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button className="btn-page" onClick={handleNextPage} disabled={currentPage === totalPages}>
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-authors">
                  <h2>No Authors Found</h2>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default Home;