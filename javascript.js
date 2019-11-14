var likes;
var favPeople;

window.addEventListener("hashchange", function() {
    if (location.href === "file:///C:/Users/Nikola/Desktop/Movies%20database/index.html") {
        document.querySelector(".userInterface").innerHTML = "";
        generateUserInterfaceHP();
        homePage();
    } else {
        const hash = location.hash.slice(1);
        const hashArr = hash.split("-");
        const id = hashArr[0];
        const name = hashArr[1].replace(/%20/g, " ");

        let currentName;
        if (document.querySelector(".actor-name")) {
            currentName = document.querySelector(".actor-name").childNodes[0].nodeValue;
        } else if (document.querySelector(".movie-name")) {
            currentName = document.querySelector(".movie-name").childNodes[0].nodeValue;
        } else {
            if (hashArr.length === 3) {
                personInfoSearch(id);
            } else if (hashArr.length === 2) {
                displayMovieInfoSearch(id);
            }
        }

        if (currentName !== name) {
            if (hashArr.length === 3) {
                personInfoSearch(id);
            } else if (hashArr.length === 2) {
                displayMovieInfoSearch(id);
            }
        }
    }
});

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

async function getMovies(url, classDOM) {
    const list = await fetch(`${url}`);
    const listJSON = await list.json();
    const arr = listJSON.results;
    const config = await fetch(`https://api.themoviedb.org/3/configuration?api_key=821e6e287624c7921335f083519db105`);
    const configJSON = await config.json();
    const genres = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=821e6e287624c7921335f083519db105&language=en-US`);
    const genresJSON = await genres.json();
    const genresArr = genresJSON.genres;

    const baseURL = configJSON.images.secure_base_url;
    const imgSize = configJSON.images.logo_sizes[3];

    const finalArr = moviesLoop(arr, baseURL, imgSize, genresArr, classDOM);
    
    return finalArr;
}

function generateHomePageHTML(img, title, rating, genres, classDOM, id) {
    let name = title;
    if (name.length > 30) {
        name = name.slice(0, 30);
        name += "...";
    }
    let genresArr = genres.split(",");
    let genreTest;
    if (genresArr.length > 3) {
        genresArr.splice(3);
        genreTest = genresArr.toString();
    } else {
        genreTest = genres;
    }
    let genre = genreTest.replace(/Science Fiction/g, "Sci-Fi");

    const markUp = `
        <div class="thumbnail back-color thumbnail-custom">
        <img src="${img}" alt="${name}-photo" class="img-responsive" style="height: 278px">
        <div class="caption">
            <h4 class="height-HP"><b>${name}</b></h4>
            <p>Rating: ${rating}</p>
            <p class="height-button">${genre}</p>
            <p><a class="btn btn-primary btn-block" role="button" id="${id}">See more info</a></p>
        </div>
        </div>`;
    document.querySelector(`.${classDOM}`).innerHTML += markUp;
}

function generateImgURL(baseURL, imgSize, imgPath) {
    const imgURL = baseURL + imgSize + imgPath;
    return imgURL;
}

function moviesLoop(arr, baseURL, imgSize, genresArr, classDOM) {
    let finalArr = [];
    arr.forEach(el => {
        const title = el.title;
        const rating = el.vote_average;
        const imgPath = el.poster_path;
        const imgURL = generateImgURL(baseURL, imgSize, imgPath);
        const genreIds = el.genre_ids;
        const genres = generateGenres(genresArr, genreIds);
        const id = el.id;

        const obj = {title, rating, imgURL, genres, classDOM, id};
        finalArr.push(obj);

    })
    return finalArr;
}

function generateGenres(genreArr, genreIds) {
    let genres = "";
    genreIds.forEach((el, i, arr) => {
        if (i + 1 === arr.length) {
            let index = genreArr.findIndex(elem => elem.id === el);
            genres += genreArr[index].name;
        } else {
            let index = genreArr.findIndex(elem => elem.id === el);
            genres += genreArr[index].name + ", ";   
        }
    }) 
    return genres;
};    
function homePage() {
        Promise.all([getMovies("https://api.themoviedb.org/3/movie/now_playing?api_key=821e6e287624c7921335f083519db105&language=en-US&page=1", "now-playing"),
                 getMovies("https://api.themoviedb.org/3/movie/popular?api_key=821e6e287624c7921335f083519db105&language=en-US&page=1", "popular"),
                 getMovies("https://api.themoviedb.org/3/movie/top_rated?api_key=821e6e287624c7921335f083519db105&language=en-US&page=1", "top-rated")])
            .then(response => {
                response.forEach(el => {
                    el.forEach(el => {
                        generateHomePageHTML(el.imgURL, el.title, el.rating, el.genres, el.classDOM, el.id);
                    })    
                })
                document.querySelector(".now-playing").addEventListener("click", displayInfo);
                document.querySelector(".popular").addEventListener("click", displayInfo);
                document.querySelector(".top-rated").addEventListener("click", displayInfo);
            })
}

function generateUserInterfaceHP() {
    const markUp = `             
        <div class="row">
            <div class="col-lg-12 no-padding">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h1 class="panel-title panel-title-font">Now playing <small>Movies that are being played in theaters right now</small></h1>
                    </div>
                    <div class="panel-body no-padding">
                        <div class="now-playing"></div>
                    </div>
                </div>
            </div> 
        </div>
        <div class="row">
                <div class="col-lg-12 no-padding">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h1 class="panel-title panel-title-font">Popular <small>The most popular movies currently</small></h1>
                        </div>
                        <div class="panel-body no-padding">
                            <div class="popular"></div>
                        </div>
                    </div>
                </div> 
        </div> 
        <div class="row">
                <div class="col-lg-12 no-padding">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h1 class="panel-title panel-title-font">Top rated <small>Top rated movies of all the time</small></h1>
                        </div>
                        <div class="panel-body no-padding">
                            <div class="top-rated"></div>
                        </div>
                    </div>
                </div> 
        </div>`;

        document.querySelector(".userInterface").innerHTML += markUp;
}

function init() {
    generateUserInterfaceHP();
    homePage();

    document.querySelector(".fav-movies").addEventListener("click", displayInfo);
    document.querySelector(".fav-people").addEventListener("click", personInfoCall);
    document.querySelector(".search-button").addEventListener("click", multiSearch);

    if (localStorage.getItem("favouritePeople")) {
        favPeople = JSON.parse(localStorage.getItem("favouritePeople")); 
    } else {
        favPeople = [];
    }

    if (localStorage.getItem("favouriteMovies")) {
        likes = JSON.parse(localStorage.getItem("favouriteMovies"));
    } else {
        likes = [];
    }

    if (likes.length >= 1) {
        likes.forEach(el => {
            let markUp = `<li id="${el.id}" class="favourite-item fav-movie-${el.id}">${el.movieTitle}</li>`;
            document.querySelector(".fav-movies").innerHTML += markUp;
        })
    } else {
        let markUp = `<li class="no-favourite-movie">You don't have any favourite movies.</li>`;
        document.querySelector(".fav-movies").innerHTML += markUp;
    }
    
    if (favPeople.length >= 1) {
        favPeople.forEach(el => {
            let markUp = `<li id="${el.id}" class="favourite-item fav-person-${el.id}">${el.name}</li>`;
            document.querySelector(".fav-people").innerHTML += markUp;
        })
    } else {
        let markUp = `<li class="no-favourite-people">You don't have any favourite people.</li>`;
        document.querySelector(".fav-people").innerHTML += markUp;
    }
    
};

