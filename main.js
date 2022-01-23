const APP_ID = 'e272e2b7';
const APP_KEY = 'f1e085cf9184fa7da33ace5eec4d0035';

// ======================================= MOBILE NAV STARTS ==============================

const hamburgerEl = document.querySelector('.hamburger');
const hamburgerIcon = document.querySelector('.hamburger i');
const navLinksEl = document.querySelector('.nav-links');
const allNavLinks = document.querySelectorAll('.nav-links .nav-link');
const dropdownEl = document.querySelectorAll('.dropdown ul');

const navSlide = () => {
  hamburgerEl.addEventListener('click', () => {
    // Toggle Nav
    navLinksEl.classList.toggle('show');
    // Animate Links
    allNavLinks.forEach((link, index) => {
      if (link.style.animation) {
        link.style.animation = '';
      } else {
        link.style.animation = `navLinkFade 0.5s ease forwards ${
          index / 7 + 0.3
        }s`;
      }
    });

    hamburgerIcon.classList.toggle('open');
    // Change caret sign
    if (hamburgerIcon.classList.contains('open')) {
      hamburgerIcon.style.animation = 'caretRotateUp 0.5s ease forwards';
      dropdownEl.forEach((dropdownEl) => {
        dropdownEl.classList.remove('dropdown-menu');
      });
    } else {
      hamburgerIcon.style.animation = 'caretRotateDown 0.5s ease forwards';
    }
  });
};

navSlide();

window.addEventListener('resize', () => {
  if (window.screen.width >= 768) {
    navLinksEl.classList.remove('show');
    dropdownEl.forEach((dropdownEl) => {
      dropdownEl.classList.add('dropdown-menu');
    });
  }
});

// ===================== REPOSITION FOOTER =====================================

window.addEventListener('load', () => {
  document.querySelector('footer').style.position = 'absolute';
});

// ======================================= MOBILE NAV ENDS ==============================

const foodSectionEl = document.querySelector('.food-cards-section');

// ==================== API FUNCTIONS STARTS==================================================

var state = {
  query: '',
  queryData: [],
  isCategory: false,
  category: '',
  categoryType: '',
  page: 1,
  itemsPerPage: 20,
  window: 5,
  pages: null,
  // Limit that we can get from this site is 100
  limitItems: 100,
  isAlertPresent: false,
};

// Search and find food
const searchBoxEl = document.querySelector('.search-box');
const searchInputEl = document.querySelector('.search-box input');

// Initiate Search by inbox
searchBoxEl.addEventListener('submit', (e) => {
  document.querySelector('footer').style.position = 'absolute';
  e.preventDefault();
  if (searchInputEl.value.trim().length < 1) {
    showAlert('Please enter something in the search bar');
    return;
  }
  state.isCategory = false;
  state.category = '';
  state.query = '';
  state.query = searchInputEl.value;
  searchInputEl.value = '';
  buildFoodDisplay();
});

const buildFoodDisplay = async () => {
  state.isAlertPresent = false;
  await getFoodsandPagination(state.query, state.page, state.itemsPerPage);
  if (!state.isAlertPresent) {
    displayFoods(state.queryData);
    pageButtons(state.pages);
  }
};

// Initiate category search
document.querySelectorAll('.category-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('footer').style.position = 'absolute';
    if (document.querySelector('.nav-links.show')) {
      document.querySelector('.nav-links.show').classList.remove('show');
    }
    state.isCategory = false;
    state.category = '';
    state.query = '';
    state.isCategory = true;
    state.categoryType = e.target.dataset.categoryType;
    state.category = e.target.dataset.categoryValue;
    buildFoodDisplay();
  });
});

const getFoodsandPagination = async (query, page, itemsPerPage) => {
  document.querySelector('.instructions') &&
    document
      .querySelector('.showcase-section')
      .removeChild(document.querySelector('.instructions'));

  showIsLoading();
  const trimStart = (page - 1) * itemsPerPage;
  const trimEnd = trimStart + itemsPerPage;
  let res = null;
  let pages = null;

  try {
    if (state.isCategory) {
      res = await axios.get(
        `https://api.edamam.com/search?q=${state.category}&app_id=${APP_ID}&app_key=${APP_KEY}&from=${trimStart}&to=${trimEnd}&${state.categoryType}=${state.category}`
      );
    } else {
      res = await axios.get(
        `https://api.edamam.com/search?q=${query}&app_id=${APP_ID}&app_key=${APP_KEY}&from=${trimStart}&to=${trimEnd}`
      );
    }

    const resultingData = res.data.hits;
    if (!resultingData || resultingData.length < 1) {
      showAlert('No recipes found, try something else!');
      return;
    }
    if (res.data.count < state.limitItems) {
      pages = Math.ceil(res.data.count / itemsPerPage);
    } else {
      pages = Math.ceil(state.limitItems / itemsPerPage);
    }

    state.queryData = resultingData;
    state.pages = Number(pages);
  } catch (err) {
    showAlert(err.message);
    return;
  }
};

