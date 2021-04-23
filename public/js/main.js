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
    '/': home,
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

const loadHomeTea = (htmlPromise, selector, fourMostRated, users) => {
    htmlPromise.then(async (itemHtml) => {
        let finalHtml = "";
        for (let item of fourMostRated) {
            let tea = await getTea(item[1], item[0], users);
            let html = itemHtml;
            html = insertProperty(html, 'tea_name', item[0]);
            html = insertProperty(html, 'id_tea_name', item[0].replace(' ', ''));
            html = insertProperty(html, 'name', item[1]);
            html = insertProperty(html, 'cost', tea.cost);
            let markCount;
            if (users) {
                html = insertProperty(html, 'img_url', tea.link);
            }
            markCount = await getReviewCount(item[1], item[0], users);
            if (markCount) {
                html = insertProperty(html, 'count', markCount);
            }
            else {
                html = insertProperty(html, 'count', 0);
            }
            finalHtml += html;
        }
        let targetElem = document.querySelector(selector);
        if (targetElem) targetElem.insertAdjacentHTML('beforeend', finalHtml);
        fourMostRated.forEach((item) => {
            let stars = document.querySelectorAll('#' + item[0].replace(' ', '') + ' span');
            showRating(item[1], item[0], stars, users);
        });

    });
}

const loadHome = async () => {
    let colls = await getCollections();
    let mostRated = [], mostRatedUser = [];
    for (let coll in colls) {
        for (let item in await getOrderedItems(coll)) {
            mostRated.push([item, coll, await getRating(coll, item)])
        }
        for (let item in await getOrderedItems(coll, "Users")) {
            mostRatedUser.push([item, coll, await getRating(coll, item, "Users")])
        }
    }

    mostRated = sortByRate(mostRated)
    mostRatedUser = sortByRate(mostRatedUser)
    let fourMostRated = [], fourMostRatedUsers = [];
    for (let i = 0; i < 4; i++) {
        fourMostRated.push(mostRated[i]);
        fourMostRatedUsers.push(mostRatedUser[i]);
    }
    loadHomeTea(singleCollection, '#most-rated-our', fourMostRated);
    loadHomeTea(userSingleCollection, '#most-rated-users', fourMostRatedUsers, "Users")

}

const loadCollections = async (dataHtml, content, title) => {
    let colls = await getCollections();
    title.then(async (titleHtml) => {
        let finalHtml = titleHtml;
        finalHtml += "<article class='row'>";
        for (let coll in colls) {
            let html = dataHtml;
            console.log(await getImg(coll));
            html = insertProperty(html, 'name', coll);
            html = insertProperty(html, 'img_name', await getImg(coll));
            finalHtml += html;
        }
        finalHtml += '</article>';
        content.innerHTML = finalHtml;
    });

}

const loadSingleCollection = async (dataHtml, content, name, title, users) => {
    let collection = await getCollection(name, users);
    title.then(async (titleHtml) => {
        let finalHtml = titleHtml;
        finalHtml = insertProperty(finalHtml, 'name', name);
        finalHtml += "<article class='row'>";
        for (let tea in collection) {
            if (tea == "Users") {
                continue;
            }
            let html = dataHtml;
            html = insertProperty(html, 'tea_name', tea);
            html = insertProperty(html, 'id_tea_name', tea.replace(' ', ''));
            html = insertProperty(html, 'name', name);
            html = insertProperty(html, 'cost', await getCost(name, tea, users));
            if (users) {
                let singleTea = await getTea(name, tea, users);
                html = insertProperty(html, 'img_url', singleTea.link);
            }
            let markCount = await getReviewCount(name, tea, users);
            if (markCount) {
                html = insertProperty(html, 'count', markCount);
            }
            else {
                html = insertProperty(html, 'count', 0);
            }

            finalHtml += html;
        }
        finalHtml += '</article>';
        content.innerHTML = finalHtml;
        for (let tea in collection) {
            if (tea == "Users") {
                continue;
            }
            let stars = document.querySelectorAll('#' + tea.replace(' ', '') + ' span');
            showRating(name, tea, stars, users);
        }
    });
}

