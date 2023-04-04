import axios from 'axios';

const API_KEY = '34552003-c041c4010936caa6c4fdbe25f';
const BASE_URL = `https://pixabay.com/api`;


export default class GetImagesService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.allImages = 0;
    this.totalImages = 0;
  }

  async getImages() {
    const url = `${BASE_URL}/?key=${API_KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${this.page}`;

    try {
      console.log(this);
      const response = await axios.get(url);
      const images = await response.data;

      this.allImages += images.hits.length;
      this.totalImages = images.totalHits;
      // const nextimages = await (this.page += 1);

      return images;
    } catch (error) {
      console.error(error);
    }
  }

  addPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  resetAllImages() {
    this.allImages = 0;
  }

  // get query() {
  //   return this.searchQuery;
  // }

  // set query(newQuery) {
  //   this.searchQuery = newQuery;
  // }
}
