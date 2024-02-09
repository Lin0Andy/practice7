# Weather and Environmental Monitoring Web Application

Welcome to the Weather and Environmental Monitoring Web Application! This application allows users to monitor weather conditions, air quality, and access news articles conveniently. It is built using Node.js and utilizes various libraries and APIs for weather data, air quality data, and news retrieval.

## Installation and Usage

To use the application, follow these steps:

1. **Clone the repository to your local machine:**
<p>git clone <repository_url></p>

2. **Install dependencies using npm:**
<p>npm install</p>

3. **Create a `.env` file in the root directory and provide the necessary environment variables:**
<p>GOOGLE_MAPS_API_KEY=</p>
<p>GEOCODE_KEY=</p>
<p>NEWS_API_KEY=</p>
<p>WEATHER_API=</p>
<p>THIRD_API_KEY=</p>
<p>MONGODB_API=</p>
<p>URL_ENDPOINT=</p>
<p>MONGODB_CON_STR=</p>
<p>SESSION_SECRET=""</p>

4. **Run the application:**
<p>npm start</p>

5. **Access the application in your browser at [http://localhost:3000](http://localhost:3000).**

## Overview

The application offers the following features:

- **Weather Monitoring**: Users can check the current weather conditions of any city. Weather data is retrieved from the OpenWeatherMap API.

- **Environmental Monitoring**: Users can monitor air quality in various cities. Air quality data is fetched from a third-party API.

- **News Access**: Users can access news articles filtered based on specific criteria. News articles are retrieved from the NewsAPI.org service.

- **User Authentication**: The application supports user authentication, allowing users to sign up, log in, and log out. Admin users can manage other users' accounts.

## Libraries and APIs Used

- **Express.js**: Used for building the web server and handling HTTP requests.
- **Mongoose**: MongoDB object modeling tool for Node.js, used for interacting with the MongoDB database.
- **dotenv**: For loading environment variables from the `.env` file.
- **ejs**: Templating engine for rendering dynamic content in views.
- **express-session**: Middleware for managing user sessions.
- **body-parser**: Middleware for parsing incoming request bodies.
- **request**: Simplified HTTP client for making requests to external APIs.
- **OpenWeatherMap API**: Provides weather data for cities around the world.
- **NewsAPI.org**: Offers access to a wide range of news articles from various sources.
- **Third-Party API**: Used for retrieving air quality data for cities.

## Contributing

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests to improve the application.
