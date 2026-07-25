// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.getElementById('loadImagesButton');
const gallery = document.getElementById('gallery');
const factLabel = document.getElementById('spaceFact');
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeModalButton = document.getElementById('closeModalButton');

const apiKey = 'wveNMhIfuPvmGd7LDMf5gFcJj39foSBjDq4a2ZCW';
const spaceFacts = [
  'Neptune takes about 165 Earth years to orbit the Sun once.',
  'A day on Venus is longer than a year on Venus.',
  'The Sun contains more than 99% of the mass in our solar system.',
  'Mars has the largest volcano in the solar system: Olympus Mons.',
  'Jupiter has a storm that has been raging for hundreds of years.'
];

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

function showLoadingMessage() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos…</p>
    </div>
  `;
}

function showRandomFact() {
  const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  factLabel.textContent = `Did you know? ${randomFact}`;
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getVideoEmbedUrl(url) {
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  return null;
}

function createMediaMarkup(item) {
  if (item.media_type === 'video') {
    const embedUrl = getVideoEmbedUrl(item.url);
    if (embedUrl) {
      return `
        <iframe
          src="${embedUrl}"
          title="${escapeText(item.title)}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      `;
    }

    return `
      <div class="video-link-card">
        <div class="placeholder-icon">🎥</div>
        <a href="${escapeText(item.url)}" target="_blank" rel="noopener noreferrer">Open video in a new tab</a>
      </div>
    `;
  }

  return `
    <img class="gallery-image" src="${escapeText(item.url)}" alt="${escapeText(item.title)}" />
  `;
}

function openModal(item) {
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  modalMedia.innerHTML = createMediaMarkup(item);
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function renderGallery(items) {
  if (!items.length) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🛰️</div>
        <p>No space photos were found for that date range.</p>
      </div>
    `;
    return;
  }

  const galleryMarkup = items.map((item) => `
    <article class="gallery-item" tabindex="0">
      ${item.media_type === 'video' ? '<div class="gallery-media-preview">🎬</div>' : `<img class="gallery-image" src="${escapeText(item.url)}" alt="${escapeText(item.title)}" />`}
      <p class="gallery-badge">${item.media_type === 'video' ? 'Video' : 'Image'}</p>
      <p><strong>${escapeText(item.title)}</strong></p>
      <p>${escapeText(item.date)}</p>
    </article>
  `).join('');

  gallery.innerHTML = galleryMarkup;

  const galleryItems = gallery.querySelectorAll('.gallery-item');
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openModal(items[index]));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(items[index]);
      }
    });
  });
}

async function loadSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  showLoadingMessage();
  button.disabled = true;
  button.textContent = 'Loading...';

  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`);

    if (!response.ok) {
      throw new Error('The NASA API could not be reached right now.');
    }

    const data = await response.json();
    renderGallery(data);
  } catch (error) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>${escapeText(error.message)}</p>
      </div>
    `;
  } finally {
    button.disabled = false;
    button.textContent = 'Get Space Images';
  }
}

button.addEventListener('click', loadSpaceImages);
closeModalButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

showRandomFact();
loadSpaceImages();
