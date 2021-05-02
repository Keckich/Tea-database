const toggleSwitch = document.querySelector('.switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');

if (!currentTheme || currentTheme == 'user-pref') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleSwitch.checked = true;
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        toggleSwitch.checked = false;
    }  
    localStorage.setItem('theme', 'user-pref'); 
}
else {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme == 'dark' ) {
        toggleSwitch.checked = true;
    }
}

const switchTheme = (e) => {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}


const getUserPref = (e) => {
    if (e.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleSwitch.checked = true;
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        toggleSwitch.checked = false;
    }   
    localStorage.setItem('theme', 'user-pref');
}


toggleSwitch.addEventListener('change', switchTheme, false);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', getUserPref, false)