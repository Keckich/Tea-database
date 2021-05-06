class Authentication {
    constructor() {
    }

    login(email, password) {
        console.log(email + ', ' + password)
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {                
                onNavigate('#/home');
            })
            .catch((error) => {
                let errorCode = error.code;
                let errorMessage = error.message;
                window.alert('Error: ' + errorMessage);
            });	
    }

    async register(email, password, passwordRep, username) {
        if (password != passwordRep) {
            document.getElementById('password-match').style.display = "inline";
            document.getElementById('user-exists').style.display = "none";	
            document.getElementById('user-short').style.display = "none";
            return
        }
        let existUsers = await database.getExistUsers(username); 
        if (existUsers === null) {
            firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
                let username = document.getElementById('username').value;
                let user = userCredential.user;
                user.updateProfile({
                    displayName: username
                });
                database.addUser(user, username);
                alert('Registration was successeful.')
                onNavigate('#/home');	
            })
            .catch((error) => {
                let errorCode = error.code;
                let errorMessage = error.message;
                window.alert('Error: ' + errorMessage);
            });
        }
        else {
            document.getElementById('user-exists').style.display = "inline";
            document.getElementById('password-match').style.display = "none";	
            document.getElementById('user-short').style.display = "none";		
            return
        }
    }

    logout() {
        firebase.auth().signOut().then(() => {
            onNavigate('#/home');
        });
    }
}

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
	  	// User is signed in.
        displayBtns(true);
		console.log('we signed');
	} else {
	  	// No user is signed in.	 
		displayBtns(false);
		console.log('we not signed');
	}
});

const displayBtns = (isSigned) => {
    let btnAcc = document.getElementById("account"),
		btnAdd = document.getElementById("add-new");
    if (isSigned) {
        btnAdd.style.display = "flex";
		btnAcc.innerText = "Log out"
		btnAcc.style.width = '30%';
		btnAcc.onclick = () => {
			auth.logout();
		}  
    }
    else {
        btnAdd.style.display = "none";
		btnAcc.innerText = "Account";
		btnAcc.style.width = '70%';
		btnAcc.onclick = () => {
			onNavigate('#/login');
			return false;
		};
    }
}

let auth = new Authentication();