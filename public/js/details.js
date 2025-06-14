/**
 * This script handles the logic for the swiper (details) page.
 * It fetches a batch of random duck images and allows the user to "swipe" (navigate) through them
 * using "Skip" and "Like" buttons.
 * It includes visual feedback for "Like" (greenish tint) and "Skip" (reddish tint)
 * and dynamically updates the "Gallery (X)" count in the header.
 */

let duckImageUrls = []; 
let currentDuckIndex = 0; 

(function () {
    document.addEventListener('DOMContentLoaded', init);
})();

async function init() {
    console.log('Swiper page loaded and initialized. (init function)');

    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const currentDuckImageElement = document.getElementById('current-duck-image');
    const skipButton = document.getElementById('skip-button');
    const likeButton = document.getElementById('like-button');
    const swiperHeader = document.getElementById('swiper-header');
    const galleryCountElement = document.getElementById('gallery-count'); 

    if (!loadingIndicator) console.warn('Loading indicator element not found!');
    if (!errorMessage) console.warn('Error message element not found!');
    if (!errorText) console.warn('Error text element not found!');
    if (!currentDuckImageElement) {
        console.error('Current duck image element (#current-duck-image) NOT FOUND! Cannot display ducks.');
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (errorText) errorText.textContent = 'Application error: Image display area not found. Please contact support.';
        if (errorMessage) errorMessage.classList.remove('hidden');
        return; 
    } else {
        console.log('Current duck image element (#current-duck-image) found.');
    }
    if (!skipButton) console.warn('Skip button not found!');
    if (!likeButton) console.warn('Like button not found!');
    if (!swiperHeader) console.warn('Swiper header not found!');
    if (!galleryCountElement) console.warn('Gallery count element (#gallery-count) not found!'); 


    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');

    try {
        updateGalleryCount();

        const urlParams = new URLSearchParams(window.location.search);
        const initialImageUrl = urlParams.get('img');

        const batchSize = 5; 
        const fetchedUrls = await getRandomDuckImages(batchSize);
        console.log('Fetched initial batch of duck URLs:', fetchedUrls);

        if (fetchedUrls.length === 0) {
            throw new Error('No duck images could be fetched for swiping. Please check API status.');
        }

        if (initialImageUrl && !fetchedUrls.includes(decodeURIComponent(initialImageUrl))) {
            duckImageUrls = [decodeURIComponent(initialImageUrl), ...fetchedUrls];
            currentDuckIndex = 0; 
        } else {
            duckImageUrls = fetchedUrls;
            currentDuckIndex = 0; 
        }

        if (loadingIndicator) loadingIndicator.classList.add('hidden');

        displayCurrentDuck();

        if (skipButton) {
            skipButton.addEventListener('click', () => navigateDuck(1, 'skip')); 
        }
        if (likeButton) {
            likeButton.addEventListener('click', () => {
                if (duckImageUrls[currentDuckIndex]) {
                    saveLikedDuck(duckImageUrls[currentDuckIndex]);
                    console.log(`Liked duck saved: ${duckImageUrls[currentDuckIndex]}`);
                }
                navigateDuck(1, 'like'); 
            });
        }

    } catch (error) {
        console.error('Error in swiper init function:', error);
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (errorText) errorText.textContent = `Error loading ducks: ${error.message}`;
        if (errorMessage) errorMessage.classList.remove('hidden');
        if (swiperHeader) swiperHeader.textContent = 'Ducks Not Available';
        if (currentDuckImageElement) currentDuckImageElement.src = 'https://placehold.co/600x450/cccccc/000000?text=No+Ducks+to+Swipe';
        if (skipButton) skipButton.disabled = true;
        if (likeButton) likeButton.disabled = true;
    }
}

/**
 * Displays the duck image at the currentDuckIndex.
 */
