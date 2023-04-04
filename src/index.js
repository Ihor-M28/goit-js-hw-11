import Notiflix from 'notiflix';
import GetImagesService from './image-service';
import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('#search-form'),
  pictureContainer: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  imagesGallery: document.querySelector('.gallery'),
};

const getImagesService = new GetImagesService();

refs.searchForm.addEventListener('submit', onFormSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onFormSearch(evt) {
  evt.preventDefault();
  refs.loadMoreBtn.disabled = false;

  getImagesService.searchQuery = evt.currentTarget.elements.searchQuery.value;

  if (getImagesService.searchQuery === '') {
    refs.loadMoreBtn.classList.add('is-hidden');
    clearGalleryMarkup();
    return Notiflix.Notify.warning(`Enter a search name, please!`);
  }

  clearGalleryMarkup();
  
  refs.loadMoreBtn.classList.add('is-hidden');
  getImagesService.resetPage();
  getImagesService.resetAllImages();
  refs.loadMoreBtn.disabled = false;
  refs.loadMoreBtn.textContent = 'Load more';

  getImagesService.getImages().then(images => {
    clearGalleryMarkup();
    addGalleryMarkup(images);

    if (images.hits.length === 0) {
      refs.loadMoreBtn.classList.add('is-hidden');
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      refs.loadMoreBtn.classList.remove('is-hidden');
      Notiflix.Notify.info(`Hooray! We found ${images.totalHits} images.`);
    }

    simpleLightbox();
  });
}

async function onLoadMore() {
  getImagesService.addPage();

  await getImagesService.getImages().then(images => {
    addGalleryMarkup(images);

    simpleLightbox();
    smoothScroll();

    if (getImagesService.allImages === getImagesService.totalImages) {
      refs.loadMoreBtn.disabled = true;
      refs.loadMoreBtn.textContent = 'End of content';
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
  refs.imagesGallery.insertAdjacentHTML('beforeend', createImageMarkup(images));
}

function clearGalleryMarkup() {
  refs.imagesGallery.innerHTML = '';
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

// async function checkPosition() {
//   // Нам потребуется знать высоту документа и высоту экрана:
//   const height = document.body.offsetHeight;
//   const screenHeight = window.innerHeight;

//   // Они могут отличаться: если на странице много контента,
//   // высота документа будет больше высоты экрана (отсюда и скролл).

//   // Записываем, сколько пикселей пользователь уже проскроллил:
//   const scrolled = window.scrollY;

//   // Обозначим порог, по приближении к которому
//   // будем вызывать какое-то действие.
//   // В нашем случае — четверть экрана до конца страницы:
//   const threshold = height - screenHeight / 4;

//   // Отслеживаем, где находится низ экрана относительно страницы:
//   const position = scrolled + screenHeight;

//   if (position >= threshold) {
//     // Если мы пересекли полосу-порог, вызываем нужное действие.
//    onLoadMore();
//   }

// }
// (() => {
//   window.addEventListener('scroll', checkPosition);
//   // window.addEventListener('resize', checkPosition);
// })();
