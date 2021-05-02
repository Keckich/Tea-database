const homeHtml = "/snippets/home-snippet.html",
    contactsHtml = "/snippets/contacts.html"
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
    userSingleItemHtml = "/snippets/single-user-item-snippet.html",
    editHtml = "/snippets/edit-snippet.html";

let content = document.getElementById('main-content');
loadHtmlAsync = (fileUrl) => fetch(fileUrl)
    .then(response => response.text());

// const loadHtmlAsync = async(page) => {
//     const response = await fetch(page);
//     const resHtml = await response.text();
//     return resHtml;
// }

const home = loadHtmlAsync(homeHtml),
    contacts = loadHtmlAsync(contactsHtml),
    collections = loadHtmlAsync(collectionsHtml),
    collectionsTitle = loadHtmlAsync(collectionsTitleHtml),
    singleCollection = loadHtmlAsync(singleCollectionHtml),
    singleCollectionTitle = loadHtmlAsync(singleCollectionTitleHtml),
    singleTea = loadHtmlAsync(singleItemHtml),
    logIn = loadHtmlAsync(loginHtml),
    review = loadHtmlAsync(reviewHtml),
    singleReview = loadHtmlAsync(singleReviewHtml),
    search = loadHtmlAsync(searchHtml),
    addTea = loadHtmlAsync(addHtml),
    editTea = loadHtmlAsync(editHtml),
    userCollections = loadHtmlAsync(userCollHtml),
    userSingleCollection = loadHtmlAsync(userSingleCollHtml),
    userSingleItem = loadHtmlAsync(userSingleItemHtml);


const routes = {
    '/': home,
    '/home': home,
    '/contacts': contacts,
    // '/about' : about,
    '/collections': collections,
    '/collections/{{name}}': singleCollection,
    '/collections/{{name}}/{{tea_name}}': singleTea,
    '/users-tea': userCollections,
    '/users-tea/{{name}}': userSingleCollection,
    '/users-tea/{{name}}/{{tea_name}}': userSingleItem,
    '/login': logIn,
    '/search?tea={{search_tea}}&collection={{name}}': search,
    '/add': addTea,
    '/edit/{{name}}/{{tea_name}}': editTea
};

const loadHomeTea = (htmlPromise, selector, fourMostRated, users) => {
    htmlPromise.then(async (itemHtml) => {
        let finalHtml = "";
        for (let item of fourMostRated) {
            let tea = await database.getTea(item[1], item[0], users);
            let html = itemHtml;
            html = insertProperty(html, 'tea_name', item[0]);
            html = insertProperty(html, 'id_tea_name', item[0].replace(' ', ''));
            html = insertProperty(html, 'name', item[1]);
            html = insertProperty(html, 'cost', tea.cost);
            let markCount;
            if (users) {
                html = insertProperty(html, 'img_url', tea.link);
            }
            markCount = await database.getReviewCount(item[1], item[0], users);
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
            database.showRating(item[1], item[0], stars, users);
        });

    });
}

const sortByRate = (array) => {
    array.sort((prev, next) => {
        if (prev[2] < next[2]) {
            return 1;
        }
        if (prev[2] > next[2]) {
            return -1;
        }
        return 0;
    })
    return array
}

const loadHome = async () => {
    let colls = await database.getCollections();
    let mostRated = [], mostRatedUser = [];
    for (let coll in colls) {
        for (let item in await database.getOrderedItems(coll)) {
            mostRated.push([item, coll, await database.getRating(coll, item)])
        }
        for (let item in await database.getOrderedItems(coll, "Users")) {
            mostRatedUser.push([item, coll, await database.getRating(coll, item, "Users")])
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
    let colls = await database.getCollections();
    title.then(async (titleHtml) => {
        let finalHtml = titleHtml;
        finalHtml += "<article class='row'>";
        for (let coll in colls) {
            let html = dataHtml;
            console.log(await database.getImg(coll));
            html = insertProperty(html, 'name', coll);
            html = insertProperty(html, 'img_name', await database.getImg(coll));
            finalHtml += html;
        }
        finalHtml += '</article>';
        content.innerHTML = finalHtml;
    });

}

const loadSingleCollection = async (dataHtml, content, name, title, users) => {
    let collection = await database.getCollection(name, users);
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
            html = insertProperty(html, 'cost', await database.getCost(name, tea, users));
            if (users) {
                let singleTea = await database.getTea(name, tea, users);
                html = insertProperty(html, 'img_url', singleTea.link);
            }
            let markCount = await database.getReviewCount(name, tea, users);
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
            database.showRating(name, tea, stars, users);
        }
    });
}

