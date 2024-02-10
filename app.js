const path = require("path");
const express = require(path.join(__dirname,"node_modules/express"));
const https = require(path.join(__dirname, "node_modules/https"));
const bodyParser = require(path.join(__dirname,'node_modules/body-parser'));
const dotenv = require(path.join(__dirname,'node_modules/dotenv'));
const ejs = require(path.join(__dirname,'node_modules/ejs'));
const session = require(path.join(__dirname,'node_modules/express-session'));
const mongoose = require(path.join(__dirname,'node_modules/mongoose'))
const {data} = require(path.join(__dirname,"node_modules/express-session/session/cookie"));
// const {request} = require("https");
const request = require(path.join(__dirname,'node_modules/request'))
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const mapToken = process.env.GEOCODE_KEY;
const atlas_con_string = process.env.MONGODB_CON_STR;
const sessionSecret = process.env.SESSION_SECRET;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('img'));
app.set('view engine', 'ejs');
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
}));

mongoose.connect(atlas_con_string)
    .then(() => console.log('Connected to MongoDB'))

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    creation_date: { type: Date, required: true },
    admin_status: { type: Boolean, required: false },
    deletion_date: { type: Date, required: false },
    update_date: { type: Date, required: false },
})
const User = mongoose.model('User', userSchema);
const weatherSchema = new mongoose.Schema({
    username: { type: String, required: true },
    city: { type: String, default: 'in wait' },
    temp: { type: Number, default: 0 },
    feels_like: { type: Number, default: 0 },
    temp_min: { type: Number, default: 0 },
    temp_max: { type: Number, default: 0 },
    condition: { type: String, default: 'not found' },
    icon: { type: String, default: 'not found' },
    pressure: { type: Number, default: 0 },
    humidity: { type: Number, default: 0 },
    lon: { type: Number, default: 0 },
    lat: { type: Number, default: 0 },
    map: { type: String, default: 'not found' },
    wind_speed: { type: Number, default: 0 },
    country_code: { type: String, default: 'not found' },
    rain: { type: String, default: '0 mm' },
    search_date: { type: Date, default: Date.now()}
});
const Weather = mongoose.model('Weather', weatherSchema);
const airPollutionSchema = new mongoose.Schema({
    user: {type: String, required: true},
    city: String,
    pollutants: [{
        name: String,
        concentration: Number,
        aqi: Number
    }],
    overall_aqi: Number,
    aqiLevel: String,
    search_date: { type: Date, default: Date.now()}
})
const AirPollution = mongoose.model('AirPollution', airPollutionSchema);
const newsSchema = new mongoose.Schema({
    user: {type: String, required: true},
    author: String,
    title: String,
    description: String,
    url: String,
    publishedAt: Date,
    content: String,
    search_date: { type: Date, default: Date.now()}
});
const News = mongoose.model('News', newsSchema);


app.get('/', (req, res) => {
    try {
        if (!req.session.username) {
            res.redirect('/login');
        } else {
            res.render('index', {
                city: '',
                temp: 0,
                feels_like: 0,
                temp_min: 0,
                temp_max: 0,
                condition: '',
                icon_cond: '',
                pressure: 0,
                humidity: 0,
                lon: 0,
                lat: 0,
                map: '',
                zoom: 9,
                wind_speed: 0,
                country_code: '',
                rain: '0 mm',
                user_status: req.session.admin_status
            });
        }
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send('Internal server error');
    }

});

app.get('/news', (req, res) => {
    if (!req.session.username) {
        res.redirect('/login');
    } else {
        res.render('news', {
            author: 'none',
            title: 'none',
            description: 'none',
            url: 'none',
            publishedAt: 'none',
            content: 'none',
            articles: ['none'],
            user_status: req.session.admin_status
        });
    }
});

app.get('/third', (req, res) => {
    if (!req.session.username) {
        res.redirect('/login');
    } else {
        res.render('third', {
            city: 'none',
            pollutants: [{
                name: 'none',
                concentration: 0,
                aqi: 0
            }],
            overall_aqi: 0,
            aqiLevel: 'none',
            user_status: req.session.admin_status
        });
    }
});

