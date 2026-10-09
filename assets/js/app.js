const cl = console.log;

const postForm = document.getElementById("postForm");
const title = document.getElementById("title");
const content = document.getElementById("content");
const userId = document.getElementById("userId");
const addPost = document.getElementById("addPost");
const updatePost = document.getElementById("updatePost");
const postContainer = document.getElementById("postContainer");
const spinner = document.getElementById("spinner");

const base_url = `https://bhagyashri-s-first-database-default-rtdb.firebaseio.com/`;
const post_url = `${base_url}/posts.json`;

//localstate

let state = {
  postArray: [],
  updateid: null,
};

//snackbar function

function snackbar(msg, icon) {
  Swal.fire({
    title: msg,
    icon: icon,
    timer: 3000,
  });
}

//function spinner
function onspinnerHandle(flag) {
  if (flag) {
    spinner.classList.remove("d-none");
  } else {
    spinner.classList.add("d-none");
  }
}

//nested obj to array fun
function nestedObjtoArr(obj) {
  for (const key in obj) {
    obj[key].id = key;

    state.postArray.unshift(obj[key]);
  }
  onCreatePosts(state.postArray);
}

//read

function onCreatePosts(arr) {
  let res = "";

  arr.forEach((post) => {
    res += `<div class="col-md-3 mb-3" id="${post.id}">
                <div class="card h-100">
                    <div class="card-header bg-dark text-white">
                        <h4 class="heading"><span class="ml-0">${post.userId}.</span> ${post.title}</h4>
                    </div>
                    <div class="card-body bg-light">
                        <p>${post.body}</p>
                    </div>
                    <div class="card-footer bg-dark text-white d-flex justify-content-between">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-info">Edit</button>
                        <button onclick="onDelete(this)" class="btn btn-sm btn-warning">Remove</button>
                     </div>
                </div>
            </div>`;
  });
  postContainer.innerHTML = res;
}

function fetchPosts() {
  onspinnerHandle(true);
  fetch(post_url, {
    method: "GET",
    body: null,
    headers: {
      "content-type": "application/json",
      auth: "token from LS",
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new error("error");
      }
      return res.json();
    })
    .then((data) => {
      nestedObjtoArr(data);
      // cl(state.postArray)
    })
    .catch((err) => {
      cl(err);
      snackbar(err, "error");
    })
    .finally(() => {
      onspinnerHandle();
    });
}

fetchPosts();

//function submit
function onSubmit(eve) {
  eve.preventDefault();

  let newPost = {
    title: title.value,
    body: content.value,
    userId: userId.value,
  };

  postForm.reset();
  onspinnerHandle(true);

  fetch(post_url, {
    method: "POST",
    body: JSON.stringify(newPost),
    headers: {
      "content-type": "application/json",
      auth: "token from LS",
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("error");
      }
      return res.json();
    })
    .then((data) => {
      newPost.id = data.name;
      state.postArray.unshift(newPost);

      let card = document.createElement("div");
      card.id = data.name;
      card.className = "col-md-3 mb-3";
      card.innerHTML = `
                <div class="card h-100">
                    <div class="card-header bg-dark text-white">
                        <h4 class="heading"><span class="ml-0">${newPost.userId}.</span> ${newPost.title}</h4>
                    </div>
                    <div class="card-body bg-light">
                        <p>${newPost.body}</p>
                    </div>
                    <div class="card-footer bg-dark text-white d-flex justify-content-between">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-info">Edit</button>
                        <button onclick="onDelete(this)" class="btn btn-sm btn-warning">Remove</button>
                     </div>
                </div>
            `;
      postContainer.prepend(card);
      snackbar(
        `New post with name ${newPost.title} created successfully`,
        "success",
      );
    })
    .catch((err) => {
      cl(err);
      snackbar(err, "error");
    })
    .finally(() => {
      onspinnerHandle();
    });
}

//edit and update
function onEdit(ele) {
  let editId = ele.closest(".col-md-3").id;
  // cl(editId)

  state.editId = editId;

  let editObj = state.postArray.find((e) => e.id === editId);
  // cl(editObj)

  title.value = editObj.title;
  userId.value = editObj.userId;
  content.value = editObj.body;

  addPost.classList.add("d-none");
  updatePost.classList.remove("d-none");
}

function onUpdate() {
  let updateId = state.editId;
  // cl(updateId)

  let update_url = `${base_url}/posts/${updateId}.json`;

  let updateObj = {
    title: title.value,
    body: content.value,
    userId: userId.value,
    id: updateId,
  };
  postForm.reset();
  onspinnerHandle(true);
  fetch(update_url, {
    method: "PATCH",
    body: JSON.stringify(updateObj),
    headers: {
      "content-type": "application/json",
      auth: "token from LS",
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("error");
      }
      return res.json();
    })
    .then((data) => {
      let idx = state.postArray.findIndex((e) => e.id === updateId);
      state.postArray[idx] = updateObj;

      let col = document.getElementById(updateId);
      col.innerHTML = `<div class="card h-100">
                    <div class="card-header bg-dark text-white">
                        <h4 class="heading"><span class="ml-0">${updateObj.userId}.</span> ${updateObj.title}</h4>
                    </div>
                    <div class="card-body bg-light">
                        <p>${updateObj.body}</p>
                    </div>
                    <div class="card-footer bg-dark text-white d-flex justify-content-between">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-info">Edit</button>
                        <button onclick="onDelete(this)" class="btn btn-sm btn-warning">Remove</button>
                     </div>
                </div>`;
      snackbar(
        `Post with name ${updateObj.title} updated successfully`,
        "success",
      );
      addPost.classList.remove("d-none");
      updateObj.classList.add("d-none");
    })
    .catch((err) => {
      cl(err);
      snackbar(err, "error");
    })
    .finally(() => {
      onspinnerHandle();
    });
}

//delete
function onDelete(ele) {
  let deleteId = ele.closest(".col-md-3").id;
  // cl(deleteId)

  let deleteUrl = `${base_url}/posts/${deleteId}.json`;

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      onspinnerHandle(true);
      fetch(deleteUrl, {
        method: "DELETE",
        body: null,
        headers: {
          "content-type": "application/json",
          auth: "token from LS",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("error");
          }
          return res.json();
        })
        .then((data) => {
          let idx = state.postArray.findIndex((e) => e.id === deleteId);
          state.postArray.splice(idx, 1);

          ele.closest(".col-md-3").remove();

          snackbar(`post with id ${deleteId} deleted successfully`, "success");
        })
        .catch((err) => {
          cl(err);
          snackbar(err, "error");
        })
        .finally(() => {
          onspinnerHandle();
        });
    }
  });
}

postForm.addEventListener("submit", onSubmit);
updatePost.addEventListener("click", onUpdate);
