const headerLogout = document.querySelector('.header_logout');
const loadingOverlay  = document.querySelector('.loadingPage');
const todoInput = document.querySelector('#todoInput');
const searchBar = document.querySelector('#searchBar');
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
function  initTokenRender(token){//檢查有無token，若無token不顯示登入後的畫面
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

function checkToken(){//確認是否有token
    if(sessionStorage.getItem('token')){
        if(blank.test(todoInput.value)|| todoInput.value ===""){
            Swal.fire({
                icon: 'error',
                title: '發生錯誤',
                text: '你要新增的項目不可為空 !'
            })
            todoInput.value = '';
            return;
        }else{
            const add_item = todoInput.value;
            checkSame(add_item);
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
function checkSame(add_item){ //確認項目是否重複
    axios.get(`${apiUrl}/todos`)
    .then(res =>{
        const check = res.data.todos.some(item =>{
            return item.content == add_item.trim();
        })
        if(check){
            todoInput.value ="";
            Swal.fire({
                icon: 'error',
                title: '發生錯誤',
                text: '此待辦您已輸入過，請重新輸入'
            })
            return;
        }else{
            addTodo(add_item);
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
            renderList(type);
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

function addTodo(item){ //新增todolist
    const current_tab = checkCurrentTab();
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
        todoInput.value="";
        getTodo(current_tab);
    })
}
function delTodo(key){//刪除todolist
    axios.delete(`${apiUrl}/todos/${key}`)
    .then(res =>{
            const current_tab = checkCurrentTab();
            getTodo(current_tab);
    })
}

function delTodoAll(key){//刪除全部以勾選的todolist
    const deletePromises = key.map(key => axios.delete(`${apiUrl}/todos/${key}`));
    Promise.all(deletePromises)
    .then(response =>{
        const current_tab = checkCurrentTab();
        getTodo(current_tab);
        Swal.fire({
            icon: 'success',
            title: '刪除完畢',
            showConfirmButton: false,
            timer: 1500
        })
    })
}

function toggleTodo(key){//切換todolist狀態
    axios.patch(`${apiUrl}/todos/${key}/toggle`,{})
    .then(res =>{
        const current_tab = checkCurrentTab();
        if(res.data.completed_at === null){
            item_count.textContent = parseInt(item_count.textContent) +1;
            getTodo(current_tab);
        }else{
            item_count.textContent = parseInt(item_count.textContent) -1;
            getTodo(current_tab);
        }
    })
    
}

function barReset(){//清除其他的css效果
    for(const item of all_bar_li){
        item.classList.remove('active');
    }
}

function filterData(todoList){
    if(todoList === 'all'){
        return all_todo;
    }else if(todoList ==='notComplete'){
        return all_todo.filter(todo => todo.completed_at === null);
    }else if(todoList === 'comPlete'){
        return all_todo.filter(todo => todo.completed_at !== null);
    }
}

function renderList(todoList){  //渲染資料
    let str='';
    let filteredData = filterData(todoList);
    not_complete = filteredData.length;
    filteredData.forEach((item) =>{
        if(item.completed_at === null){
            str+=`
                <li class="d-flex align-items-center justify-content-between" data-num=${item.id}>
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
                <li class="d-flex align-items-center justify-content-between" data-num=${item.id}>
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
    list.innerHTML = str;
    item_count.textContent = `${not_complete}`;
}

function checkCurrentTab(){//確認目前按鈕的type
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
        loadingOverlay.classList.toggle('d-none');
    },2000)
}

initTokenRender(sessionStorage.getItem('token'));//檢查有無token，若無token不顯示登入後的畫面

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
            initTokenRender(sessionStorage.getItem('token'));
            sessionStorage.removeItem('nickname');
            loadingOverlay.classList.toggle('d-none');
            document.location.href = './index.html';
        },1500)
        //移除token 避免每個使用者重疊登入token
    })
}

searchBar.addEventListener('submit' , (event) =>{
    event.preventDefault();
    checkToken();//確認是否有token
})

list_bar.addEventListener('click',(event)=>{//狀態切換
    barReset();
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
            text: `您即將刪除該項清單內容!`,
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
                delTodo(dataID);
            }
            })
    }else if(event.target.getAttribute('type') === "checkbox"){
        const itemLi = event.target.parentNode.parentNode;
        const checkLg = itemLi.children[0].children[1];
        const itemLabel = itemLi.children[0].children[2];
        event.target.classList.toggle('d-none');
        checkLg.classList.toggle('d-none');
        itemLabel.classList.toggle('active');
        toggleTodo(itemLi.getAttribute('data-num'));
        
    }else if(event.target.getAttribute('class') == "bi bi-check-lg"){
        const itemLi = event.target.parentNode.parentNode;
        const checkBox = itemLi.children[0].children[0];
        const itemLabel = itemLi.children[0].children[2];
        event.target.classList.toggle('d-none');
        checkBox.classList.toggle('d-none');
        itemLabel.classList.toggle('active');
        toggleTodo(itemLi.getAttribute('data-num'));
    }else{
        return;
    }
})

clearBtn.addEventListener('click',(event)=>{//清除所有已完成項目
    event.preventDefault();
    if(sessionStorage.getItem('token')){
        axios.get(`${apiUrl}/todos`)
        .then(res =>{
            const deleteItems = res.data.todos
            .filter(item => item.completed_at !== null)
            .map(item => item.id);
            if(deleteItems.length > 0){
                delTodoAll(deleteItems);
            }
        })
    }else{
        Swal.fire({
            icon: 'error',
            title: '發生錯誤',
            text: '你還未登入，尚無權限使用此待辦功能'
        })
    }
})