app.get('/admin', async (req, res) => {
    try {
        const users = await User.find({ deletion_date: null, username: { $ne: req.session.username } }).exec();
        res.render('admin', { users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.post('/admin/delete', async (req, res) => {
    const usernameToDelete = req.body.username;

    try {
        await User.findOneAndUpdate({ username: usernameToDelete }, {deletion_date: Date.now(), update_date: Date.now()}).exec();
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/admin/edit', async (req, res) => {
    const { username, newUsername, newPassword , newStatus } = req.body;

    try {
        const user = await User.findOne({ username: username }).exec();
        await User.findOneAndUpdate({ username: username }, { username: newUsername ? newUsername : user.username, password: newPassword ? newPassword : user.password, admin_status: newStatus ? newStatus: user.admin_status, update_date: Date.now() }).exec();
        res.redirect('/admin');
    } catch (error) {
        console.error('Error editing user:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/admin/add', async (req, res) => {
    const { newUsername, newPassword } = req.body;
    const date = Date.now();

    try {
        const newUser = new User({ username: newUsername, password: newPassword, creation_date: date, deletion_date: null, admin_status: false, update_date: null });
        await newUser.save();
        res.redirect('/admin');
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/third', function(req, res) {
    const city = req.body.city;

    request.get({
        url: 'https://api.api-ninjas.com/v1/airquality?city=' + city,
        headers: {
            'X-Api-Key': process.env.THIRD_API_KEY
        },
    }, function(error, response, body) {
        if (error) {
            return console.error('Request failed:', error);
        } else if (response.statusCode !== 200) {
            return console.error('Error:', response.statusCode, body.toString('utf8'));
        } else {
            const airQualityData = JSON.parse(body);

            const pollutants = Object.keys(airQualityData).filter(key => key !== 'overall_aqi').map(key => ({
                name: key,
                concentration: airQualityData[key].concentration,
                aqi: airQualityData[key].aqi,
            }));

            const airPollution = new AirPollution({
                user: req.session.username,
                city: city,
                pollutants: pollutants,
                overall_aqi: airQualityData.overall_aqi ? airQualityData.overall_aqi : 0,
                aqiLevel: getAqiLevel(airQualityData.overall_aqi)
            });

            airPollution.save()
                .then(() => {
                    res.render('third', { pollutants: pollutants, overall_aqi: airQualityData.overall_aqi, aqiLevel: getAqiLevel(airQualityData.overall_aqi), user_status: req.session.admin_status });
                })
                .catch(err => {
                    console.error('Error saving air pollution data:', err);
                    res.status(500).send('Internal server error');
                });
        }
    });
});

app.post('/news', function(req, res) {
    const sort = req.body.sorting;
    const date = req.body.sorting ? req.body.sorting : '2024-01-19';

    const url = 'https://newsapi.org/v2/everything?q=Apple&from=' + date + '&sortBy=' + sort + '&apiKey=' + process.env.NEWS_API_KEY;

    https.get(url, function(response) {
        let data = '';

        response.on("data", function(chunk) {
            data += chunk;
        });

        response.on("end", function() {
            try {
                const newsData = JSON.parse(data);

                if (newsData.articles && newsData.articles.length > 0) {
                    const articles = [];

                    const arr_length = Math.min(newsData.articles.length, 10);

                    for (let i = 0; i < arr_length; i++) {
                        const article = new News({
                            user: req.session.username,
                            author: newsData.articles[i].author,
                            title: newsData.articles[i].title,
                            description: newsData.articles[i].description,
                            url: newsData.articles[i].url,
                            publishedAt: newsData.articles[i].publishedAt,
                            content: newsData.articles[i].content
                        });

                        articles.push(article);
                    }

                    News.insertMany(articles)
                        .then(() => {
                            res.render('news', { articles, user_status: req.session.admin_status });
                        })
                        .catch(err => {
                            console.error('Error saving news data:', err);
                            res.status(500).send('Internal server error');
                        });
                } else if (newsData.status === "error") {
                    res.render('error', { url, user_status: req.session.admin_status });
                } else {
                    res.render('noarticles', { url, user_status: req.session.admin_status });
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
                res.status(500).send('Error parsing JSON');
            }
        });
    });
});

app.post('/weather', (req, res) => {
    const city = req.body.city;
    const zoom = req.body.zoom ? req.body.zoom : '9';

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API}&units=metric`;

    https.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            const weatherData = JSON.parse(data);
            const templatePath = path.join(__dirname, 'views', 'index.ejs');

            const location = `${weatherData.coord.lon},${weatherData.coord.lat}`;
            const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${location},${zoom},0,0/400x200?access_token=${mapToken}`;

            const icon = weatherData.weather[0].icon;
            const icon_cond = getIconCondition(icon);

            const newWeather = new Weather({
                username: req.session.username,
                city: city,
                id: icon,
                temp: weatherData.main.temp,
                feels_like: weatherData.main.feels_like,
                temp_min: weatherData.main.temp_min,
                temp_max: weatherData.main.temp_max,
                condition: weatherData.weather[0].description,
                icon_cond: icon_cond,
                pressure: weatherData.main.pressure,
                humidity: weatherData.main.humidity,
                lon: weatherData.coord.lon,
                lat: weatherData.coord.lat,
                map: mapUrl,
                zoom: zoom,
                wind_speed: weatherData.wind.speed,
                country_code: weatherData.sys.country,
                rain: (weatherData.weather[0].main === 'Rain' && weatherData.rain) ? `${weatherData.rain['1h']} mm` : '0 mm',
                search_date: Date.now()
            });

            newWeather.save()
                .then(() => {
                    res.render('index', { newWeather,
                        city: newWeather.city,
                        temp: newWeather.temp,
                        feels_like: newWeather.feels_like,
                        temp_min: newWeather.temp_min,
                        temp_max: newWeather.temp_max,
                        map: newWeather.map,
                        condition: newWeather.condition,
                        pressure: newWeather.pressure,
                        wind_speed: newWeather.wind_speed,
                        humidity: newWeather.humidity,
                        zoom: zoom,
                        lon: newWeather.lon,
                        lat: newWeather.lat,
                        country_code: newWeather.country_code,
                        rain: newWeather.rain,
                        user_status: req.session.admin_status
                    });
                })
                .catch(err => {
                    console.error('Error saving weather data:', err);
                    res.status(500).send('Internal server error');
                });
        });
    });
});

app.post('/download', async (req, res) => {
    try {
        const username = req.session.username;
        const newsRequests = await News.find({ user: username }).sort({ search_date: -1 }).limit(10);
        const weatherRequests = await Weather.find({ username: username }).sort({ search_date: -1 }).limit(5);
        const airPRequests = await AirPollution.find({ user: username }).sort({ search_date: -1 }).limit(5);


        const formattedNData = formatDataNews(newsRequests);
        const formattedWData = formatWData(weatherRequests);
        const formattedAirPData = formatAirPData(airPRequests);

        const formattedData = `${formattedWData}\n\n${formattedAirPData}\n\n${formattedNData}`;

        res.setHeader('Content-disposition', 'attachment; filename=history.txt');
        res.setHeader('Content-Type', 'text/plain');

        res.send(formattedData);
    } catch (error) {
        console.error('Error downloading history:', error);
        res.status(500).send('Internal server error');
    }
});

function formatWData(data) {
    let formattedData = 'Weather History:\n\n';
    data.forEach((item, index) => {
        formattedData += `Request ${index + 1}:\n`;
        formattedData += `City: ${item.city}\n`;
        formattedData += `Temperature: ${item.temp} °C\n`;
        formattedData += `Feels Like: ${item.feels_like} °C\n`;
        formattedData += `Condition: ${item.condition}\n`;
        formattedData += `Pressure: ${item.pressure} hPa\n`;
        formattedData += `Humidity: ${item.humidity} %\n`;
        formattedData += `Wind Speed: ${item.wind_speed} m/s\n`;
        formattedData += `Rain: ${item.rain}\n\n`;
    });
    return formattedData;
}
function formatAirPData(data) {
    let formattedData = 'Air Pollution History:\n\n';
    data.forEach((item, index) => {
        formattedData += `Request ${index + 1}:\n`;
        formattedData += `City: ${item.city}\n`;
        formattedData += `Overall AQI: ${item.overall_aqi}\n`;
        formattedData += `AQI Level: ${item.aqiLevel}\n\n`;
    });
    return formattedData;
}
function formatDataNews(data) {
    let formattedData = 'News History:\n\n';
    data.forEach((item, index) => {
        formattedData += `Author: ${item.author}\n`;
        formattedData += `Title: ${item.title}\n`;
        formattedData += `Description: ${item.description}\n`;
        formattedData += `URL: ${item.url}\n`;
        formattedData += `Published At: ${item.publishedAt}\n`;
        formattedData += `Content: ${item.content}\n\n`;
    });
    return formattedData;
}
function getIconCondition(icon) {
    const iconConditions = {
        '50n': 'mist',
        '10n': 'weak_rain',
        'unregistered': 'unregistered',
    };

    return iconConditions[icon] || 'unregistered';
}
function getAqiLevel(aqi) {
    if (aqi >= 0 && aqi <= 50) return 'Good';
    else if (aqi >= 51 && aqi <= 100) return 'Moderate';
    else if (aqi >= 101 && aqi <= 150) return 'Unhealthy for Sensitive Groups';
    else if (aqi >= 151 && aqi <= 200) return 'Unhealthy';
    else if (aqi >= 201 && aqi <= 300) return 'Very Unhealthy';
    else if (aqi >= 301 && aqi <= 500) return 'Hazardous';
    else return 'Unknown';
}


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password, deletion_date: null });
        if (user && user.deletion_date === null) {
            req.session.username = username;
            req.session.admin_status = user.admin_status;
            res.redirect('/');
        } else {
            res.send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal server error');
        } else {
            res.redirect('/');
        }
    });
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const date = Date.now()

    try {
        const user = new User({ username, password, creation_date: date, admin_status: false, deletion_date: null, update_date: null });
        await user.save();
        console.log('success')
        res.redirect('/login')
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal server error');
    }
});


app.use((req, res) => {
    res.status(404).send('404: Page not found');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app