const loadSingleTea = async (dataHtml, content, request, name, teaName, users) => {
    let tea = await database.getTea(name, teaName, users);
    let user = firebase.auth().currentUser;
    let finalHtml = '<article id="single-unit" class="row flex-wrap-space">';
    finalHtml += dataHtml;
    finalHtml = insertProperty(finalHtml, 'name', name);
    finalHtml = insertProperty(finalHtml, 'tea_name', teaName);
    let markCount = await database.getReviewCount(name, teaName, users);
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
    else {
        let delBtn = document.getElementById("delete-btn"),
            editBtn = document.getElementById("edit-btn");
        if (user.email == tea.email) {
            delBtn.style.display = 'inline-block';
            editBtn.style.display = 'inline-block';
        }
    }
    let stars = document.querySelectorAll('.rating-result span');
    database.showRating(name, teaName, stars, users);
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
    let allReviews = await database.getReviews(name, teaName, users);
    for (let rev in allReviews) {
        let single = await database.getReview(name, teaName, rev, users);
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

const loadEdit = async(teaColl, teaName) => {
    let tea = await database.getTea(teaColl, teaName, 'Users');
    let selectTea = document.getElementById('edit-tea-collection').getElementsByTagName('option');
    for (let i = 0; i < selectTea.length; i++) {
        if (selectTea[i].value == teaColl) {
            selectTea[i].selected = true;
            break;
        }
    }
    document.getElementById('edit-tea-name').value = teaName;
    document.getElementById('edit-tea-price').value = tea.cost.replace('$', '');
    document.getElementById('edit-tea-description').value = tea.description;
    if (tea.place) document.getElementById('edit-tea-place').value = tea.place;
    if (tea.link) document.getElementById('edit-tea-photo').src = tea.link;
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

const writeReview = (teaColl, teaName, users) => {
    let user = firebase.auth().currentUser;
    if (user) {
        let titleReview = document.getElementById('review-title'),
            userReview = document.getElementById('review-input');
        let rate = getReviewRating();
        if ((titleReview && titleReview.value) && (userReview && userReview.value) && rate) {
            let rev = new Review(teaColl, teaName, titleReview.value, userReview.value, rate, user);
            database.addReview(rev, users);
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
                    loadSearch(dataHtml, request.tea);
                    break;
                case '/edit/{{name}}/{{tea_name}}':
                    content.innerHTML = dataHtml;
                    loadEdit(request.collection, request.tea);
                    break;
                default:
                    content.innerHTML = dataHtml;
                    break;
            }
        });
    }
}

const getSearchedItems = async (inputCollection, teaText, htmlPromise, users) => {
    let collection = await database.getCollection(inputCollection, users);
    let finalHtml = "";
    let matches = [];
    htmlPromise.then(async (dataHtml) => {
        for (let tea in collection) {
            if (tea == "Users") {
                continue;
            }
            let teaNameLow = tea.toLowerCase();
            if (teaNameLow.includes(teaText) || teaText.includes(teaNameLow)) {
                let html = dataHtml;
                html = insertProperty(html, 'tea_name', tea);
                html = insertProperty(html, 'id_tea_name', tea.replace(' ', ''));
                html = insertProperty(html, 'name', inputCollection);
                html = insertProperty(html, 'cost', await database.getCost(inputCollection, tea, users));
                if (users) {
                    let singleTea = await database.getTea(inputCollection, tea, users);
                    html = insertProperty(html, 'img_url', singleTea.link);
                }
                let markCount = await database.getReviewCount(inputCollection, tea, users);
                if (markCount) {
                    html = insertProperty(html, 'count', markCount);
                }
                else {
                    html = insertProperty(html, 'count', 0);
                }            
                finalHtml += html;
                matches.push(teaNameLow);
            }
        }
        if (matches.length == 0) {
            let targetElem = (users ? document.querySelector('#no-matches-users') : document.querySelector('#no-matches-our'));
            targetElem.style.display = "block";
        }
        let targetElem = document.querySelector('#search-res');
        targetElem.insertAdjacentHTML('afterbegin', finalHtml);
        for (let tea in collection) {
            if (tea == "Users") {
                continue;
            }
            let stars = document.querySelectorAll('#' + tea.replace(' ', '') + ' span');
            database.showRating(inputCollection, tea, stars, users);
        }
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
    getSearchedItems(inputCollection, teaText, singleCollection);
    getSearchedItems(inputCollection, teaText, userSingleCollection, 'Users');
}

let files = []
const showImg = (event) => {
    let reader;
    event.currentTarget.onchange = event => {
        files = event.target.files;
        reader = new FileReader();
        let photo = document.getElementById("edit-tea-photo");
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
        let tea = new Tea(teaColl.value, teaName.value, teaPrice.value, teaPlace.value, teaDescription.value, user);
        database.addTea(tea);
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
        onNavigate('#/home')
    }
    else {
        alert("Please, fill in name, price and description.")
        return
    }



}

const removeTea = (teaColl, teaName) => {
    let isDelete = confirm('Are you sure to delete this item? It can\'t be restored.');
    if (isDelete) {
        database.deleteTea(teaColl, teaName);    
        let path = window.location.hash;
        let index = path.lastIndexOf('/');
        onNavigate(path.slice(0, index));        
    }       
}

const editExsTea = () => {
    let teaName = document.getElementById("edit-tea-name"),
        teaColl = document.getElementById("edit-tea-collection"),
        teaPrice = document.getElementById("edit-tea-price"),
        teaDescription = document.getElementById("edit-tea-description"),
        teaPlace = document.getElementById("edit-tea-place");
    let user = firebase.auth().currentUser
    if ((teaName && teaName.value) && (teaPrice && teaPrice.value) &&
        (teaDescription && teaDescription.value)) {
        let imgUrl = '';
        let uploadTask;
        let tea = new Tea(teaColl.value, teaName.value, teaPrice.value, teaPlace.value, teaDescription.value, user);
        database.editTea(tea);
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
        onNavigate('#/home')
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
onNavigate(window.location.hash);

