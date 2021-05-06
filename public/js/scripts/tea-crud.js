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