const loadSingleTea = async (dataHtml, content, request, name, teaName, users) => {
    let tea = await getTea(name, teaName, users);
    let finalHtml = '<article id="single-unit" class="row flex-wrap-space">';
    finalHtml += dataHtml;
    finalHtml = insertProperty(finalHtml, 'name', name);
    finalHtml = insertProperty(finalHtml, 'tea_name', teaName);
    let markCount = await getReviewCount(name, teaName, users);
    if (markCount) {
        finalHtml = insertProperty(finalHtml, 'count', markCount);
    }
    else {
        finalHtml = insertProperty(finalHtml, 'count', 0);
    }
    finalHtml = insertProperty(finalHtml, 'cost', tea.cost);
    if (users) {
        finalHtml = insertProperty(finalHtml, 'img_url', tea.link);
        finalHtml = insertProperty(finalHtml, 'place', tea.place);
        finalHtml = insertProperty(finalHtml, 'description', tea.description);
    }
    else {
        finalHtml = insertProperty(finalHtml, 'brand', tea.brand);
        finalHtml = insertProperty(finalHtml, 'item_form', tea.item_form);
        finalHtml = insertProperty(finalHtml, 'origin', tea.origin);
        finalHtml = insertProperty(finalHtml, 'energy', tea.energy);
        finalHtml = insertProperty(finalHtml, 'steeping', tea.steeping);
        finalHtml = insertProperty(finalHtml, 'temperature', tea.temperature);
    }

    finalHtml += '</article>'
    content.innerHTML = finalHtml;
    if (!users) {
        let targetElem = document.querySelector('#fact-list');
        for (let i = 0; i < tea.facts.length; i++) {
            let li = document.createElement('li');
            li.innerHTML = tea.facts[i];
            targetElem.appendChild(li)
        }
    }
    let stars = document.querySelectorAll('.rating-result span');
    showRating(name, teaName, stars, users);
    loadReviewSection(request, users);
    loadAllReviews(name, teaName, users);
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

const loadAllReviews = async (name, teaName, users) => {
    let allReviews = await getReviews(name, teaName, users);
    for (let rev in allReviews) {
        let single = await getReview(name, teaName, rev, users);
        console.log('all:' + single.content)
        singleReview.then(dataHtml => {
            let finalHtml = '';
            let html = dataHtml;
            html = insertProperty(html, 'date', single.date);
            html = insertProperty(html, 'rev_title', single.title);
            html = insertProperty(html, 'rev_content', single.content);
            html = insertProperty(html, 'email', single.email);
            html = insertProperty(html, 'displayName', single.username);
            html = insertProperty(html, 'key', rev);
            finalHtml += html;
            let targetElem = document.querySelector('#input-review-container');
            console.log('final:' + targetElem)
            if (targetElem && finalHtml) {
                targetElem.insertAdjacentHTML('beforeend', finalHtml);                
                let stars = document.querySelectorAll('#' + rev + ' .review-rate span')
                for (let i = 0; i < single.rating; i++) {
                    stars[i].classList.add('active');
                }                
            }
        });
    }

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
    if (request.tea && request.tea.includes('%20')) {
        request.tea = request.tea.replace('%20', ' ');
    }
    console.log('r:' + r)



    return request
}

const showRating = (name, teaName, stars, users) => {
    let dbRef = (users ? database.ref(name + '/Users/' + teaName + '/reviews') :
        database.ref(name + '/' + teaName + '/reviews'));
    let dbRefRate = (users ? database.ref(name + '/Users/' + teaName) :
        database.ref(name + '/' + teaName));
    dbRef.on("value", function (snapshot) {
        let sumRating = 0,
            markCount = snapshot.numChildren();
        snapshot.forEach(function (data) {
            sumRating += parseInt(data.val().rating);
        });
        sumRating /= markCount;
        dbRefRate.update({
            rating: sumRating
        });


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
            let dbRef = (users == '{{users}}' ? database.ref(name + '/' + teaName + '/reviews') : database.ref(name + '/Users/' + teaName + '/reviews'))
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
    console.log('parsedURL:' + parsedURL)
    if (parsedURL in routes) {
        showLoading('#main-content')
        routes[parsedURL].then(dataHtml => {
            switch (parsedURL) {
                case '/':
                    content.innerHTML = dataHtml;
                    loadHome(dataHtml);
                    break;
                case '/home':
                    content.innerHTML = dataHtml;
                    loadHome(dataHtml);
                    break;
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
                    loadSingleCollection(dataHtml, content, request.collection, singleCollectionTitle, "Users");
                    break;
                case '/collections/{{name}}/{{tea_name}}':
                    loadSingleTea(dataHtml, content, request, request.collection, request.tea);
                    break;
                case '/users-tea/{{name}}/{{tea_name}}':
                    loadSingleTea(dataHtml, content, request, request.collection, request.tea, "Users");
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
    console.log('path:' + window.location.hash)
}

window.onpopstate = () => {
    loadPage();
}

window.onbeforeunload = () => {
    window.history.pushState(
        {},
        {},
        window.location.hash
    );
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