async function getBasicInfo(id) {
    const detailsCall = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=821e6e287624c7921335f083519db105&language=en-US`);
    const detailsJSON = await detailsCall.json();
    const config = await fetch(`https://api.themoviedb.org/3/configuration?api_key=821e6e287624c7921335f083519db105`);
    const configJSON = await config.json();
    const genresCall = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=821e6e287624c7921335f083519db105&language=en-US`);
    const genresJSON = await genresCall.json();
    const genresArr = genresJSON.genres;

    const baseImgURL = configJSON.images.secure_base_url;
    const compImgSize = configJSON.images.logo_sizes[3];
    const imgSize = configJSON.images.backdrop_sizes[2];
    const imgPath = detailsJSON.poster_path;
    const imgURL = generateImgURL(baseImgURL, imgSize, imgPath);

    const genreIds = detailsJSON.genres.map(el => el.id);
    const genres = generateGenres(genresArr, genreIds);

    const title = detailsJSON.title;
    const releaseDate = detailsJSON.release_date;
    const duration = `${detailsJSON.runtime} minutes`;
    const rating = detailsJSON.vote_average;
    const voteCount = detailsJSON.vote_count;
    const description = detailsJSON.overview;

    const productionCountry = detailsJSON.production_countries[0].name;
    const productionCompany = detailsJSON.production_companies[0].name;
    const compImgPath = detailsJSON.production_companies[0].logo_path;
    const companyImg = generateImgURL(baseImgURL, compImgSize, compImgPath); 

    return {imgURL, genres, title, releaseDate, duration, rating, voteCount, productionCountry, description, productionCompany, companyImg, id};

}

async function getCast(id) {
    const castCall = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=821e6e287624c7921335f083519db105`);
    const castJSON = await castCall.json();
    const config = await fetch(`https://api.themoviedb.org/3/configuration?api_key=821e6e287624c7921335f083519db105`);
    const configJSON = await config.json();

    const imgSize = configJSON.images.logo_sizes[2];
    const imgBaseUrl = configJSON.images.secure_base_url;

    const castArrFull = castJSON.cast.map(el => {
        const name = el.name;
        const id = el.id;
        const imgPath = el.profile_path;
        const imgUrl = generateImgURL(imgBaseUrl, imgSize, imgPath);
        return {name, id, imgUrl}
    })    
    let cast = [];
    if (castArrFull.length >= 10) {
        for (i = 0; i < 10; i++) {
            cast.push(castArrFull[i]);
        }
    } else {
        for (i = 0; i < castArrFull.length; i++) {
            cast.push(castArrFull[i]);
        }
    }

    const crewArrFull = castJSON.crew.map(el => {
        const name = el.name;
        const id = el.id;
        const imgPath = el.profile_path;
        const imgUrl = generateImgURL(imgBaseUrl, imgSize, imgPath);
        const job = el.job;
        return {name, id, imgUrl, job};
    })
    let crew = [];
    if (crewArrFull.length >= 10) {
        for (i = 0; i < 10; i++) {
            crew.push(crewArrFull[i]);
        }
    } else {
        for (i = 0; i < crewArrFull.length; i++) {
            crew.push(crewArrFull[i]);
        }
    }

    return {cast, crew};

}

