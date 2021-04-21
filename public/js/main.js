let homeHtml = "/snippets/home-snippet.html",
    collectionsHtml = "/snippets/coll-snippet.html",
    collectionsTitleHtml = "/snippets/coll-title-snippet.html",
    singleCollectionHtml = "/snippets/single-coll-snippet.html",
    singleCollectionTitleHtml = "/snippets/single-coll-title-snippet.html",
    singleItemHtml = "/snippets/single-item-snippet.html",
    loginHtml = "/snippets/login-snippet.html",
    reviewHtml = "/snippets/review-snippet.html",
    singleReviewHtml = "/snippets/single-review-snippet.html",
    searchHtml = "/snippets/search-snippet.html",
    addHtml = "/snippets/add-snippet.html",
    userCollHtml = "/snippets/user-coll-snippet.html",
    userSingleCollHtml = "/snippets/single-user-coll-snippet.html",
    userSingleItemHtml = "snippets/single-user-item-snippet.html";

let content = document.getElementById('main-content');
asyncCall = (fileUrl) => fetch(fileUrl)
    .then(response => response.text());

// const asyncCall = async(page) => {
//     const response = await fetch(page);
//     const resHtml = await response.text();
//     return resHtml;
// }

let home = asyncCall(homeHtml),
    collections = asyncCall(collectionsHtml),
    collectionsTitle = asyncCall(collectionsTitleHtml),
    singleCollection = asyncCall(singleCollectionHtml),
    singleCollectionTitle = asyncCall(singleCollectionTitleHtml),
    singleTea = asyncCall(singleItemHtml),
    logIn = asyncCall(loginHtml),
    review = asyncCall(reviewHtml),
    singleReview = asyncCall(singleReviewHtml),
    search = asyncCall(searchHtml),
    addTea = asyncCall(addHtml),
    userCollections = asyncCall(userCollHtml),
    userSingleCollection = asyncCall(userSingleCollHtml),
    userSingleItem = asyncCall(userSingleItemHtml);


const routes = {
    '/home': home,
    // '/about' : about,
    '/collections': collections,
    '/collections/{{name}}': singleCollection,
    '/collections/{{name}}/{{tea_name}}': singleTea,
    '/users-tea': userCollections,
    '/users-tea/{{name}}': userSingleCollection,
    '/users-tea/{{name}}/{{tea_name}}': userSingleItem,
    '/login': logIn,
    '/search?tea={{search_tea}}&collection={{name}}': search,
    '/add': addTea
};

// document.addEventListener("DOMContentLoaded", function (event) {//     
//     console.log('we r here')//     
// })

const loadCollections = (dataHtml, content, title) => {
    database.ref('collections').on("value", function (snapshot) {
        title.then(titleHtml => {
            let finalHtml = titleHtml;
            finalHtml += "<article class='row'>";
            snapshot.forEach(function (data) {
                let html = dataHtml;
                let name = data.val().name;
                let img_name = data.val().img_name;
                html = insertProperty(html, 'name', name);
                html = insertProperty(html, 'img_name', img_name);
                finalHtml += html;
            });
            finalHtml += '</article>';
            content.innerHTML = finalHtml;
        });
    });
}

const loadSingleCollection = (dataHtml, content, name, title) => {
    database.ref(name).on("value", function (snapshot) {
        title.then(titleHtml => {
            let finalHtml = titleHtml;
            finalHtml = insertProperty(finalHtml, 'name', name);
            finalHtml += "<article class='row'>";
            snapshot.forEach(function (data) {
                if (data.key == "Users") {
                    return   
                }
                let html = dataHtml;
                html = insertProperty(html, 'tea_name', data.key);
                html = insertProperty(html, 'name', name);
                html = insertProperty(html, 'cost', data.val().cost);
                database.ref(name + '/' + data.key + '/reviews').on("value", function(reviews) {
                    let markCount = reviews.numChildren();
                    if (markCount) {
                        html = insertProperty(html, 'count', markCount);
                    }
                    else {
                        html = insertProperty(html, 'count', 0);
                    }
                });
                
                finalHtml += html;
            });
            finalHtml += '</article>';
            content.innerHTML = finalHtml;
            snapshot.forEach(function (data) {
                if (data.key == "Users") {
                    return   
                }
                let stars = document.querySelectorAll('#' + data.key + ' span');
                showRating(name, data.key, stars) 
            });            
                
        });
    });
}

