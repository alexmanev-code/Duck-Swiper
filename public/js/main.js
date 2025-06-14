/**
 * This script handles the logic for the overview (Gallery) page.
 * It fetches a batch of random duck images and displays them in a grid.
 * It also updates the "Gallery (X)" count in the header.
 * It also displays "liked" ducks from localStorage and allows unliking them.
 */

(function () {
    document.addEventListener('DOMContentLoaded', init);
})();

async function init() {
    console.log('Gallery page loaded and initialized. (init function)');

    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const duckImagesContainer = document.getElementById('duck-images-container');
    const galleryCountElement = document.getElementById('gallery-count');
    const initialLoadingText = document.getElementById('initial-loading-text');

    if (!loadingIndicator) console.warn('Loading indicator element not found!');
    if (!errorMessage) console.warn('Error message element not found!');
    if (!errorText) console.warn('Error text element not found!');
    if (!galleryCountElement) console.warn('Gallery count element (#gallery-count) not found!');
    if (!duckImagesContainer) {
        console.error('Duck images container element (#duck-images-container) NOT FOUND! This is critical. Ducks cannot be displayed.');
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (errorText) errorText.textContent = 'Application error: Main display area not found. Please contact support.';
        if (errorMessage) errorMessage.classList.remove('hidden');
        return; 
    } else {
        console.log('Duck images container element (#duck-images-container) found.');
    }

    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');

    try {
        if (initialLoadingText) {
            initialLoadingText.remove();
            console.log('Removed initial loading text.');
        }

        duckImagesContainer.innerHTML = '';


        const likedDucks = getLikedDucks();
        console.log('Loaded liked ducks from localStorage:', likedDucks);
        let totalDucksDisplayed = 0;

        const likedDucksSection = document.createElement('div');
        likedDucksSection.className = 'col-span-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'; 
        likedDucksSection.id = 'liked-ducks-section'; 
        duckImagesContainer.appendChild(likedDucksSection);


        const likedSectionHeader = document.createElement('h2');
        likedSectionHeader.className = 'text-3xl font-bold text-blue-400 mb-6 col-span-full text-center mt-4'; 
        likedSectionHeader.textContent = 'Your Liked Ducks';
        duckImagesContainer.insertBefore(likedSectionHeader, likedDucksSection); 


        if (likedDucks.length > 0) {
            likedDucks.forEach(url => {
                addDuckImageToDocument(url, true, likedDucksSection);
                totalDucksDisplayed++;
            });
            console.log(`Displayed ${likedDucks.length} liked ducks.`);
        } else {
            const noLikedDucksMessage = document.createElement('p');
            noLikedDucksMessage.className = 'text-gray-300 text-center col-span-full mb-4'; 
            noLikedDucksMessage.id = 'no-liked-ducks-message'; 
            noLikedDucksMessage.textContent = 'No liked ducks yet. Start swiping to save your favorites!';
            likedDucksSection.appendChild(noLikedDucksMessage);
        }

        const numberOfNewRandomDucksToFetch = 8;
        console.log(`Attempting to fetch ${numberOfNewRandomDucksToFetch} new random ducks.`);

        const newRandomDuckUrls = await getRandomDuckImages(numberOfNewRandomDucksToFetch);
        console.log('Received new random duck URLs:', newRandomDuckUrls);

        const uniqueNewRandomDucks = newRandomDuckUrls.filter(url => !likedDucks.includes(url));
        console.log('Unique new random ducks to display:', uniqueNewRandomDucks);

        const randomDucksSection = document.createElement('div');
        randomDucksSection.className = 'col-span-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8'; 
        duckImagesContainer.appendChild(randomDucksSection);

        const randomSectionHeader = document.createElement('h2');
        randomSectionHeader.className = 'text-3xl font-bold text-blue-400 mb-6 col-span-full text-center mt-8';
        randomSectionHeader.textContent = 'More Ducks to Explore';
        duckImagesContainer.insertBefore(randomSectionHeader, randomDucksSection);


        if (uniqueNewRandomDucks.length > 0) {
            uniqueNewRandomDucks.forEach(url => {
                addDuckImageToDocument(url, false, randomDucksSection); 
                totalDucksDisplayed++;
            });
            console.log(`Displayed ${uniqueNewRandomDucks.length} new random ducks.`);
        } else if (likedDucks.length === 0) { 
            const noNewDucksMessage = document.createElement('p');
            noNewDucksMessage.className = 'text-gray-300 text-center col-span-full mb-4'; 
            noNewDucksMessage.textContent = 'Could not fetch new random ducks at this moment. Please try refreshing.';
            randomDucksSection.appendChild(noNewDucksMessage);
        }


        if (loadingIndicator) loadingIndicator.classList.add('hidden');

        if (galleryCountElement) {
            galleryCountElement.textContent = `Gallery (${totalDucksDisplayed})`;
        }


    } catch (error) {
        console.error('Error in init function (outer catch block):', error);

        if (loadingIndicator) loadingIndicator.classList.add('hidden');

        if (errorText) errorText.textContent = `Failed to load ducks: ${error.message}. Please try again later.`;
        if (errorMessage) errorMessage.classList.remove('hidden');

        if (duckImagesContainer) duckImagesContainer.innerHTML = '<p class="text-red-200 text-center col-span-full">Failed to load duck images. Please check your network connection or API status.</p>'; // Updated text color for dark theme
    }
}