async function getRecommendations(id) {
    const recCall = await fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=821e6e287624c7921335f083519db105&language=en-US&page=1`);
    const recJSON = await recCall.json();
    const recArr = recJSON.results;
    recArr.splice(12);
    const config = await fetch(`https://api.themoviedb.org/3/configuration?api_key=821e6e287624c7921335f083519db105`);
    const configJSON = await config.json();
    const genresCall = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=821e6e287624c7921335f083519db105&language=en-US`);
    const genresJSON = await genresCall.json();
    const genresArr = genresJSON.genres;

    const imgURL = configJSON.images.secure_base_url;
    const imgSize = configJSON.images.logo_sizes[3];

    const recFinal = recLoop(recArr, genresArr, imgURL, imgSize);
    
    return recFinal;
    
}

function recLoop(recArr, genresArr, imgURL, imgSize) {
     let finalArr = [];
     recArr.forEach(el => {
         const id = el.id;
         const title = el.title;
         const rating = el.vote_average;
         const imgPath = el.poster_path;
         const image = generateImgURL(imgURL, imgSize, imgPath);
         const genreIds = el.genre_ids;
         const genres = generateGenres(genresArr, genreIds);

         const obj = {title, rating, image, genres, id};
         finalArr.push(obj); 
     })

     return finalArr;

}

function displayInfo(event) {
    const id = event.target.id;
    Promise.all([getBasicInfo(id), getCast(id), getRecommendations(id)]).then(response => {
        generateBasicInfoHTML(response[0]);
        generateCastNcrewInfoHTML(response[1].cast, response[1].crew); 
        generateRecHTML(response[2], "recommendations");
    });
}

function generateBasicInfoHTML(getBasic) {
    const title = getBasic.title;
    const index = likes.findIndex(el => el.movieTitle === title);

    let btnMarkUp;
    if (index !== -1) {
        btnMarkUp = `<button class="btn btn-danger btn-block drop-customize favourites-remove">Remove from favourites</button>`;
    } else {
        btnMarkUp = `<button class="btn btn-primary btn-block drop-customize favourites">Add to favourites</button>`;
    }

    let markUp = `            
        <div class="row back-color-row">
            <div class="col-lg-12 no-padding">
                <div class="panel panel-default panel-height">
                    <div class="panel-heading">
                        <h1 class="panel-title panel-title-font">Details <small>Everything you need to know about this movie</small></h1>
                    </div>
                    <div class="panel-body no-padding">
                        <div> 
                            <ul class="nav nav-tabs" role="tablist">
                            <li role="presentation" class="active"><a href="#basic-info" aria-controls="home" role="tab" data-toggle="tab">Basic info</a></li>
                            <li role="presentation"><a href="#cast-crew" aria-controls="profile" role="tab" data-toggle="tab">Cast and crew</a></li>
                            <li role="presentation"><a href="#recommendations" aria-controls="settings" role="tab" data-toggle="tab">Our recommendations</a></li>
                            </ul>
                            <div class="tab-content">
                            <div role="tabpanel" class="tab-pane fade in active" id="basic-info">
                                <div class="row">
                                    <div class="col-lg-4">
                                        <img src="${getBasic.imgURL}" alt="" class="img-responsive img-thumbnail">
                                    </div>
                                    <div class="col-lg-8">
                                        <div class="page-header bottom-margin">
                                            <h1 class="movie-name">${getBasic.title}</h1>
                                        </div>
                                        <div class="movie-basics">
                                            <p><span class="infoHeader">Genre:</span> ${getBasic.genres}</p>
                                            <p><span class="infoHeader">Release date:</span> ${getBasic.releaseDate}</p>
                                            <p><span class="infoHeader">Duration:</span> ${getBasic.duration}</p>
                                            <p><span class="infoHeader">Average rating:</span> ${getBasic.rating} (${getBasic.voteCount} votes)</p>
                                            <p><span class="infoHeader">Production country:</span> ${getBasic.productionCountry}</p>
                                            <p><span class="infoHeader">Description:</span> ${getBasic.description}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-lg-3 col-lg-offset-9 button-row">
                                        ${btnMarkUp}
                                    </div>
                                </div>    
                            </div>
                            <div role="tabpanel" class="tab-pane fade" id="cast-crew">
                                    <div class="row cast-margin">
                                        <div class="col-lg-6 compInfo">
                                            <div class="media">
                                                <div class="media-left">
                                                <a>
                                                    <img class="media-object img-rounded" src="${getBasic.companyImg}" alt="${getBasic.productionCompany} logo">
                                                </a>
                                                </div>
                                                <div class="media-body">
                                                <h2 class="media-heading">${getBasic.productionCompany}</h2>
                                                ${getBasic.productionCountry}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <h3 class="cast">CAST: </h3>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <h3 class="crew">CREW: </h3>
                                        </div>
                                    </div>
                                    <div class="row castImgs"></div>                                         
                            </div>
                            <div role="tabpanel" class="tab-pane fade" id="recommendations">
                                <div class="row recommendations"></div>           
                            </div>
                            </div>                  
                        </div>
                    </div>
                    </div>
                </div> 
            </div>  `;
    
    document.querySelector(".userInterface").innerHTML = "";  
    document.querySelector(".userInterface").innerHTML += markUp;
    document.querySelector(".cast").addEventListener("click", personInfoCall);
    document.querySelector(".crew").addEventListener("click", personInfoCall);
    location.hash = `${getBasic.id}-${getBasic.title}`;
    if (index !== -1) {
        document.querySelector(".favourites-remove").addEventListener("click", function() {
            removeFromFavourites(getBasic.title, getBasic.id);
        })
    } else {
        document.querySelector(".favourites").addEventListener("click", function() {
            addToFavourites(getBasic.title, getBasic.id);
        });
    };
}

function generateCastNcrewInfoHTML(castArr, crewArr) {
    castArr.forEach((el, i, arr) => {
        if (el) {
            let markUp = `<a class="actors" id="${el.id}">${el.name}</a>, `;
            if (i === arr.length - 1) {
                markUp = `<a class="actors" id="${el.id}">${el.name}</a>.`;
            }
            document.querySelector(".cast").innerHTML += markUp;
        }
    })

    crewArr.forEach((el, i, arr) => {
        if (el) {
            let markUp = `<a class="producers" id="${el.id}">${el.name} (${el.job})</a>, `;
            if (i === arr.length - 1) {
                markUp = `<a class="producers" id="${el.id}">${el.name} (${el.job})</a>.`;
            }
            document.querySelector(".crew").innerHTML += markUp; 
        }       
    })
    
    if (castArr.length >= 10) {
        for (i=0; i<10; i++) {
            const id = castArr[i].id;
            const img = castArr[i].imgUrl;
            const name = castArr[i].name;
            const markUp = `  
                <div class="actorImg">
                    <a class="thumbnail" data-toggle="tooltip" title="${name}">
                    <img src="${img}" alt="${name} photo" id="${id}">
                    </a>
                </div>`;
            
            document.querySelector(".castImgs").innerHTML += markUp;    
        }
    } else {
        for (i=0; i<castArr.length; i++) {
            const id = castArr[i].id;
            const img = castArr[i].imgUrl;
            const name = castArr[i].name;
            const markUp = `  
                <div class="actorImg">
                    <a class="thumbnail" data-toggle="tooltip" title="${name}">
                    <img src="${img}" alt="${name} photo" id="${id}">
                    </a>
                </div>`;
            
            document.querySelector(".castImgs").innerHTML += markUp;
        }       
    }
    document.querySelector(".castImgs").addEventListener("click", personInfoCall);

}

function generateRecHTML(recArr, classDOM) {
    recArr.forEach(el => {
        let title = el.title;
        if (title.length > 30) {
            title = title.slice(0, 30);
            title += "...";
        }
        let genresArr = el.genres.split(",");
        let genres;
        if (genresArr.length > 2) {
            genresArr.splice(2);
            genres = genresArr.toString();
        } else {
            genres = el.genres;
        }
        let genresFinal = genres.replace(/Science Fiction/g, "Sci-Fi");
        let markUp = `
            <div class="col-lg-2 rec-padding">
                <div class="thumbnail thumbnail-recomm">
                    <a  class="rec-item"><img src="${el.image}" alt="${title}" id="${el.id}" class="rec-item"></a>
                    <div class="caption">
                    <h4 class="height">${title}</h4>
                    <p>Rating: ${el.rating}</p>
                    <p>${genresFinal}</p>
                    </div>
                </div>
            </div>`;
        document.querySelector(`.${classDOM}`).innerHTML += markUp;    
    }) 
    document.querySelector(`.${classDOM}`).addEventListener("click", displayInfo);
}

async function personDetails(id) {
    const infoCall = await fetch(`https://api.themoviedb.org/3/person/${id}?api_key=821e6e287624c7921335f083519db105&language=en-US`);
    const infoJSON = await infoCall.json();
    const config = await fetch(`https://api.themoviedb.org/3/configuration?api_key=821e6e287624c7921335f083519db105`);
    const configJSON = await config.json();

    const imgBaseURL = configJSON.images.secure_base_url;
    const imgSize = configJSON.images.profile_sizes[2];
    const imgPath = infoJSON.profile_path;

    const imgURL = generateImgURL(imgBaseURL, imgSize, imgPath)
    const name = infoJSON.name;
    const birth = infoJSON.birthday;
    const placeOfBirth = infoJSON.place_of_birth;
    let gender = infoJSON.gender;
    if (gender === 2) {
        gender = "Male";
    } else {
        gender = "Female"
    };
    const popularity = infoJSON.popularity;
    const department = infoJSON.known_for_department;
    const biography = infoJSON.biography;

    return {imgURL, name, birth, placeOfBirth, gender, popularity, department, biography, id};

} 