const loadUserSingleColleciton = (dataHtml, content,  name, title) => {
    database.ref(name + '/Users').on("value", function (snapshot) {
        title.then(titleHtml => {
            let finalHtml = titleHtml;
            finalHtml = insertProperty(finalHtml, 'name', name);
            finalHtml += "<article class='row'>";
            snapshot.forEach(function (data) {
                let html = dataHtml;
                html = insertProperty(html, 'tea_name', data.key);
                html = insertProperty(html, 'name', name);
                html = insertProperty(html, 'cost', data.val().cost)
                html = insertProperty(html, 'img_url', data.val().link);
                database.ref(name + '/Users/' + data.key + '/reviews').on("value", function(reviews) {
                    let markCount = reviews.numChildren();
                    if (markCount) {
                        html = insertProperty(html, 'count', markCount);
                    }
                    else {
                        html = insertProperty(html, 'count', 0);
                    }
                });
                finalHtml += html;
            });
            finalHtml += '</article>';
            content.innerHTML = finalHtml;
            snapshot.forEach(function (data) {
                let stars = document.querySelectorAll('#' + data.key + ' span');
                showRating(name, data.key, stars, "Users") 
            });
        });
    });
}

const loadSingleTea = (dataHtml, content, name, teaName) => {
    database.ref(name + '/' + teaName).on("value", function (snapshot) {
        let finalHtml = '<article id="single-unit" class="row flex-wrap-space">';
        finalHtml += dataHtml;
        finalHtml = insertProperty(finalHtml, 'name', name);
        finalHtml = insertProperty(finalHtml, 'tea_name', snapshot.key);
        database.ref(name + '/' + snapshot.key + '/reviews').on("value", function(reviews) {
            let markCount = reviews.numChildren();
            if (markCount) {
                finalHtml = insertProperty(finalHtml, 'count', markCount);
            }
            else {
                finalHtml = insertProperty(finalHtml, 'count', 0);
            }
        });
        finalHtml = insertProperty(finalHtml, 'cost', snapshot.val().cost);
        finalHtml = insertProperty(finalHtml, 'brand', snapshot.val().brand);
        finalHtml = insertProperty(finalHtml, 'item_form', snapshot.val().item_form);
        finalHtml = insertProperty(finalHtml, 'origin', snapshot.val().origin);
        finalHtml = insertProperty(finalHtml, 'energy', snapshot.val().energy);
        finalHtml = insertProperty(finalHtml, 'steeping', snapshot.val().steeping);
        finalHtml = insertProperty(finalHtml, 'temperature', snapshot.val().temperature);
        finalHtml += '</article>'
        content.innerHTML = finalHtml;
        let targetElem = document.querySelector('#fact-list');
        for (let i = 0; i < snapshot.val().facts.length; i++) {
            let li = document.createElement('li');
            li.innerHTML = snapshot.val().facts[i];
            targetElem.appendChild(li)
        }
    });
}

const loadUserSingleTea = (dataHtml, content, name, teaName) => {
    database.ref(name + '/Users/' + teaName).on("value", function (snapshot) {
        let finalHtml = '<article class="row flex-wrap-space">';
        finalHtml += dataHtml;
        finalHtml = insertProperty(finalHtml, 'name', name);
        finalHtml = insertProperty(finalHtml, 'tea_name', snapshot.key);
        finalHtml = insertProperty(finalHtml, 'cost', snapshot.val().cost);
        finalHtml = insertProperty(finalHtml, 'img_url', snapshot.val().link);
        finalHtml = insertProperty(finalHtml, 'place', snapshot.val().place);
        finalHtml = insertProperty(finalHtml, 'description', snapshot.val().description);
        finalHtml += '</article>'
        content.innerHTML = finalHtml;
    });
}

const loadReviewSection = (request, users) => {
    let targetElem = document.querySelector('#main-content');
    review.then(reviewSection => {
        reviewSection = insertProperty(reviewSection, 'name', request.collection);
        reviewSection = insertProperty(reviewSection, 'tea_name', request.tea);
        if (users) {
            reviewSection = insertProperty(reviewSection, 'users', users);
        }
        targetElem.insertAdjacentHTML('beforeend', reviewSection);
    })
}