/**
 * Function to add a single duck image element to the document.
 * This function creates a semantic <article> element, an <a> link, and an <img>.
 * @param {string} imageUrl - The URL of the duck image to display.
 * @param {boolean} isLiked - True if this duck is from the liked gallery.
 * @param {HTMLElement} targetContainer - The container to append the duck element to.
 */
const addDuckImageToDocument = (imageUrl, isLiked, targetContainer) => {
    if (!targetContainer) {
        console.error('Target container for duck images not provided!');
        return;
    }
    console.log('Attempting to add image:', imageUrl, 'Is Liked:', isLiked);

    const articleElement = document.createElement('article');
    articleElement.className = 'bg-gray-600 rounded-xl shadow-md p-4 group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative flex flex-col items-center';
    articleElement.dataset.imageUrl = imageUrl; 

    const linkElement = document.createElement('a');
    linkElement.href = `/details?img=${encodeURIComponent(imageUrl)}`;
    linkElement.className = 'block w-full text-center';

    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = 'A random duck';
    imgElement.onerror = "this.onerror=null;this.src='https://placehold.co/400x300/a78bfa/ffffff?text=No+Duck+Found'; console.error('Image failed to load:', this.src);";
    imgElement.className = 'w-full h-48 object-cover rounded-lg mb-3 transform group-hover:scale-105 transition-transform duration-300';
    imgElement.loading = 'lazy';

    const titleElement = document.createElement('h3');
    titleElement.className = 'text-xl font-semibold text-blue-300 mt-2 text-center truncate w-full';
    titleElement.textContent = 'Quack! A Random Duck';

    linkElement.appendChild(imgElement);
    linkElement.appendChild(titleElement);
    articleElement.appendChild(linkElement);

    if (isLiked) {
        const unlikeButton = document.createElement('button');
        unlikeButton.className = 'absolute top-2 right-2 p-2 bg-red-600 rounded-full text-white shadow-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center';
        unlikeButton.innerHTML = `
            <span class="text-xl leading-none">&times;</span>
            <span class="sr-only">Unlike</span>
        `;
        unlikeButton.title = 'Unlike this duck';
        unlikeButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            event.stopPropagation(); 
            unlikeDuck(imageUrl, articleElement);
        });
        articleElement.appendChild(unlikeButton);
    }

    targetContainer.appendChild(articleElement);

    console.log('Successfully appended image element for:', imageUrl);
};

/**
 * Retrieves liked duck image URLs from localStorage.
 * @returns {string[]} An array of liked duck image URLs.
 */
function getLikedDucks() {
    try {
        const likedDucks = JSON.parse(localStorage.getItem('likedDucks')) || [];
        return likedDucks;
    } catch (e) {
        console.error('Error retrieving liked ducks from localStorage:', e);
        return [];
    }
}

