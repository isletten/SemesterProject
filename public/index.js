
        const createUserButton = document.getElementById("createUserButton");
        const loginButton = document.getElementById("loginButton");
        const showCreateUserFormButton = document.getElementById("showCreateUserForm");
        const showLoginFormButton = document.getElementById("showLoginForm");
        const createUserForm = document.getElementById("createUserForm");
        const loginForm = document.getElementById("loginForm");
        const home = document.getElementById("home");
        const homeAdmin = document.getElementById("homeAdmin");
        const add = document.getElementById("leggTil");
        const title =  document.getElementById("title");
        const tekstbox =  document.getElementById("tekstbox");
        const save =  document.getElementById("save");
        const nav =  document.querySelector("nav");
        const homeBtn = document.getElementById("homeBtn");
        const myPageBtn = document.getElementById("myPageBtn");
        const logOut = document.getElementById("logOut");
        const showContent = document.getElementById("showContent");
        const editForm = document.getElementById("editForm");
        const editTitle = document.getElementById("editTitle");
        const editTekstbox = document.getElementById("editTekstbox");
        const updateBtn = document.getElementById("updateBtn");
        const usersBtn = document.getElementById("usersBtn");
        const showUsers = document.getElementById("showUsers");
        const myPage = document.getElementById("myPage");

        let loginRole = "";
        let currentBox = 0;

        window.onload = async () => {
            //home.classList.add("hidden");
            let uid = localStorage.getItem("uid");
            let currentPage = localStorage.getItem("currentPage");
            if (uid) {
                loginRole=uid.split(":")[1];
            if(currentPage){
                showView(currentPage)
            }else{
                showView("home");
            }
            await getContent();
                nav.classList.remove("hidden");
            if (loginRole === "admin"){
                usersBtn.classList.remove("hidden");
            }
            }
            console.log(uid);
        }

        createUserButton.onclick = async function (e) {
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("pswHash").value;
            const user = { name, email, password };
            try {
                const response = await fetch("/user/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(user), 
                });

                if (response.ok) {
                    alert("User registered successfully!");
                    showView("logInForm");
                } else {
                    alert("Failed to register user. Please try again.");
                }
            } catch (error) {
                console.error("Error registering user:", error);
                alert("Failed to register user. Please try again later.");
            }
        }

        document.getElementById("loginPswHash").addEventListener("keydown",(e)=>{
            if (e.key === "Enter") {
                // Cancel the default action, if needed
                e.preventDefault();
                // Trigger the button element with a click
                loginButton.click();
              }
        })

        loginButton.onclick = async function (e) {
            console.log("hei")
            const email = document.getElementById("loginEmail").value;
            const pswHash = document.getElementById("loginPswHash").value;
            const credentials = { email, pswHash };
            const response = await postTo("/login", credentials);
            if (response.ok) {
                const user= await response.json();
                console.log(user);
                let uid = user.data.userID + ":" + user.data.role;
                localStorage.setItem("uid", uid);
                loginRole=user.data.role;
                await getContent();
                alert("Login successful!");
                showView("home");
                nav.classList.remove("hidden");
            if (loginRole === "admin"){
                usersBtn.classList.remove("hidden");
            }
            } else {
                alert("Login failed. Please check your credentials.");
            }
        }

        showCreateUserFormButton.onclick = function (e) {
            showView("createUserForm");
        }

        showLoginFormButton.onclick = function (e) {
            showView("logInForm");
        }

        logOut.onclick = function () {
            loginRole = "";
            localStorage.removeItem("uid");
            showView("logInForm");
        }

        save.onclick = async function() {
            const data = {
                title: title.value,
                text: tekstbox.value
            }
            const res = await postTo("/content", data)
            if (res.status === 200) {
                title.value ="";
                tekstbox.value = "";
                location.reload();
            }
        }

        updateBtn.onclick = async function(){
            const response = await fetch("/content", {
                method: "PUT", 
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id:currentBox, 
                    title: editTitle.value,
                    text: editTekstbox.value
                })
            });
            if (response.status === 200) {
                let content = await response.json();
                //showContentBox(content.id, content.title, content.text);
                localStorage.setItem("item", JSON.stringify({itemid:content.id, title:content.title, text:content.text}));
                console.log(content)
                showView("showContent");
            }
        }

        homeBtn.onclick = function(){
            showView("home");
        }

        usersBtn.onclick = function(){
            showUsers.innerHTML="<h2>Brukere:</h2>";
            showView("users");
            //getUsers();
        }

        myPageBtn.onclick = async function(){
            myPage.innerHTML="<h2>Mine Kommentarer:<h2>";
            showView("myPage");
        }

        async function deleteComment(id){
            const response = await fetch ("/comment", {
                method: "delete",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({id}),
            });
            console.log(response);
            if(response.status === 200){
                location.reload();
            }
        }

        async function getMyComments(){
            let userid = localStorage.getItem("uid").split(":")[0];
            const response = await fetch(`/myComments/${userid}`, {
                method: "GET", 
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 200) {
                let comments = await response.json();
                return comments;
            }
        }

        async function getUsers() {
            const response = await fetch("/users", {
                method: "GET", 
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 200) {
                let users = await response.json();
                displayUsers(users);
                console.log(users)
            }
        }

        async function postTo(url, data) {
            const header = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            };

            const response = await fetch(url, header);
            return response;
        }

        async function getContent() {
            const response = await fetch("/content", {
                method: "GET", 
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 200) {
                let content = await response.json();
                displayContent(content);
                console.log(content)
            }
        }

        async function deleteContent(id){
            const response = await fetch ("/content", {
                method: "delete",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({id}),
            });
            console.log(response);
            if(response.status === 200){
                location.reload();
            }
        }

        function displayContent(content) {
            for (let item of content) {
                let itemid = item.id;
                let button = document.createElement("button");
                button.innerHTML = item.title;
                home.appendChild (button);
                let title = item.title;
                let text = item.text;
                button.onclick = async function(){
                    console.log("heiheihei")
                   //await showContentBox(itemid, title, text);
                   localStorage.setItem("item", JSON.stringify({itemid, title, text}));
                    showView("showContent");
                }
            }

            console.log("loginRole")
            if (loginRole === "admin"){
                let button = document.createElement("button");
                button.innerHTML = "Legg til";
                button.onclick= function(){
                    showView("addForm");
                }
                home.appendChild (button);
            }
        }

        function displayUsers(users) {
            for (let user of users) {
                let userid = user.userid;
                let button = document.createElement("button");
                button.innerHTML = "Delete user";
                let div = document.createElement("div");
                let userDiv = document.createElement("strong");
                let EmailDiv = document.createElement("div");
                let username = user.username;
                let email = user.email;
                userDiv.innerHTML = username;
                EmailDiv.innerHTML = email;
                div.appendChild(userDiv);
                div.appendChild(EmailDiv);
                div.appendChild(button);
                let line = document.createElement("hr");
                div.appendChild(line);
                showUsers.appendChild(div);
                button.onclick = function(){
                   deleteUser(userid);
                }
            }
        }

        async function deleteUser(userid){
            const response = await fetch ("/users", {
                method: "delete",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({userid}),
            });
            console.log(response);
            if(response.status === 200){
                location.reload();
            }
        }


       async function showContentBox(itemid, title, text){
            showContent.innerHTML="";
                currentBox = itemid;
                    let h2 = document.createElement("h2");
                    h2.innerHTML = title;
                    showContent.appendChild(h2);
                    let textArray = text.split("\n");
                    for(let par of textArray){
                        if(par.includes("##")){
                            let h4 = document.createElement("h4");
                            h4.innerHTML=par.slice(2);
                            showContent.appendChild(h4);
                        }else{
                        let p = document.createElement("p");
                        p.innerHTML = par;
                        showContent.appendChild(p);
                        }
                    }
                    let likeBtn = document.createElement("button");
                    likeBtn.innerHTML = "Lagre";
                    showContent.appendChild(likeBtn);
                    if(loginRole === "admin"){
                        let editBtn = document.createElement("button");
                        editBtn.innerHTML = "Rediger";
                        showContent.appendChild(editBtn);

                        editBtn.onclick = function(){
                            showView("editContent");
                            editTitle.value=title;
                            editTekstbox.value=text;
                        }

                        let deleteBtn = document.createElement("button");
                        deleteBtn.innerHTML = "Slett";
                        showContent.appendChild(deleteBtn);

                        deleteBtn.onclick = function(){
                            deleteContent(itemid);
                        }

                    }

                   let comments = await getComments(itemid);
                   console.log(comments);
                   let commentHeader = document.createElement("h3")
                   commentHeader.innerHTML = "Legg til kommentar:";
                   showContent.appendChild(commentHeader);
                   let commentArea = document.createElement("textarea");
                   showContent.appendChild(commentArea);
                   let addComment = document.createElement("button");
                   addComment.innerHTML="Del";
                   showContent.appendChild(addComment);
                   let listComments = document.createElement("h4")
                   listComments.innerHTML = "Kommentarer:";
                   showContent.appendChild(listComments);
                   addComment.onclick = async function (){
                   await sendComment(itemid, commentArea.value);
                   }
                   for (let comment of comments){
                    let commentDiv = document.createElement("div");
                    commentDiv.innerHTML=comment.comment;
                    showContent.appendChild(commentDiv);
                    commentDiv.classList.add("comment");
                   }
                    //showView("showContent");
                }

                async function sendComment(itemid, comment){
                    let userid = localStorage.getItem("uid").split(":")[0];
                    let url = "/comment";
                    let data = {
                        userid, itemid, comment
                    }
                    let response = await postTo(url, data);
                    if (response.status === 200) {
                        location.reload();
                    }
                }

                async function getComments(itemid){
                    const response = await fetch(`/comments/${itemid}`, {
                method: "GET", 
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 200) {
                let comments = await response.json();
                return comments;
            }
                }

        async function showView (view){
            if (view==="createUserForm"){
                loginForm.classList.add("hidden");
                createUserForm.classList.remove("hidden");
                home.classList.add("hidden");
                showUsers.classList.add("hidden");
                myPage.classList.add("hidden");
                addForm.classList.add("hidden");
                editForm.classList.add("hidden");
            }
            if (view==="logInForm"){
                console.log("logInForm")
                createUserForm.classList.add("hidden");
                loginForm.classList.remove("hidden");
                home.classList.add("hidden");
                nav.classList.add("hidden");
                showUsers.classList.add("hidden");
                myPage.classList.add("hidden");
                showContent.classList.add("hidden");
                addForm.classList.add("hidden");
                editForm.classList.add("hidden");
            }
            if (view==="home"){
                loginForm.classList.add("hidden");
                home.classList.remove("hidden");
                addForm.classList.add("hidden");
                showContent.classList.add("hidden");
                showUsers.classList.add("hidden");
                myPage.classList.add("hidden");
                localStorage.setItem("currentPage", "home");
                addForm.classList.add("hidden");
                editForm.classList.add("hidden");
            }
            if (view==="homeAdmin"){
                loginForm.classList.add("hidden");
                home.classList.add("hidden");
                homeAdmin.classList.remove("hidden");
                showUsers.classList.add("hidden");
                myPage.classList.add("hidden");
                localStorage.setItem("currentPage", "homeAdmin");
                addForm.classList.add("hidden");
                editForm.classList.add("hidden");
            }
            if (view==="addForm"){
                loginForm.classList.add("hidden");
                home.classList.add("hidden");
                homeAdmin.classList.add("hidden");
                addForm.classList.remove("hidden");
                showUsers.classList.add("hidden");
                myPage.classList.add("hidden");
                localStorage.setItem("currentPage", "home");
            }
            if (view==="showContent"){
                loginForm.classList.add("hidden");
                home.classList.add("hidden");
                homeAdmin.classList.add("hidden");
                showContent.classList.remove("hidden");
                editForm.classList.add("hidden");
                showUsers.classList.add("hidden");
                myPage.classList.add("hidden");
                let item = JSON.parse(localStorage.getItem("item"));
                localStorage.setItem("currentPage", "showContent");
                await showContentBox(item.itemid, item.title, item.text);

            }
            if (view==="editContent"){
                loginForm.classList.add("hidden");
                home.classList.add("hidden");
                homeAdmin.classList.add("hidden");
                showContent.classList.add("hidden");
                editForm.classList.remove("hidden");
                showUsers.classList.add("hidden");
                myPage.classList.add("hidden");
                localStorage.setItem("currentPage", "editContent");
                
            }
            if (view==="users"){
                getUsers();
                loginForm.classList.add("hidden");
                home.classList.add("hidden");
                homeAdmin.classList.add("hidden");
                showContent.classList.add("hidden");
                editForm.classList.add("hidden");
                showUsers.classList.remove("hidden");
                myPage.classList.add("hidden");
                localStorage.setItem("currentPage", "users");
                addForm.classList.add("hidden");
                editForm.classList.add("hidden");
            }
            if (view==="myPage"){
                loginForm.classList.add("hidden");
                home.classList.add("hidden");
                homeAdmin.classList.add("hidden");
                showContent.classList.add("hidden");
                editForm.classList.add("hidden");
                showUsers.classList.add("hidden");
                myPage.classList.remove("hidden");
                localStorage.setItem("currentPage", "myPage");
                addForm.classList.add("hidden");
                editForm.classList.add("hidden");

                let myComments = await getMyComments();

                for(let comment of myComments){
                    let div = document.createElement("div");
                    div.innerHTML=comment.comment;
                    myPage.appendChild(div);
                    let deleteBtn = document.createElement("button");
                    deleteBtn.innerHTML="Slett";
                    let id = comment.id;
                    myPage.appendChild(deleteBtn);
                    deleteBtn.onclick = async function(){
                        const response = await deleteComment(id);
                    }
            }
            console.log(myComments)
            }
        }

       

        add.onclick = ()=>{
            console.log("legg til");
            showView("addForm");
        }



        let prevScrollPos = window.pageYOffset;
        window.onscroll = function() {
        let currentScrollPos = window.pageYOffset;
        if (prevScrollPos > currentScrollPos) {
            document.querySelector("nav").classList.remove("hidden");
        } else {
            document.querySelector("nav").classList.add("hidden");
        }
        prevScrollPos = currentScrollPos;
        }
   