const loadAllReviews = (name, teaName, users) => {
    let dbRef = (users ? database.ref(name + '/Users/' + teaName + '/reviews') : 
                database.ref(name + '/' + teaName + '/reviews'));
    dbRef.on("value", function (snapshot) {
        singleReview.then(dataHtml => {
            let finalHtml = '';
            snapshot.forEach(function (data) {
                let html = dataHtml;
                html = insertProperty(html, 'date', data.val().date);
                html = insertProperty(html, 'rev_title', data.val().title);
                html = insertProperty(html, 'rev_content', data.val().content);
                html = insertProperty(html, 'email', data.val().email);
                html = insertProperty(html, 'displayName', data.val().username);
                html = insertProperty(html, 'key', data.key);
                finalHtml += html;
            });
            let targetElem = document.querySelector('#input-review-container');
            console.log('final:' + targetElem)
            if (targetElem && finalHtml) {
                targetElem.insertAdjacentHTML('beforeend', finalHtml);
                snapshot.forEach(function (data) {
                    let stars = document.querySelectorAll('#' + data.key + ' .review-rate span')
                    for (let i = 0; i < data.val().rating; i++) {
                        stars[i].classList.add('active');
                    }
                });
            }
        });
    });
}

const loadSearch = (dataHtml, teaName) => {
    dataHtml = insertProperty(dataHtml, 'search_tea', teaName);
    content.innerHTML = dataHtml;
}

const parseURL = () => {
    let url = location.hash.slice(1) || '/';
    let r = '';
    let request = {
        resource: null,
        collection: null,
        tea: null
    };
    if (url.includes('&')) {
        r = url.split("&");
        console.log('r[0]:' + r[0])
        request.resource = r[0].split("?")[0].split("/")[1]
        request.collection = r[1].split("=").pop()
        request.tea = r[0].split("=").pop()
    }
    else {
        r = url.split("/");
        request.resource = r[1];
        request.collection = r[2];
        request.tea = r[3];
    }
    console.log('r:' + r)



    return request
}

const showRating = (name, teaName, stars, users) => {
    let dbRef = (users ? database.ref(name + '/Users/' + teaName + '/reviews') : 
                database.ref(name + '/' + teaName + '/reviews'));
    dbRef.on("value", function (snapshot) {
        let sumRating = 0,
            markCount = snapshot.numChildren();
        snapshot.forEach(function (data) {
            sumRating += parseInt(data.val().rating);
        });
        sumRating /= markCount;
        
        for (let i = 0; i < stars.length; i++) {
            if (sumRating >= i + 0.5) {
                stars[i].classList.add('active');
            }
            else {
                break;
            }
        }
    });
}

const getReviewRating = () => {
    let rateStars = document.getElementsByName('rating');
    let rate;
    for (let star of rateStars) {
        if (star.checked) {
            rate = star.value;
            break;
        };
    };
    return rate;
}

const writeReview = (name, teaName, users) => {
    let user = firebase.auth().currentUser;
    if (user) {
        let titleReview = document.getElementById('review-title'),
            userReview = document.getElementById('review-input');
        let rate = getReviewRating();
        if ((titleReview && titleReview.value) && (userReview && userReview.value) && rate) {
            console.log('user:' + users);
            let dbRef = (users=='{{users}}' ? database.ref(name + '/' + teaName + '/reviews') : database.ref(name + '/Users/' + teaName + '/reviews'))
            dbRef.push({
                title: titleReview.value,
                content: userReview.value,
                rating: rate,
                date: new Date().toLocaleString(),
                username: user.displayName,
                email: user.email
            });
        }
        else {
            alert('Error: please, fill in all the fields.')
        }
    }
    else {
        onNavigate('#/login');
    }

}

const loadPage = () => {
    let request = parseURL();
    console.log('coll:' + request.collection + ', tea:' + request.tea + ', res:' + request.resource)
    let parsedURL = (request.resource ? '/' + request.resource : '/') +
        (request.resource == 'search' ? '?tea={{search_tea}}&collection={{name}}' : (request.collection ? '/{{name}}' : '') +
            (request.tea ? '/{{tea_name}}' : ''));
    let stars;
    console.log('parsedURL:' + parsedURL)
    if (parsedURL in routes) {
        showLoading('#main-content')
        routes[parsedURL].then(dataHtml => {
            switch (parsedURL) {
                case '/collections':
                    loadCollections(dataHtml, content, collectionsTitle);
                    break;
                case '/users-tea':
                    loadCollections(dataHtml, content, collectionsTitle);
                    break;
                case '/collections/{{name}}':
                    loadSingleCollection(dataHtml, content, request.collection, singleCollectionTitle);
                    break;
                case '/users-tea/{{name}}':
                    loadUserSingleColleciton(dataHtml, content, request.collection, singleCollectionTitle);
                    break;
                case '/collections/{{name}}/{{tea_name}}':
                    loadSingleTea(dataHtml, content, request.collection, request.tea);
                    stars = document.querySelectorAll('.rating-result span');
                    showRating(request.collection, request.tea, stars);
                    loadReviewSection(request);
                    loadAllReviews(request.collection, request.tea);
                    break;
                case '/users-tea/{{name}}/{{tea_name}}':
                    loadUserSingleTea(dataHtml, content, request.collection, request.tea);
                    stars = document.querySelectorAll('.rating-result span');
                    showRating(request.collection, request.tea, stars, 'Users');
                    loadReviewSection(request, 'Users');
                    loadAllReviews(request.collection, request.tea, 'Users');
                    break;
                case '/search?tea={{search_tea}}&collection={{name}}':
                    console.log('WE R HERE')
                    loadSearch(dataHtml, request.tea);
                    break;
                default:
                    content.innerHTML = dataHtml;
                    break;
            }
        });
    }
}