function displayCurrentDuck() {
    const currentDuckImageElement = document.getElementById('current-duck-image');
    if (!currentDuckImageElement) return;

    if (duckImageUrls.length === 0) {
        currentDuckImageElement.src = 'https://placehold.co/600x450/cccccc/000000?text=No+Ducks+Available';
        console.warn('No duck URLs available to display.');
        return;
    }

    const imageUrl = duckImageUrls[currentDuckIndex];
    currentDuckImageElement.src = imageUrl;
    console.log('Displayed duck image:', imageUrl);
}

/**
 * Navigates to the next/previous duck in the array with visual feedback.
 * @param {number} direction - 1 for next.
 * @param {string} action - 'like' or 'skip' to determine visual feedback.
 */
async function navigateDuck(direction, action) {
    console.log(`Navigating duck: ${direction}, action: ${action}`);
    const currentImage = document.getElementById('current-duck-image');
    const swipeOverlay = document.getElementById('swipe-overlay');

    if (!currentImage || !swipeOverlay) {
        console.error('Missing elements for navigation or visual feedback.');
        return;
    }

    currentImage.classList.remove('animate-slide-left-out', 'animate-slide-right-out', 'animate-slide-in', 'filter-green-tint', 'filter-red-tint');
    swipeOverlay.classList.remove('opacity-100', 'bg-green-700', 'bg-red-700');


 
    if (action === 'like') {
        currentImage.classList.add('filter-green-tint');
        swipeOverlay.textContent = 'Liked!';
        swipeOverlay.classList.add('bg-green-700', 'opacity-100');
        updateGalleryCount(); 
    } else if (action === 'skip') {
        currentImage.classList.add('filter-red-tint'); 
        swipeOverlay.textContent = 'Skipped!';
        swipeOverlay.classList.add('bg-red-700', 'opacity-100');
    }

    currentImage.classList.add('animate-slide-left-out');


    await new Promise(resolve => setTimeout(resolve, 300));

    currentDuckIndex += direction;

    
    if (currentDuckIndex >= duckImageUrls.length) {
        console.log('End of current duck batch. Fetching more...');
        const newDucks = await getRandomDuckImages(5); 
        if (newDucks.length > 0) {
            const uniqueNewDucks = newDucks.filter(newDuck => !duckImageUrls.includes(newDuck));
            duckImageUrls = [...duckImageUrls.slice(currentDuckIndex), ...uniqueNewDucks];
            currentDuckIndex = 0; 
            console.log('New batch fetched and added. Total ducks now:', duckImageUrls.length);
        } else {
            console.warn('Could not fetch new ducks. Looping back to start.');
            currentDuckIndex = 0;
        }
    }

    currentImage.classList.remove('animate-slide-left-out', 'filter-green-tint', 'filter-red-tint');
    swipeOverlay.classList.remove('opacity-100', 'bg-green-700', 'bg-red-700');
    currentImage.classList.add('animate-slide-in'); 

    displayCurrentDuck();

    await new Promise(resolve => setTimeout(resolve, 300));
    currentImage.classList.remove('animate-slide-in');
}

/**
 * Saves a liked duck image URL to localStorage.
 * Ensures only unique URLs are stored.
 * @param {string} imageUrl - The URL of the duck image to save.
 */
function saveLikedDuck(imageUrl) {
    try {
        let likedDucks = JSON.parse(localStorage.getItem('likedDucks')) || [];
        if (!likedDucks.includes(imageUrl)) {
            likedDucks.push(imageUrl);
            localStorage.setItem('likedDucks', JSON.stringify(likedDucks));
            console.log('Duck saved to liked gallery:', imageUrl);
        } else {
            console.log('Duck already in liked gallery:', imageUrl);
        }
    } catch (e) {
        console.error('Error saving liked duck to localStorage:', e);
    }
}

/**
 * Retrieves liked duck image URLs from localStorage and updates the gallery count in the header.
 */
function updateGalleryCount() {
    const galleryCountElement = document.getElementById('gallery-count');
    if (galleryCountElement) {
        const likedDucks = JSON.parse(localStorage.getItem('likedDucks')) || [];
        galleryCountElement.textContent = `Gallery (${likedDucks.length})`;
        console.log('Updated gallery count to:', likedDucks.length);
    }
}


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
