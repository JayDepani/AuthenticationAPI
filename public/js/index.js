const reset_password_msg = document.getElementById('reset_password_msg');
if(reset_password_msg.innerText){
    setTimeout(() => {
        reset_password_msg.innerText = '';
    }, 10000);
}


const currentYear = document.getElementById('currentYear');
const d = new Date();
currentYear.innerText = d.getFullYear();