function generatePersonDetailsHTML(person) {
    let btnMarkUp;
    const index = favPeople.findIndex(el => el.name === person.name);
    if (index === -1) {
        btnMarkUp = `<button class="btn btn-primary btn-block drop-customize fav-person">Add to favourites</button>`;
    } else {
        btnMarkUp = `<button class="btn btn-danger btn-block drop-customize fav-person-remove">Remove from favourites</button>`;
    }

    const markUp = `            
        <div class="row">
            <div class="col-lg-12 no-padding">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h1 class="panel-title panel-title-font">${person.name} <small>${person.department} department</small></h1>
                    </div>
                    <div class="panel-body no-padding">
                        <ul class="nav nav-tabs" role="tablist">
                            <li role="presentation" class="active"><a href="#basic-info" aria-controls="home" role="tab" data-toggle="tab">Basic info</a></li>
                            <li role="presentation"><a href="#movie-credits" aria-controls="profile" role="tab" data-toggle="tab">Movie credits</a></li>
                        </ul>
                        <div class="tab-content">
                            <div role="tabpanel" class="tab-pane fade in active" id="basic-info">
                                <div class="row">
                                    <div class="col-lg-4">
                                        <img src="${person.imgURL}" alt="${person.name}" class="img-responsive img-thumbnail">
                                    </div>
                                    <div class="col-lg-8">
                                        <div class="movie-basics">
                                            <p><span class="infoHeader">Full name:</span> <span class="actor-name">${person.name}</span></p>
                                            <p><span class="infoHeader">Birthday:</span> ${person.birth}</p>
                                            <p><span class="infoHeader">Place of birth:</span> ${person.placeOfBirth}</p>
                                            <p><span class="infoHeader">Gender:</span> ${person.gender}</p>
                                            <p><span class="infoHeader">Popularity:</span> ${person.popularity}</p>
                                            <p><span class="infoHeader">Department:</span> ${person.department}</p>
                                            <p><span class="infoHeader">Biography:</span> ${person.biography}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-lg-3 col-lg-offset-9 button-row">
                                        ${btnMarkUp}
                                    </div>
                                </div>    
                            </div>
                            <div role="tabpanel" class="tab-pane fade" id="movie-credits">
                                <div class="movie-credits"></div>
                            </div>
                        </div>        
                    </div>
                </div>
            </div> 
        </div>`;
    
    document.querySelector(".userInterface").innerHTML = "";
    document.querySelector(".userInterface").innerHTML += markUp; 
    location.hash = `${person.id}-${person.name}-actor`;

    if (index === -1) {
        document.querySelector(".fav-person").addEventListener("click", function() {
            favouritePerson(person.name, person.id);
        })  
    } else {
        document.querySelector(".fav-person-remove").addEventListener("click", function() {
            removeFavPerson(person.name, person.id);
        })   
    }

}

