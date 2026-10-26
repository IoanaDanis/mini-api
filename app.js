const API_URL = "https://jsonplaceholder.typicode.com/posts";

const postForm = document.querySelector("#post-form");
const formMessage = document.querySelector("#form-message");
const postsList = document.querySelector("#posts-list");
const statusMessage = document.querySelector("#status");
const postsSection = document.querySelector(
    '[aria-labelledby="posts-title"]'
);

let posts = [];

async function loadPosts() {
    statusMessage.textContent = "postările se incarca...";
    postsList.replaceChildren();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Eroare la încărcarea postărilor.");
        }

        posts = await response.json();
        renderPosts();
    } catch (error) {
        statusMessage.textContent =
            "Nu s-au putut încărca postările. Verifică internetul.";
    }
}

function renderPosts() {
    postsList.replaceChildren();

    const searchInput = document.querySelector("#search-posts");
    const searchText = searchInput.value.trim().toLowerCase();

    const filteredPosts = posts.filter(function (post) {
        return post.title.toLowerCase().includes(searchText);
    });

    if (posts.length === 0) {
        statusMessage.textContent = "Nu există postări de afișat.";
        return;
    }

    if (filteredPosts.length === 0) {
        statusMessage.textContent =
            "Nu s-au găsit postări pentru această căutare.";
        return;
    }

    statusMessage.textContent = "";

    filteredPosts.forEach(function (post) {
        const listItem = document.createElement("li");
        const postTitle = document.createElement("h3");
        const postBody = document.createElement("p");

        postTitle.textContent = post.title;
        postBody.textContent = post.body;

        listItem.append(postTitle, postBody);
        postsList.appendChild(listItem);
    });
}

postForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    formMessage.textContent = "";

    if (!postForm.reportValidity()) {
        return;
    }

    const formData = new FormData(postForm);
    const postData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            let message = "Nu s-a putut adăuga postarea.";

            if (response.status >= 400 && response.status < 500) {
                try {
                    const errorData = await response.json();

                    if (errorData.message) {
                        message = errorData.message;
                    } else {
                        message =
                            "Serverul nu a acceptat datele trimise.";
                    }
                } catch (error) {
                    message = "Serverul nu a acceptat datele trimise.";
                }
            }

            formMessage.textContent = message;
            return;
        }

        if (response.status !== 201) {
            formMessage.textContent =
                "Serverul nu a confirmat crearea postării.";
            return;
        }

        const createdPost = await response.json();

        posts.unshift({
            id: createdPost.id,
            title: createdPost.title || postData.title,
            body: createdPost.body || postData.body
        });

        postForm.reset();
        document.querySelector("#search-posts").value = "";

        renderPosts();

        formMessage.textContent =
            "Postarea a fost adăugată cu succes.";
    } catch (error) {
        formMessage.textContent =
            "Eroare de rețea. Verifică internetul și încearcă din nou.";
    }
});

postsSection.addEventListener("input", function (event) {
    if (event.target.matches("#search-posts")) {
        renderPosts();
    }
});

loadPosts();