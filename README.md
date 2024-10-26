# Realtime-weather-system
## Instructions to run
## Prerequesities
 1. openweathermap api you can get your api key from here https://openweathermap.org/
 2. MongoDB setup
### Install dependencies
1. clone the repository.
2. Open dotenv file.
3. Pate
```  
MONGO_URI="YOUR_MONGODB_URL"
OPENWEATHER_API_KEY="OPENWEATHER_API_KEY"
 ```
5. Install the dependencies
 #### In Frontend
 ```
 npx create-react-app
 ```
 #### In backend
 ```
 npm init -y
 npm install axios cors dotenv epxress mongoose
 ```
   ### Running application
   1. open terminal
   2. Run Command
   ```
   cd backend
   Node server.js
   ```
   3. open another terminal 
   4. Run Command
   ```
   cd frontend
   npm start
   ```
      