const displayFoods = async (foods) => {
  document.querySelector('footer').style.position = '';
  let cardsGridEl = document.createElement('div');
  cardsGridEl.classList.add('grid');
  let output = '';

  foods.map((food) => {
    output += `  <div class="grid-item">
        <div class="card">
        <img
          class="card-img"
          src=${food.recipe.image}
          alt=${food.recipe.label}
        />
          <div class="card-content">
            <h1 class="card-header">${food.recipe.label}</h1>
            <div class="cta">
            <button class="card-btn ingredients-btn" 
            data-food-name="${food.recipe.label}"
            ${
              food.recipe.ingredientLines &&
              food.recipe.ingredientLines.length > 0
                ? ` data-food-ingredients="${food.recipe.ingredientLines.join(
                    ' jsbreak '
                  )}" `
                : 'data-food-ingredients="No ingredients found"'
            }  
            ${
              food.recipe.mealType && food.recipe.mealType.length > 0
                ? ` data-food-types="${food.recipe.mealType}" ${
                    food.recipe.mealType[1]
                      ? `, ${food.recipe.mealType[1]}`
                      : ''
                  } `
                : 'data-food-types="none"'
            }
            ${
              food.recipe.url
                ? ` data-food-url="${food.recipe.url}" `
                : 'data-food-url="none"'
            }
            ${
              food.recipe.calories
                ? ` data-food-calories="${food.recipe.calories}" `
                : 'data-food-calories="N/a"'
            }
            ${
              food.recipe.cuisineType && food.recipe.cuisineType > 0
                ? ` data-food-cuisine="${food.recipe.cuisineType}" `
                : 'data-food-cuisine="n/a"'
            }>Ingredients</button>
            ${
              food.recipe.url
                ? ` <a href=${food.recipe.url} target="_blank"><button class="card-btn">Full Webpage </button></a> `
                : ''
            }
     
      </div>
            <p class="subheader">
            ${
              food.recipe.mealType && food.recipe.mealType.length > 0
                ? `<span>${food.recipe.mealType[0]} ${
                    food.recipe.mealType[1]
                      ? `, ${food.recipe.mealType[1]}`
                      : ''
                  }</span>`
                : ''
            }
            ${
              food.recipe.dishType && food.recipe.dishType.length > 0
                ? ` | <span class="dishType" >${food.recipe.dishType[0]}</span>`
                : ''
            }            
            <div class="card-text">
              <ul>
              ${
                food.recipe.dietLabels && food.recipe.dietLabels.length > 0
                  ? ` <li>
                <strong>Diet Type: </strong><span>${
                  food.recipe.dietLabels[0]
                }  ${
                      food.recipe.dietLabels[1]
                        ? `, ${food.recipe.dietLabels[1]}`
                        : ''
                    }${
                      food.recipe.dietLabels[2]
                        ? `, ${food.recipe.dietLabels[2]}`
                        : ''
                    } </span>
            </li>`
                  : '<li><strong>Diet Type: </strong> n/a</li>'
              }  
              ${
                food.recipe.cuisineType && food.recipe.cuisineType.length > 0
                  ? ` <li>
                <strong>Cuisine Type: </strong><span>${food.recipe.cuisineType[0]}</span>
            </li>`
                  : '<li><strong>Cuisine Type: </strong> n/a</li>'
              }  
              ${
                food.recipe.cautions && food.recipe.cautions.length > 0
                  ? `        
                  <li>
                    <strong>Cautions: </strong><span>${food.recipe.cautions[0]}</span>
                </li>`
                  : '<li><strong>Cautions: </strong> n/a</li>'
              }           
            </ul>
          </div>      
          </div>
        </div>
        ${
          food.recipe.calories
            ? `  <div class="grid-footer">${Math.floor(
                food.recipe.calories
              )} calories</div>
            </div>`
            : '<div class="grid-footer">No calories found</div>'
        }
       `;
  });

  foodSectionEl.innerHTML = '';

  const headerEl = document.createElement('div');
  headerEl.classList.add('food-section-header');
  headerEl.innerHTML = `
  <h2><strong>Results:</strong> ${
    state.category ? state.category : state.query
  }</h2>
     <p>page: ${state.page} of ${state.pages}</p>
  `;
  foodSectionEl.insertAdjacentElement('afterbegin', headerEl);

  cardsGridEl.innerHTML = output;
  headerEl.insertAdjacentElement('afterEnd', cardsGridEl);
};

// create the buttons
const pageButtons = (pages) => {
  if (document.getElementById('pagination-wrapper')) {
    foodSectionEl.removeChild(document.getElementById('pagination-wrapper'));
  }
  const wrapper = document.createElement('div');
  wrapper.id = 'pagination-wrapper';
  let output = '';

  let maxLeft = state.page - Math.floor(state.window / 2);
  let maxRight = state.page + Math.floor(state.window / 2);

  if (maxLeft < 1) {
    maxLeft = 1;
    maxRight = state.window;
  }

  if (maxRight > pages) {
    maxLeft = pages - (state.window - 1);
    maxRight = pages;

    if (maxLeft < 1) {
      maxLeft = 1;
    }
  }

  for (let page = maxLeft; page <= maxRight; page++) {
    output += `
      <button value=${page} class="page-btn">${page}</button>
    `;
  }

  if (state.page != 1) {
    output =
      `<button value=${1} class="page-btn">&#171 First</button>` + output;
  }

  if (state.page != pages) {
    output += `<button value=${pages} class="page-btn">&#187 Last</button>`;
  }

  wrapper.innerHTML = output;
  foodSectionEl.insertAdjacentElement('beforeend', wrapper);
};

