const AuthenticationForm = document.querySelectorAll('.Authentication input');
const loginEmail = document.querySelector('#loginEmail');
const loginpassword = document.querySelector('#loginpassword');
const registrationEmail = document.querySelector('#registrationEmail');
const registrationName = document.querySelector('#registrationName');
const registrationPassword = document.querySelector('#registrationPassword');
const passwordConfirm = document.querySelector('#passwordConfirm');
const loginForm = document.querySelector('.loginForm');
const registrationForm = document.querySelector('.registrationForm');
const blank = /^[\s]/g;
const apiUrl = `https://todoo.5xcamp.us`;

window.onload = function() {
  const loadingOverlay = document.querySelector('.loadingPage');
  setTimeout(()=>{
    loadingOverlay .classList.toggle('d-none');
  }, 2000);
};

function login(email, password) {//登入
    const errorloginEmail = document.querySelector('.error-loginEmail');
    const errorloginPassword = document.querySelector('.error-loginPassword');
    const isEmptyField = (fieId) => blank.test(fieId) || fieId === '';
    errorloginEmail.classList.add("d-none");
    errorloginPassword.classList.add("d-none");
    if(isEmptyField(email)) {
        errorloginEmail.classList.remove("d-none");
        loginEmail.value ='';
    }
    if(isEmptyField(password)) {
        errorloginPassword.classList.remove("d-none");
        loginpassword.value ="";
    }
    if(isEmptyField(email) || isEmptyField(password)){return;}
    axios.post(`${apiUrl}/users/sign_in`,{
        "user":{
            "email": email,
            "password":password
        }
    })
    .then(res=>{
        Swal.fire({
            icon: 'success',
            title: res.data.message,
            text: `歡迎${res.data.nickname}`,
            showConfirmButton: false,
            timer: 1500
        })
        setTimeout(()=>{
            sessionStorage.setItem('nickname', res.data.nickname);
            sessionStorage.setItem('token', res.headers.authorization);
            document.location.href = './todolist.html';
        }, 1500)
    })
    .catch(error =>{
        Swal.fire({
            icon: 'error',
            title: error.response.data.message,
            text: '帳號不存在或帳號密碼錯誤'
        })
    });
    loginEmail.value ="";
    loginpassword.value ="";
}

function signUp(email,nickname,password){//註冊
    const error_registrationEmail = document.querySelector('.error-registrationEmail');
    const error_registrationName = document.querySelector('.error-registrationName');
    const error_registrationPassword = document.querySelector('.error-registrationPassword');
    const error_passwordConfirm = document.querySelector('.error-passwordConfirm');
    error_registrationEmail.classList.add("d-none");
    error_registrationName.classList.add("d-none");
    error_registrationPassword.classList.add("d-none");
    error_passwordConfirm.classList.add("d-none");
    if(blank.test(email) || email ===""){
        error_registrationEmail.classList.remove("d-none");
        return;
    }else if(blank.test(nickname) || nickname ===""){
        error_registrationName.classList.remove("d-none");
        return;
    }else if(blank.test(password) || password ===""){
        error_registrationPassword.classList.remove("d-none");
        return;
    }else if(blank.test(passwordConfirm.value) || passwordConfirm.value === ''){
        error_passwordConfirm.classList.remove("d-none");
        return;
    }else if(password !== passwordConfirm.value){
        error_passwordConfirm.textContent ="兩次密碼輸入不一致 !";
        error_passwordConfirm.classList.remove("d-none");
        return;
    }
    axios.post(`${apiUrl}/users`,{
        "user": {
            "email": email,
            "nickname": nickname,
            "password": password
            }
    })
    .then(res =>{
        Swal.fire({
            icon: 'success',
            title: res.data.message,
            text: `帳號名稱:${res.data.nickname}，註冊成功`,
            showConfirmButton: false,
            timer: 3000
        })
        setTimeout(()=>{
            authenticationPageToggle();
        }, 3000)
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: error.response.data.message,
            text: error.response.data.error[0]
        })
    })
    registrationEmail.value='';
    registrationName.value='';
    registrationPassword.value='';
    passwordConfirm.value='';
}
function authenticationPageToggle(){//頁面切換
    loginForm.classList.toggle("d-none");
    registrationForm.classList.toggle('d-none');
}

AuthenticationForm.forEach((item)=>{//事件註冊
    let type = item.getAttribute('type');
    if(type =='button'){
        item.addEventListener('click',(event)=>{
            event.preventDefault();
            let btnID = event.target.getAttribute('id');
            switch(btnID){
                case 'loginjoinBtn':
                    authenticationPageToggle();
                    break;
                case 'registrationloginBtn':
                    authenticationPageToggle();
                    break;
                default:
                    break;
            }
        })
    }else{
        return ;
    }
})

registrationForm.addEventListener('submit' , (event)=>{
    event.preventDefault();
    signUp(registrationEmail.value,registrationName.value,registrationPassword.value);
})
loginForm.addEventListener('submit' , (event)=>{
    event.preventDefault();
    login(loginEmail.value,loginpassword.value);
})