const getSearchedItems = (inputCollection, teaText, urn, htmlPromise, users) => {
    database.ref(urn).on("value", function (snapshot) {        
        let finalHtml = "";
        let matches = [];
        htmlPromise.then(dataHtml => {             
            snapshot.forEach(function (data) {
                let teaNameLow = data.key.toLowerCase();
                if (data.key == "Users") {
                    return
                }                
                if (teaNameLow.includes(teaText) || teaText.includes(teaNameLow)) {
                    let html = dataHtml;
                    html = insertProperty(html, 'tea_name', data.key);
                    html = insertProperty(html, 'name', inputCollection);
                    if (users) {
                        html = insertProperty(html, 'img_url', data.val().link);
                    }
                    finalHtml += html;
                    matches.push(teaNameLow);
                }
            });
            if (matches.length == 0) {
                let targetElem = (users ? document.querySelector('#no-matches-users') : document.querySelector('#no-matches-our'));
                targetElem.style.display = "block";
            }
            console.log(finalHtml)
            let targetElem = document.querySelector('#search-res');
            targetElem.insertAdjacentHTML('afterbegin', finalHtml);
            
        });
    });
}

const searchTea = () => {
    let inputTea = document.getElementById('search-bar').value,
        inputCollection = document.getElementById('collection-select').value;
    let teaText = inputTea.trim().toLowerCase();
    if (teaText == "") {
        return;
    }

    if (teaText.length < 3) {
        alert("Please, use a longer string.");
        return;
    }
    onNavigate('#/search?tea=' + teaText + '&collection=' + inputCollection);
    getSearchedItems(inputCollection, teaText, inputCollection, singleCollection);
    getSearchedItems(inputCollection, teaText, inputCollection + '/Users', userSingleCollection, 'Users');    
}

let files = []
const showImg = (event) => {
    let reader;
    event.currentTarget.onchange = event => {
        files = event.target.files;
        reader = new FileReader();
        let photo = document.getElementById("tea-photo");
        reader.onload = () => {
            photo.src = reader.result;
        }
        reader.readAsDataURL(files[0]);
    }
}

const addNewTea = () => {
    let teaName = document.getElementById("new-tea-name"),
        teaColl = document.getElementById("new-tea-collection"),
        teaPrice = document.getElementById("new-tea-price"),
        teaDescription = document.getElementById("new-tea-description"),
        teaPlace = document.getElementById("new-tea-place");
    let user = firebase.auth().currentUser
    if ((teaName && teaName.value) && (teaPrice && teaPrice.value) &&
        (teaDescription && teaDescription.value)) {
        let imgUrl = '';
        let uploadTask;   
        database.ref(teaColl.value + '/Users/' + teaName.value).set({
            cost: teaPrice.value,
            place: teaPlace.value,
            description: teaDescription.value,
            email: user.email,
            username: user.displayName,
            uid: user.uid
        });
        console.log('photo:' + files[0])
        if (files[0]) {
            uploadTask = firebase.storage().ref('images/' + user.uid + '/' + teaName.value).put(files[0]);            
            uploadTask.on('state_changed', function () {
                uploadTask.snapshot.ref.getDownloadURL().then(function (url) {
                    imgUrl = url;
                    firebase.database().ref(teaColl.value + '/Users/' + teaName.value).update({
                        link: imgUrl
                    });
                });
            });
        }
        alert("Success!");        
    }
    else {
        alert("Please, fill in name, price and description.")
        return
    }



}

const onNavigate = (pathname) => {
    window.history.pushState(
        {},
        pathname,
        window.location.origin + pathname
    );
    loadPage();
}

window.onpopstate = () => {
    loadPage();
}

window.onbeforeunload = () => {
    loadPage();
}

const insertHtml = (selector, html) => {
    let targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
}

const insertProperty = (string, propName, propValue) => {
    let propToReplace = "{{" + propName + "}}";
    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    return string;
}

const showLoading = (selector) => {
    let html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html)
}

showLoading("#main-content");
onNavigate('#/home');