function personInfoCall(event) {
    const id = event.target.id;
    Promise.all([personDetails(id),personMovieCredits(id)]).then(response => {
        generatePersonDetailsHTML(response[0]);
        generateRecHTML(response[1], "movie-credits");
    })
}

async function personMovieCredits(id) {
    const moviesCall = await fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=821e6e287624c7921335f083519db105&language=en-US`);
    const moviesJSON = await moviesCall.json();
    const config = await fetch(`https://api.themoviedb.org/3/configuration?api_key=821e6e287624c7921335f083519db105`);
    const configJSON = await config.json();
    const genresCall = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=821e6e287624c7921335f083519db105&language=en-US`);
    const genresJSON = await genresCall.json();
    const genresArr = genresJSON.genres;

    let moviesArr;
    if (moviesJSON.cast.length < 1 || moviesJSON.cast == undefined) {
        moviesArr = moviesJSON.crew;   
    } else {
        moviesArr = moviesJSON.cast;
    }
    if (moviesArr.length > 12) {
        moviesArr.splice(12);
    }

    const imgURL = configJSON.images.secure_base_url;
    const imgSize = configJSON.images.logo_sizes[3];

    const moviesFinal = recLoop(moviesArr, genresArr, imgURL, imgSize);

    return moviesFinal;

}

function addToFavourites(movieTitle, id) {
    if (likes.length < 1) {
        document.querySelector(".no-favourite-movie").remove();
    }
    const obj = {movieTitle, id};
    likes.push(obj);
    localStorage.setItem("favouriteMovies", JSON.stringify(likes));
    
    const markUp = `<li id="${id}" class="favourite-item fav-movie-${id}">${movieTitle}</li>`;
    const btnMarkUp = `<button class="btn btn-danger btn-block drop-customize favourites-remove">Remove from favourites</button>`;

    document.querySelector(".fav-movies").innerHTML += markUp;
    document.querySelector(".favourites").remove();
    document.querySelector(".button-row").innerHTML += btnMarkUp;
    document.querySelector(".favourites-remove").addEventListener("click", function() {
        removeFromFavourites(movieTitle, id);
    });
    
}

function removeFromFavourites(movieTitle, id) {
    const index = likes.findIndex(el => el.movieTitle === movieTitle);
    likes.splice(index, 1);
    localStorage.setItem("favouriteMovies", JSON.stringify(likes));
    const btnMarkUp = `<button class="btn btn-primary btn-block drop-customize favourites">Add to favourites</button>`;

    document.querySelector(`.fav-movie-${id}`).remove();
    document.querySelector(".favourites-remove").remove();
    document.querySelector(".button-row").innerHTML += btnMarkUp;
    document.querySelector(".favourites").addEventListener("click", function() {
        addToFavourites(movieTitle, id);
    })
    if (likes.length < 1) {
        let markUp = `<li class="no-favourite-movie">You don't have any favourite movies.</li>`;
        document.querySelector(".fav-movies").innerHTML += markUp;
    }
}

