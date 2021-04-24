let database = firebase.database();
const getCollections = async() => {
    return (await database.ref('collections').once("value")).val();
}

const getCollection = async(coll, users) => {
    if (users) return (await database.ref(coll + '/Users').once("value")).val();
    else return (await database.ref(coll).once("value")).val();
}

const getTea = async(coll, tea, users) => {
    if (users) return (await database.ref(coll + '/Users/' + tea).once("value")).val();
    else return (await database.ref(coll + '/' + tea).once("value")).val();
}

const getReviewCount = async(coll, tea, users) => {
    if (users) return (await database.ref(coll + '/Users/' + tea + '/reviews').once("value")).numChildren();
    else return (await database.ref(coll + '/' + tea + '/reviews').once("value")).numChildren();
}

const getRating = async(coll, tea, users) => {
    if (users) return (await database.ref(coll + '/Users/' + tea + '/rating').once("value")).val();
    else return (await database.ref(coll + '/' + tea + '/rating').once("value")).val();
}

const getOrderedItems = async(coll, users) => {
    if (users) return (await database.ref(coll + '/Users').orderByChild("rating").limitToLast(4).once("value")).val(); 
    return (await database.ref(coll).orderByChild("rating").limitToLast(4).once("value")).val(); 
}

const getImg = async(coll) => {
    return (await database.ref('collections/' + coll + '/img_name').once("value")).val();
}

const getCost = async(coll, tea, users) => {
    if (users) return (await database.ref(coll + '/Users/' + tea + '/cost').once("value")).val();
    else return (await database.ref(coll + '/' + tea + '/cost').once("value")).val();
}

const getReviews = async(coll, tea, users) => {
    if (users) return (await database.ref(coll + '/Users/' + tea + '/reviews').once("value")).val();
    else return (await database.ref(coll + '/' + tea + '/reviews').once("value")).val();
}

const getReview = async(coll, tea, key, users) => {
    if (users) return (await database.ref(coll + '/Users/' + tea + '/reviews/' + key).once("value")).val();
    else return (await database.ref(coll + '/' + tea + '/reviews/' + key).once("value")).val();
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