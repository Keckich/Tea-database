class Tea {
    constructor(collection, name, cost, place, description, user) {
        this.collection = collection;
        this.name = name;
        this.cost = cost;
        this.place = place;
        this.description = description;
        this.email = user.email;
        this.username = user.displayName;
        this.uid = user.uid;
    }
}