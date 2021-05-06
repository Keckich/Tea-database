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