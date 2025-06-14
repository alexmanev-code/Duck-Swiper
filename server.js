
import express from 'express';
import path from 'path';      
import { fileURLToPath } from 'url'; 
import fetch from 'node-fetch'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = process.env.PORT || 3000;


app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));


/**
 * Route for the new landing page.
 * This will be the first page the user sees when navigating to the root URL ('/').
 */
app.get('/', (req, res) => {
    console.log('Request received for landing page (/). Rendering landing.ejs.');
    res.render('landing', { pageTitle: 'Welcome to Duck Swiper!' });
});

/**
 * Route for the Gallery page (formerly the home page).
 * Now accessed via '/gallery'.
 */
app.get('/gallery', (req, res) => {
    console.log('Request received for Gallery page (/gallery). Rendering index.ejs.');
    res.render('index', { pageTitle: 'Duck Swiper - Gallery' });
});


/**
 * Route for the Swiper (details) page.
 * When a user navigates to '/details' (e.g., by clicking a duck image from the gallery), this function is executed.
 */
app.get('/details', (req, res) => {
    console.log('Request received for Swiper page (/details). Rendering details.ejs.');
    res.render('details', { pageTitle: 'Duck Swiper - Swipe' });
});

/**
 * API Proxy Endpoint for Random Duck API.
 * This endpoint will fetch data from the external random-d.uk API
 * and forward it to the client, effectively bypassing CORS.
 */
app.get('/api/random-duck', async (req, res) => {
    const EXTERNAL_API_URL = 'https://random-d.uk/api/random';
    console.log(`Proxying request to: ${EXTERNAL_API_URL}`);
    try {
        const apiResponse = await fetch(EXTERNAL_API_URL);
        if (!apiResponse.ok) {
            console.error(`External API responded with status: ${apiResponse.status}`);
            return res.status(apiResponse.status).json({ error: `Failed to fetch from external API: ${apiResponse.statusText}` });
        }
        const data = await apiResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Error proxying random duck API request:', error);
        res.status(500).json({ error: 'Failed to fetch duck image through proxy.' });
    }
});


app.listen(port, () => {
    console.log(`Express server running at http://localhost:${port}`);
    console.log('To stop the server, press Ctrl+C');
});