function favouritePerson(name, id) {
    if (favPeople.length < 1) {
        document.querySelector(".no-favourite-people").remove();
    }
    const obj = {name, id};
    favPeople.push(obj);
    localStorage.setItem("favouritePeople", JSON.stringify(favPeople));

    const markUp = `<li id="${id}" class="favourite-item fav-person-${id}">${name}</li>`;
    const btnMarkUp = `<button class="btn btn-danger btn-block drop-customize fav-person-remove">Remove from favourites</button>`;

    document.querySelector(".fav-people").innerHTML += markUp;
    document.querySelector(".fav-person").remove();
    document.querySelector(".button-row").innerHTML += btnMarkUp;
    document.querySelector(".fav-person-remove").addEventListener("click", function() {
        removeFavPerson(name, id);
    });
}

function removeFavPerson(name, id) {
    const index = favPeople.findIndex(el => el.name === name);
    favPeople.splice(index, 1);
    localStorage.setItem("favouritePeople", JSON.stringify(favPeople));
    const btnMarkUp = `<button class="btn btn-primary btn-block drop-customize fav-person">Add to favourites</button>`;

    document.querySelector(`.fav-person-${id}`).remove();
    document.querySelector(".fav-person-remove").remove();
    document.querySelector(".button-row").innerHTML += btnMarkUp;
    document.querySelector(".fav-person").addEventListener("click", function() {
        favouritePerson(name, id);
    })

    if (favPeople.length < 1) {
        let markUp = `<li class="no-favourite-people">You don't have any favourite people.</li>`;
        document.querySelector(".fav-people").innerHTML += markUp;
    }
}

async function multiSearch() {
    const query = document.querySelector(".search").value;
    const searchCall = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=821e6e287624c7921335f083519db105&language=en-US&query=${query}&page=1&include_adult=false`);
    const searchJSON = await searchCall.json();
    const mediaType = searchJSON.results[0].media_type;
    const id = searchJSON.results[0].id;

    if (mediaType === "person") {
        personInfoSearch(id);
    } else if (mediaType === "movie") {
        displayMovieInfoSearch(id);
    }
}

function personInfoSearch(id) { 
    Promise.all([personDetails(id),personMovieCredits(id)]).then(response => {
        generatePersonDetailsHTML(response[0]);
        generateRecHTML(response[1], "movie-credits");
    })
}

function displayMovieInfoSearch(id) {
    Promise.all([getBasicInfo(id), getCast(id), getRecommendations(id)]).then(response => {
        generateBasicInfoHTML(response[0]);
        generateCastNcrewInfoHTML(response[1].cast, response[1].crew); 
        generateRecHTML(response[2], "recommendations");
    });
}