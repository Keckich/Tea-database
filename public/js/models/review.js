class Review {
    constructor(collection, teaName, title, content, rating, user) {
        this.collection = collection;
        this.teaName = teaName;
        this.title = title;
        this.content = content;
        this.rating = rating;
        this.date = new Date().toLocaleString();
        this.username = user.displayName;
        this.email = user.email;
    }
}