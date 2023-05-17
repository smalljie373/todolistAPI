const headerLogout = document.querySelector('.header_logout');
const loadingPage = document.querySelector('.loadingPage');
const search_btn = document.querySelector('#search_btn');
const search = document.querySelector('#search');
const empty = document.querySelector('.empty');
const todoList = document.querySelector('.todoList');
const list = document.querySelector('.list');
const item_count = document.querySelector('.item_count span');
const list_items = document.querySelector('#list_items');
const list_bar = document.querySelector('#list_Bar');
const all_bar_li = document.querySelectorAll('#list_Bar>li');
const clearBtn = document.querySelector('.clear');
const all_todo =[];
const blank = /^[\s]/g;
const apiUrl = `https://todoo.5xcamp.us`;
let logOutBtn;
let not_complete = 0;
function  init_token_render(token){//檢查有無token，若無token不顯示登入後的畫面
    if(token){
        let nickname = sessionStorage.getItem('nickname');
        headerLogout.innerHTML = `<h2 class="h4 d-none d-md-block mb-0 mx-2">${nickname} 的代辦</h2><a href="#" class="link-danger text-center" id="logOut">登出</a>`;
        const todolistTitle = document.querySelector('title');
        todolistTitle.textContent = `${nickname} 的代辦`;
        logOutBtn = document.querySelector('#logOut');
        axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('token');//Token(全域)
        getTodo('all');//取得Todolist
    }else{
        headerLogout.innerHTML = `<a href="index.html" class="me-3 text-dark fs-md-4" id="login">登入</a><a href="index.html" class="text-dark fs-md-4" id="register">註冊</a>`;
        return;
    }
}

function check_token(){//確認是否有token
    if(sessionStorage.getItem('token')){
        if(blank.test(search.value)|| search.value ===""){
            Swal.fire({
                icon: 'error',
                title: '發生錯誤',
                text: '你要新增的項目不可為空 !'
            })
            search.value = '';
            return;
        }else{
            const add_item = search.value;
            check_same(add_item);
        }
    }else{
        Swal.fire({
            icon: 'error',
            title: '發生錯誤',
            text: '你還未登入，尚無權限使用此待辦功能'
        })
        return;
    }
}
function check_same(add_item){ //確認項目是否重複
    axios.get(`${apiUrl}/todos`)
    .then(res =>{
        const check = res.data.todos.some(item =>{
            return item.content == add_item.trim();
        })
        if(check){
            search.value ="";
            Swal.fire({
                icon: 'error',
                title: '發生錯誤',
                text: '此待辦您已輸入過，請重新輸入'
            })
            return;
        }else{
            add_todo(add_item);
        }
    })
}


function getTodo(type){//取得Todolist
    axios.get(`${apiUrl}/todos`)
    .then(res =>{
        all_todo.splice(0,all_todo.length);
        res.data.todos.forEach((item)=>{
            all_todo.push(item);
        })
        if(res.data.todos.length === 0){
            empty.classList.remove('d-none');
            todoList.classList.add('d-none');
            all_todo.splice(0,all_todo.length);
            return;
        }else{
            not_complete = all_todo.length;
            html_render(type);
            empty.classList.add('d-none');
            todoList.classList.remove('d-none');
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: '發生錯誤',
            text: '你還未登入，尚無權限使用此待辦功能'
        })
    })
}

function add_todo(item){ //新增todolist
    const current_tab = check_current_tab();
    axios.post(`${apiUrl}/todos`,{
        "todo":{
            "content": item
        }
    })
    .then(res =>{
        Swal.fire({
            icon: 'success',
            title: '新增完畢',
            text: `以新增${res.data.content}`,
            showConfirmButton: false,
            timer: 1500
        })
        search.value="";
        getTodo(current_tab);
    })
}
function del_todo(key){//刪除todolist
    axios.delete(`${apiUrl}/todos/${key}`)
    .then(res =>{
            const current_tab = check_current_tab();
            getTodo(current_tab);
    })
}

function toggle_todo(key){//切換todolist狀態
    axios.patch(`${apiUrl}/todos/${all_todo[key].id}/toggle`,{})
    .then(res =>{
        if(res.data.completed_at === null){
            item_count.textContent = parseInt(item_count.textContent) +1;
        }else{
            item_count.textContent = parseInt(item_count.textContent) -1;
        }
    })
}

function bar_reset(){//清除其他的css效果
    for(const item of all_bar_li){
        item.classList.remove('active');
    }
}

