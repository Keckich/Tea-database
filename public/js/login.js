function openTab(event, tabName) {
	let tabContent = document.getElementsByClassName("form-login");
	for (let i = 0; i < tabContent.length; i++) {
		tabContent[i].style.display = "none";
	} 
	let tabLinks = document.getElementsByClassName("tab-link");
	for (let i = 0; i < tabLinks.length; i++) {
		tabLinks[i].className = tabLinks[i].className.replace(" active", "");
	}
	document.getElementById(tabName).style.display = "block";
	event.currentTarget.className += " active";
}


function logout () {
	firebase.auth().signOut().then(() => {
		// Sign-out successful.
		//window.alert('Log out successful');
		onNavigate('#/home');
	}).catch((error) => {
		// An error happened.
	});
}

firebase.auth().onAuthStateChanged(function(user) {
	let btnAcc = document.getElementById("account"),
		btnAdd = document.getElementById("add-new");
	if (user) {
	  	// User is signed in.
		btnAdd.style.display = "flex";
		btnAcc.innerText = "Log out"
		btnAcc.style.width = '30%';
		btnAcc.onclick = () => {
			logout();
		} 
		console.log('we signed');
	} else {
	  	// No user is signed in.
		btnAdd.style.display = "none";
		btnAcc.innerText = "Account";
		btnAcc.style.width = '70%';
		btnAcc.onclick = () => {
			onNavigate('#/login');
			return false;
		};	 
		
		console.log('we not signed');
	}
  });

function login() {
	let email = document.getElementById('email-login').value,
		password = document.getElementById('password-login').value;
	console.log(email + ', ' + password)
	firebase.auth().signInWithEmailAndPassword(email, password)
		.then((userCredential) => {
		  	// Signed in
			var user = userCredential.user;
			// ...
			window.alert('Log in successful');
			onNavigate('#/home');
		})
		.catch((error) => {
			var errorCode = error.code;
			var errorMessage = error.message;
			window.alert('Error: ' + errorMessage);
		});	
}

function register() {
	let email = document.getElementById('email-reg').value,
		password = document.getElementById('password-reg').value,
		username = document.getElementById('username').value;
	database.ref('users').startAt(null, username).endAt(null, username).on("value", function(snapshot) {
		if (snapshot.val() === null) {
			firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
			// Signed in 
				let username = document.getElementById('username').value;
				var user = userCredential.user;
				database.ref('users/' + username).set({
					uid: user.uid,
					email: user.email
				})
				user.updateProfile({
					displayName: username
				});
				document.getElementById('register').reset();
				onNavigate('#/home');				
				// ...
			})
			.catch((error) => {
				var errorCode = error.code;
				var errorMessage = error.message;
				// ..
				window.alert('Error: ' + errorMessage);
			});
		}
		else {
			document.getElementById('user-exists').style.display = "inline";			
			return
		}
		
	});
	

}