// Modal Display
const modalDisplay = (label, mealTypes, ingredients, url, calories) => {
  modalContent = `
  <div class="modal-card">
              <div class="card">

                <div class="card-content">
                <p>${Math.floor(calories)} calories</p>
                  <p class="subheader">
                    <span>${mealTypes}</span>
                  </p>
                  <div class="card-text">
                  <h3>Ingredients: </h3>
                  <ul>
                  ${ingredients
                    .map((ingredient) => {
                      return `<li><p>${ingredient.trim()}</p></li>`;
                    })
                    .join('')}
                  </ul>
                </div>
                  <button class="card-btn">
                    <a href=${url} target="_blank">Full Recipe Webpage</a>
                  </button>
                </div>
              </div>

            </div>`;

  showModal(label, modalContent);
};

document.addEventListener('click', (e) => {
  if (document.querySelector('.modal')) {
    if (!document.querySelector('.modal__inner').contains(e.target)) {
      document.body.removeChild(document.querySelector('.modal'));
    }
  }

  if (e.target.classList.contains('ingredients-btn')) {
    modalDisplay(
      e.target.dataset.foodName,
      e.target.dataset.foodTypes,
      e.target.dataset.foodIngredients.split(' jsbreak '),
      e.target.dataset.foodUrl,
      e.target.dataset.foodCalories
    );
  }

  if (e.target.classList.contains('page-btn')) {
    state.page = Number(e.target.value);
    document.querySelector('footer').style.position = 'absolute';
    buildFoodDisplay();
  }
});

// open ingredients modal when recipe clicked
function showModal(titleHtml, contentHtml) {
  const modal = document.createElement('div');

  modal.classList.add('modal');
  modal.innerHTML = `
        <div class="modal__inner">
            <div class="modal__top">
                <div class="modal__title">${titleHtml}</div>
                <button class="modal__close" type="button">
                    <span>Close <i class="fas fa-times"></i></span>
                </button>
            </div>
            <div class="modal__content">${contentHtml}</div>
            <div class="modal__bottom"></div>
        </div>
    `;

  modal.querySelector('.modal__close').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  foodSectionEl.insertAdjacentElement('afterend', modal);
}

// ============================== IS LOADING ==============================================

const showIsLoading = () => {
  foodSectionEl.innerHTML = '';
  const loadingEl = document.createElement('div');
  loadingEl.classList.add('loading-img-container');
  loadingEl.innerHTML =
    '<img class="loading-img" src="/assets/images/loading.gif" alt="loading" />';
  foodSectionEl.insertAdjacentElement('afterbegin', loadingEl);
};

// ============================== ALERTS ==============================================

const showAlert = (message) => {
  state.isAlertPresent = true;
  foodSectionEl.innerHTML = '';

  const output = `
  <div class="alert alert-animation">
  <span class="fas fa-exclamation-circle"></span>
  <span class="msg">${message}</span>
  <div class="close-btn">
     <span class="fas fa-times"></span>
  </div>
</div>
  `;
  foodSectionEl.innerHTML = output;

  document.querySelector('.close-btn').addEventListener('click', () => {
    foodSectionEl.removeChild(document.querySelector('.alert'));
  });
};
