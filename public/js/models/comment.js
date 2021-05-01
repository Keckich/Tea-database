class Comment {
    constructor(title, content, rating, username, email) {
        this.title = title;
        this.content = content;
        this.rating = rating;
        this.date = new Date().toLocaleString();
        this.username = username;
        this.email = email;
    }
}