/**
 * Removes a duck from the liked gallery in localStorage and from the DOM.
 * @param {string} imageUrl - The URL of the duck to unlike.
 * @param {HTMLElement} duckElement - The HTML element of the duck to remove from the DOM.
 */
function unlikeDuck(imageUrl, duckElement) {
    try {
        let likedDucks = JSON.parse(localStorage.getItem('likedDucks')) || [];
        const updatedLikedDucks = likedDucks.filter(url => url !== imageUrl);
        localStorage.setItem('likedDucks', JSON.stringify(updatedLikedDucks));
        console.log('Duck unliked and removed from gallery:', imageUrl);

        if (duckElement && duckElement.parentNode) {
            duckElement.parentNode.removeChild(duckElement);
        }

        const galleryCountElement = document.getElementById('gallery-count');
        if (galleryCountElement) {
            const currentTotalDisplayed = parseInt(galleryCountElement.textContent.match(/\((\d+)\)/)[1]) || 0;
            galleryCountElement.textContent = `Gallery (${currentTotalDisplayed - 1})`;
        }

        const likedDucksSection = document.getElementById('liked-ducks-section');
        const noLikedDucksMessage = document.getElementById('no-liked-ducks-message');
        if (likedDucksSection && updatedLikedDucks.length === 0 && !noLikedDucksMessage) {
            const newMessage = document.createElement('p');
            newMessage.className = 'text-gray-300 text-center col-span-full mb-4'; 
            newMessage.id = 'no-liked-ducks-message';
            newMessage.textContent = 'No liked ducks yet. Start swiping to save your favorites!';
            likedDucksSection.appendChild(newMessage);
        }

    } catch (e) {
        console.error('Error unliking duck:', e);
    }
}

/**
 * Fetches a specified number of random duck image URLs concurrently from the API proxy.
 * This function utilizes Promise.all() for efficient parallel fetching.
 * @param {number} count - The number of random duck images to fetch.
 * @returns {Promise<string[]>} A promise that resolves to an array of duck image URLs.
 * @throws {Error} If any of the fetch operations fail.
 */
const getRandomDuckImages = async (count) => {
    const PROXY_API_URL = '/api/random-duck';
    console.log(`getRandomDuckImages: Preparing to fetch ${count} ducks from proxy: ${PROXY_API_URL}`);

    const promises = Array.from({ length: count }, () => getData(PROXY_API_URL));

    try {
        const responses = await Promise.all(promises);
        console.log('getRandomDuckImages: All proxy responses received:', responses);

        const imageUrls = responses
            .filter(res => {
                if (!res || !res.url) {
                    console.warn('getRandomDuckImages: Filtered out a response without a valid URL (missing "url" property):', res);
                    return false;
                }
                return true;
            })
            .map(res => res.url);

        if (imageUrls.length !== count) {
            console.warn(`getRandomDuckImages: Fetched ${imageUrls.length} ducks, but ${count} were requested. Some requests might have failed.`);
        }
        console.log('getRandomDuckImages: Extracted image URLs:', imageUrls);
        return imageUrls;
    } catch (error) {
        console.error('🐮 getRandomDuckImages Error: Failed to fetch all duck data concurrently:', error);
        throw new Error('Failed to fetch all duck images due to a network error or API issue.');
    }
};

/**
 * Generic function to fetch JSON data from a given URL.
 * Handles basic HTTP response checking.
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<Object>} A promise that resolves to the JSON data from the URL.
 * @throws {Error} If the HTTP response is not OK (status code not in 2xx range).
 */
const getData = async (url) => {
    console.log('getData: Fetching from:', url);
    try {
        const res = await fetch(url);
        console.log('getData: Received response for', url, 'Status:', res.status, res.ok);
        if (!res.ok) {
            const errorBody = await res.text(); 
            throw new Error(`HTTP error! Status: ${res.status} from URL: ${url}. Response body: ${errorBody.substring(0, 200)}...`);
        }
        const data = await res.json();
        console.log('getData: Parsed JSON data for', url, 'Data:', data);
        return data;
    } catch (error) {
        
        console.error(`getData Error: Failed to fetch data from ${url}:`, error);
        throw error; 
    }
};
