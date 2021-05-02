const firebaseConfig = {
    apiKey: "AIzaSyCtfiEHzomgXmm1Nv51Gefet_Mq_aKQGHE",
    authDomain: "teadb-34ad1.firebaseapp.com",
    databaseURL: "https://teadb-34ad1-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "teadb-34ad1",
    storageBucket: "teadb-34ad1.appspot.com",
    messagingSenderId: "1003798365344",
    appId: "1:1003798365344:web:59feab15bb65de6ddeb5c5",
    measurementId: "G-VZKQVKGG9N"
};
	
class Database {
    constructor(firebaseConfig) {
        firebase.initializeApp(firebaseConfig);
        firebase.analytics();
        this.database = firebase.database();
    }

    async getCollections() {
        return (await this.database.ref('collections').once("value")).val();
    }
    
    async getCollection(coll, users) {
        if (users) return (await this.database.ref(coll + '/Users').once("value")).val();
        else return (await this.database.ref(coll).once("value")).val();
    }
    
    async getTea(coll, tea, users) {
        if (users) return (await this.database.ref(coll + '/Users/' + tea).once("value")).val();
        else return (await this.database.ref(coll + '/' + tea).once("value")).val();
    }
    
    async getReviewCount(coll, tea, users) {
        if (users) return (await this.database.ref(coll + '/Users/' + tea + '/reviews').once("value")).numChildren();
        else return (await this.database.ref(coll + '/' + tea + '/reviews').once("value")).numChildren();
    }
    
    async getRating(coll, tea, users) {
        if (users) return (await this.database.ref(coll + '/Users/' + tea + '/rating').once("value")).val();
        else return (await this.database.ref(coll + '/' + tea + '/rating').once("value")).val();
    }
    
    async getOrderedItems(coll, users) {
        if (users) return (await this.database.ref(coll + '/Users').orderByChild("rating").limitToLast(4).once("value")).val(); 
        return (await this.database.ref(coll).orderByChild("rating").limitToLast(4).once("value")).val(); 
    }
    
    async getImg(coll) {
        return (await this.database.ref('collections/' + coll + '/img_name').once("value")).val();
    }
    
    async getCost(coll, tea, users) {
        if (users) return (await this.database.ref(coll + '/Users/' + tea + '/cost').once("value")).val();
        else return (await this.database.ref(coll + '/' + tea + '/cost').once("value")).val();
    }
    
    async getReviews(coll, tea, users) {
        if (users) return (await this.database.ref(coll + '/Users/' + tea + '/reviews').once("value")).val();
        else return (await this.database.ref(coll + '/' + tea + '/reviews').once("value")).val();
    }
    
    async getReview(coll, tea, key, users) {
        if (users) return (await this.database.ref(coll + '/Users/' + tea + '/reviews/' + key).once("value")).val();
        else return (await this.database.ref(coll + '/' + tea + '/reviews/' + key).once("value")).val();
    }

    showRating(coll, teaName, stars, users) {
        let dbRef = (users ? this.database.ref(coll + '/Users/' + teaName + '/reviews') :
                    this.database.ref(coll + '/' + teaName + '/reviews'));
        let dbRefRate = (users ? this.database.ref(coll + '/Users/' + teaName) :
                        this.database.ref(coll + '/' + teaName));
        dbRef.on("value", function (snapshot) {
            let sumRating = 0,
                markCount = snapshot.numChildren();
            snapshot.forEach(function (data) {
                sumRating += parseInt(data.val().rating);
            });
            sumRating /= markCount;
            if (!sumRating) {   
                return
            }
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

    addTea(tea) {
        this.database.ref(tea.collection + '/Users/' + tea.name).set({
            cost: tea.cost + '$',
            place: tea.place,
            description: tea.description,
            email: tea.email,
            username: tea.username,
            uid: tea.uid
        });
    }

    editTea(tea) {
        this.database.ref(tea.collection + '/Users/' + tea.name).update({
            cost: tea.cost + '$',
            place: tea.place,
            description: tea.description
        });
    }

    deleteTea(teaColl, teaName) {
        this.database.ref(teaColl + '/Users/' + teaName).remove();
    }

    addReview(review, users) {
        let dbRef = (users == '{{users}}' ? this.database.ref(review.collection + '/' + review.teaName + '/reviews') : 
                    this.database.ref(review.collection + '/Users/' + review.teaName + '/reviews'));
        dbRef.push({
            title: review.title,
            content: review.content,
            rating: review.rating,
            date: review.date,
            username: review.username,
            email: review.email
        }); 
    }
}

let database = new Database(firebaseConfig);