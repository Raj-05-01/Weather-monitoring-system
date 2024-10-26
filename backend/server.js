const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Weather Data Schema
const weatherSchema = new mongoose.Schema({
  city: String,
  main: String,
  temp: Number,
  feels_like: Number,
  dt: Date,
});

const Weather = mongoose.model('Weather', weatherSchema);

// Daily Summary Schema
const dailySummarySchema = new mongoose.Schema({
  date: String,
  city: String,
  avgTemp: Number,
  maxTemp: Number,
  minTemp: Number,
  dominantCondition: String,
});

// const DailySummary = mongoose.model('DailySummary', dailySummarySchema);

// Configurable temperature threshold
const temperatureThreshold = 35; // Example threshold
let lastAlert = {};

// Function to fetch weather data for a specific city
const fetchWeatherData = async (city) => {
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${API_KEY}`);
    const { main, weather, dt } = response.data;
        
    // Store the weather data in the database
      const weatherData =  {
        city,
        main: weather[0].main,
        temp: main.temp, // Temperature in Kelvin
        feels_like: main.feels_like, // Feels like in Kelvin
        dt: new Date(dt * 1000),
      }; 
      const newWeather = new Weather(weatherData);
      await newWeather.save();
      return weatherData;
  } catch (error) {
    console.error(`Error fetching weather data for ${city}:`, error);
    throw error;
  }
};
  
const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

// func
const fetchAllWeatherData = () => {
     cities.forEach(city => fetchWeatherData(city) ) 
}

// Fetch weather data every 5 minutes
setInterval(fetchAllWeatherData, 300000);
fetchAllWeatherData(); // Initial fetch

// Function to check alert conditions
const checkAlertConditions = (weatherData) => {
  const tempCelsius = weatherData.temp - 273.15; // Convert to Celsius

  if (tempCelsius > temperatureThreshold) {
    if (lastAlert[weatherData.city]) {
      lastAlert[weatherData.city].count += 1;
    } else {
      lastAlert[weatherData.city] = { count: 1, time: new Date() };
    }

    if (lastAlert[weatherData.city].count >= 2) {
      sendAlert(weatherData);
    }
  } else {
    lastAlert[weatherData.city] = { count: 0, time: new Date() };
  }
};

// API Endpoint to get weather data for a specific city
app.get('/api/weather', async (req, res) => {
  const city = req.query.city;
  const unit = req.query.unit || 'metric'; // Default to metric (Celsius)

  const weatherData = await Weather.find({city:city}).sort({ "dt": -1 }).limit(1)

  try {
    // Convert temperature based on the selected unit
    let temp = weatherData[0].temp;
    let feels_like = weatherData[0].feels_like;

    if (unit === 'metric') {
      temp -= 273.15; // Convert to Celsius
      feels_like -= 273.15; // Convert to Celsius
    }
    // console.log("weatherData" , weatherData );
    res.json({
      city: weatherData[0].city,
      main: weatherData[0].main,
      temp: temp.toFixed(2),
      feels_like: feels_like.toFixed(2),
      dt: weatherData[0].dt,
    });
  } catch (error) {
    res.status(500).send('Error fetching weather data');
  }
});

app.get('/api/daily-summaries', async(req, res) => {
    
  var todayDate = new Date().toISOString().slice(0, 10);
   
  const weatherData = await Weather.find({dt:{$gte: new Date(todayDate)}});

    const cityData = {};
    
    weatherData.forEach(data => 
    {
      if(!cityData[data.city]){
          cityData[data.city] = [];
      } else {
          cityData[data.city].push(data);
        
        } 
      }
  )
  res.json(getSummaries(cityData));   
}); 

const getSummaries = (citiesData) => {
  const dailySummary = {};

  Object.keys(citiesData).forEach(key => {
      let cityData = citiesData[key];
      let count = cityData.length;
      let tempSum = 0;
      let maxTemp = Number.MIN_VALUE;
      let minTemp = Number.MAX_VALUE;
      let dominantCondFreq = {};
  
      cityData.forEach(data => {
          tempSum =tempSum + data.temp;
          if(data.temp > maxTemp){
              maxTemp = data.temp;
          }
          if(data.temp < minTemp){
              minTemp = data.temp;
          }
          if(!dominantCondFreq[data.main]){
              dominantCondFreq[data.main] = 0;
          }
          dominantCondFreq[data.main]++;
      });
       console.log("count" , count);
      let dominantCondKey = '';
      let dominantCondCount = 0;
  
      Object.keys(dominantCondFreq).forEach(key => {
          if(dominantCondFreq[key] > dominantCondCount){
              dominantCondCount = dominantCondFreq[key];
              dominantCondKey = key;
          }
      })
  
      const avgTemp = tempSum / count;
      dailySummary[key] = {
          avgTemp: avgTemp ,
          maxTemp: maxTemp,
          minTemp: minTemp,
          main: dominantCondKey
            };
        });

       return dailySummary;
}
  
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