function html_render(type){  //渲染資料
    let str='';
    if(type ==='all'){
        all_todo.forEach((item,index)=>{
            if(item.completed_at === null){
                str+=`
                <li class="d-flex align-items-center justify-content-between" data-num=${index}>
                    <div class="form-check d-flex align-items-center">
                        <input type="checkbox" class="form-check-input ms-2 me-3">
                        <i class="bi bi-check-lg d-none"></i>
                        <label class="form-check-label mt-1">${item.content}</label>
                    </div>
                    <button class="btn-delete"><i class="bi bi-x-lg"></i></button>
                </li>
                `
            }else{
                not_complete--;
                str+=`
                <li class="d-flex align-items-center justify-content-between" data-num=${index}>
                    <div class="form-check d-flex align-items-center">
                        <input type="checkbox" class="form-check-input ms-2 me-3 d-none">
                        <i class="bi bi-check-lg"></i>
                        <label class="form-check-label mt-1 active">${item.content}</label>
                    </div>
                    <button class="btn-delete"><i class="bi bi-x-lg"></i></button>
                </li>
                `
            }
            
        })
        
    }else if(type ==='notComplete'){
        all_todo.forEach((item,index)=>{
            if(item.completed_at === null){
                str+=`
                <li class="d-flex align-items-center justify-content-between" data-num=${index}>
                    <div class="form-check d-flex align-items-center">
                        <input type="checkbox" class="form-check-input ms-2 me-3">
                        <i class="bi bi-check-lg d-none"></i>
                        <label class="form-check-label mt-1">${item.content}</label>
                    </div>
                    <button class="btn-delete"><i class="bi bi-x-lg"></i></button>
                </li>
                `
            }else{
                not_complete--;
            }
            
        })
    }else if(type ==='comPlete'){
        all_todo.forEach((item,index)=>{
            if(item.completed_at !== null){
                not_complete--;
                str+=`
                <li class="d-flex align-items-center justify-content-between" data-num=${index}>
                    <div class="form-check d-flex align-items-center">
                        <input type="checkbox" class="form-check-input ms-2 me-3 d-none">
                        <i class="bi bi-check-lg"></i>
                        <label class="form-check-label mt-1 active">${item.content}</label>
                    </div>
                    <button class="btn-delete"><i class="bi bi-x-lg"></i></button>
                </li>
                `
            }
        })
    }
    list.innerHTML = str;
    item_count.textContent = `${not_complete}`
}
function check_current_tab(){//確認目前按鈕的type
    let current;
    all_bar_li.forEach(item =>{
        if(item.classList.contains('active')){
            current = item.classList[0];
        }
    })
    return current;
}
window.onload = function(){
    setTimeout(()=>{
        loadingPage.classList.toggle('d-none');
    },2000)
}

init_token_render(sessionStorage.getItem('token'));//檢查有無token，若無token不顯示登入後的畫面

if(logOutBtn){ //登出功能
    logOutBtn.addEventListener('click',(event)=>{//登出按鈕
        event.preventDefault();
        sessionStorage.removeItem('token');
        Swal.fire({
            icon: 'success',
            title: '使用者登出',
            text: `感謝${sessionStorage.getItem('nickname')}的使用~`,
            showConfirmButton: false,
            timer: 1500
        })
        setTimeout(()=>{
            init_token_render(sessionStorage.getItem('token'));
            sessionStorage.removeItem('nickname');
            loadingPage.classList.toggle('d-none');
            document.location.href = './index.html';
        },1500)
        //移除token 避免每個使用者重疊登入token
    })
}

search_btn.addEventListener('click',(event)=>{
    event.preventDefault();
    check_token();//確認是否有token
})
search.addEventListener('keypress',(event)=>{
    event.preventDefault();
    if(event.key ==="Enter"){
        check_token();//確認是否有token
    }else{
        return;
    }
})

list_bar.addEventListener('click',(event)=>{//狀態切換
    bar_reset();
    const target = event.target;
    getTodo(target.getAttribute('class'));
    target.classList.add('active');
})

list_items.addEventListener('click',(event)=>{ //判斷清單點擊選項
    event.preventDefault();
    if(event.target.getAttribute('class') === "btn-delete"){
        const data = event.target.parentNode;
        Swal.fire({
            title: '你確定?',
            text: `您即將刪除第${data.getAttribute('data-num')}項清單內容!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '刪除'
            }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    '刪除!',
                    `該項目已刪除`,
                    'success'
                    )
                let dataID = data.getAttribute('data-num');
                del_todo(all_todo[dataID].id);
            }
            })
    }else if(event.target.getAttribute('type') === "checkbox"){
        const itemLi = event.target.parentNode.parentNode;
        const checkLg = itemLi.children[0].children[1];
        const itemLabel = itemLi.children[0].children[2];
        event.target.classList.toggle('d-none');
        checkLg.classList.toggle('d-none');
        itemLabel.classList.toggle('active');
        toggle_todo(itemLi.getAttribute('data-num'));
    }else if(event.target.getAttribute('class') == "bi bi-check-lg"){
        const itemLi = event.target.parentNode.parentNode;
        const checkBox = itemLi.children[0].children[0];
        const itemLabel = itemLi.children[0].children[2];
        event.target.classList.toggle('d-none');
        checkBox.classList.toggle('d-none');
        itemLabel.classList.toggle('active');
        toggle_todo(itemLi.getAttribute('data-num'));
    }else{
        return;
    }
})

clearBtn.addEventListener('click',(event)=>{//清除所有已完成項目
    event.preventDefault();
    if(sessionStorage.getItem('token')){
        axios.get(`${apiUrl}/todos`)
        .then(res =>{
            res.data.todos.forEach(item=>{
                if(item.completed_at !== null){
                    del_todo(item.id);
                }
            })
        })
    }else{
        Swal.fire({
            icon: 'error',
            title: '發生錯誤',
            text: '你還未登入，尚無權限使用此待辦功能'
        })
    }
})