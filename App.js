import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [cityWeather, setCityWeather] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Delhi'); // Default city
  const [tempUnit, setTempUnit] = useState('metric'); // Default to Celsius

  const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

  const fetchCityWeather = async (city) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/weather?city=${city}&unit=${tempUnit}`);
      setCityWeather(response.data);
    } catch (error) {
      console.error('Error fetching city weather:', error);
      setCityWeather(null); // Reset state if there's an error
    }
  };

  const fetchDailySummaries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/daily-summaries');
      setSummaries(response.data);
    } catch (error) {
      console.error('Error fetching daily summaries:', error);
    }
  };

  useEffect(() => {
    fetchCityWeather(selectedCity); // Fetch weather data for the default city
    fetchDailySummaries(); // Fetch daily summaries
  }, [selectedCity, tempUnit]); // Dependencies include selected city and temp unit

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
    fetchCityWeather(event.target.value); // Fetch weather data for the selected city
  };

  const handleUnitChange = (event) => {
    setTempUnit(event.target.value);
    fetchCityWeather(selectedCity); // Fetch updated weather data with the new unit
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Weather Monitoring System</h1>
      <div>
        <label htmlFor="city-select">Select a city:</label>
        <select id="city-select" value={selectedCity} onChange={handleCityChange}>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="temp-unit">Select temperature unit:</label>
        <select id="temp-unit" value={tempUnit} onChange={handleUnitChange}>
          <option value="metric">Celsius</option>
          <option value="standard">Kelvin</option>
        </select>
      </div>
      {cityWeather && (
        <div>
          <h2>{cityWeather.city}</h2>
          <p>Temperature: {cityWeather.temp} °{tempUnit === 'metric' ? 'C' : 'K'}</p>
          <p>Feels Like: {cityWeather.feels_like} °{tempUnit === 'metric' ? 'C' : 'K'}</p>
          <p>Weather Condition: {cityWeather.main}</p>
          <p>Time update : {cityWeather.dt}</p> 
        </div>
      )}
      <h3>Daily Summaries</h3>
      {Object.keys(summaries).length >= 0 ? (
        <table>
          <thead>
            <tr>
              <th>City</th>
              <th>Avg Temp (°C)</th>
              <th>Max Temp (°C)</th>
              <th>Min Temp (°C)</th>
              <th>Dominant Condition</th>
            </tr>
          </thead>
          <tbody>
           
            {Object.keys(summaries).map((key) => (
              <tr key={`${summaries[key].city}-${summaries[key].date}`}>
                <td>{key}</td>
                <td>{(summaries[key].avgTemp -273.15).toFixed(2)}</td>
                <td>{(summaries[key].maxTemp - 273.15).toFixed(2)}</td>
                <td>{(summaries[key].minTemp - 273.15).toFixed(2)}</td>
                <td>{summaries[key].main}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No daily summaries available.</p>
      )}
    </div>
  );
};

export default App;
