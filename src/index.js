import Notiflix from 'notiflix';
import GetImagesService from './image-service';
import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const ref = {
  searchForm: document.querySelector('#search-form'),
  pictureContainer: document.querySelector('.gallery'),
  loadingProgressBtn: document.querySelector('.loading-progress'),
  imagesGallery: document.querySelector('.gallery'),
};

const getImagesService = new GetImagesService();

ref.searchForm.addEventListener('submit', onFormSearch);
ref.loadingProgressBtn.addEventListener('click', onloadingProgress);

function onFormSearch(evt) {
  evt.preventDefault();
  ref.loadingProgressBtn.disabled = false;

  getImagesService.searchQuery = evt.currentTarget.elements.searchQuery.value;

  if (getImagesService.searchQuery === '') {
    ref.loadingProgressBtn.classList.add('is-hidden');
    clearGalleryMarkup();
    return Notiflix.Notify.warning(`Enter a search name, please!`);
  }

  clearGalleryMarkup();
  
  ref.loadingProgressBtn.classList.add('is-hidden');
  getImagesService.resetPage();
  getImagesService.resetAllImages();
  ref.loadingProgressBtn.disabled = false;
  ref.loadingProgressBtn.textContent = 'Loading progress';

  getImagesService.getImages().then(images => {
    clearGalleryMarkup();
    addGalleryMarkup(images);

    if (images.hits.length === 0) {
      ref.loadingProgressBtn.classList.add('is-hidden');
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      ref.loadingProgressBtn.classList.remove('is-hidden');
      Notiflix.Notify.info(`Hooray! We found ${images.totalHits} images.`);
    }

    simpleLightbox();
  });
}

async function onloadingProgress() {
  getImagesService.addPage();

  await getImagesService.getImages().then(images => {
    addGalleryMarkup(images);

    simpleLightbox();
    smoothScroll();

    if (getImagesService.allImages === getImagesService.totalImages) {
      ref.loadingProgressBtn.disabled = true;
      ref.loadingProgressBtn.textContent = 'End of content';
    }
  });
}

function createImageMarkup(images) {
  return images.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
          <div class="photo-card" data-infinite-scroll='{ "path": ".pagination__next", "append": ".post", "history": false }'>
            <div class="img-container">
              <a class="img-link" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" />
              </a>
            </div>
            <div class="info">
              <p class="info-item">
                <b>Likes</b>${likes}
              </p>
              <p class="info-item">
                <b>Views</b>${views}
              </p>
              <p class="info-item">
                <b>Comments</b>${comments}
              </p>
              <p class="info-item">
                <b>Downloads</b>${downloads}
              </p>
            </div>
          </div>`;
      }
    )
    .join('');
}

function addGalleryMarkup(images) {
  ref.imagesGallery.insertAdjacentHTML('beforeend', createImageMarkup(images));
}

function clearGalleryMarkup() {
  ref.imagesGallery.innerHTML = '';
}

function simpleLightbox() {
  var lightbox = new SimpleLightbox('.img-link', {
    captionsData: 'alt',
    captionDelay: 250,
  }).refresh();
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}


