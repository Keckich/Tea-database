const openTab = (event, tabName) => {
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

const submitLogIn = () => {
	let email = document.getElementById('email-login').value,
        password = document.getElementById('password-login').value;
	auth.login(email, password);
}

const submitRegister = () => {
	let email = document.getElementById('email-reg').value,
        password = document.getElementById('password-reg').value,
        passwordRep = document.getElementById('password-rep').value,
        username = document.getElementById('username').value;
	if (username.length < 4) {
		document.getElementById('user-short').style.display = "inline";
		return;
	}
	auth.register(email, password, passwordRep, username);
}

