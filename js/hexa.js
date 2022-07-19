let switchComment = 0;

let session = new Session();
session_id = session.getSession();

if (session_id !== "") {

  async function populateUserData() {
    let user = new User();
    user = await user.get(session_id);

    document.querySelector('#username').innerText = user['username'];
    document.querySelector('#profile_email').innerText = user['email'];

    document.querySelector("#korisnicko_ime").value = user['username'];
    document.querySelector("#edit_email").value = user['email'];
    document.querySelector('#edit_lozinka').value = user['password'];
    document.querySelector('#edit_ponovi_lozinku').value = user['password'];

  }

  populateUserData();

} else {
  window.location.href = "index.html";
}

document.querySelector('#logout').addEventListener('click', e => {
  e.preventDefault();

  session.destroySession();
  window.location.href = "index.html";
});

document.querySelector('#editAccount').addEventListener('click', () => {
  document.querySelector('.custom-modal').style.display = 'block';
});

document.querySelector('#closeModal').addEventListener('click', () => {
  document.querySelector('.custom-modal').style.display = 'none';
});

/*   *********** */
let config = {
  'korisnicko_ime': {
    required: true,
    username: true,
    minlength: 5,
    maxlength: 50
  },

  'edit_email': {
    required: true,
    email: true,
    minlength: 5,
    maxlength: 50
  },

  'edit_lozinka': {
    required: true,
    minlength: 7,
    maxlength: 25,
    matching: 'ponovi_lozinku'
  },

  'edit_ponovi_lozinku': {
    required: true,
    minlength: 7,
    maxlength: 25,
    matching: 'edit_lozinka'
  }
};

let validator = new Validator(config, '#editForm');

document.querySelector('#editForm').addEventListener('submit', e => {
  e.preventDefault();

  if (validator.validationPassed()) {

    let user = new User();
    user.username = document.querySelector('#korisnicko_ime').value;
    user.email = document.querySelector('#edit_email').value;
    user.password = document.querySelector('#edit_lozinka').value;
    user.edit();

  } else {
    alert('Polja nisu dobro popunjena');
  }
});
/*   *********** */

document.querySelector('#btnDelete').addEventListener('click', e => {
  e.preventDefault();

  let text = 'Da li ste sigurni da želite da obrišete profil?';

  if (confirm(text) === true) {
    let user = new User();
    user.delete();
  }
});

document.querySelector('#postForm').addEventListener('submit', e => {
  e.preventDefault();

  let content = document.querySelector('#postContent').value;
  if (content === '') {
    alert('Post je prazan')
  } else {
    async function createPost() {

      document.querySelector('#postContent').value = '';
      let post = new Post();
      post.post_content = content;
      post = await post.create();

      let current_user = new User();
      current_user = await current_user.get(session_id);

      let html = document.querySelector('#allPostsWrapper').innerHTML;

      let delete_post_html = '';

      if (session_id === post.user_id) {
        delete_post_html = '<button onclick="removeMyPost(this)" title="Brisanje posta" class="remove-btn">x</button>';
      }

      document.querySelector('#allPostsWrapper').innerHTML = `<div class="single-post" data-post_id="${post.id}">
                                                                    <div class="post-content"><span class="autor">My post: </span>${post.content}</div>

                                                                    <div class="post-action">

                                                                        <div>
                                                                            <button onclick="likePost(this)" class="likePostJS like-btn"><span>${post.likes}</span> Likes</button>
                                                                            <button onclick="commentPost(this)" class="comment-btn">Comments</button>
                                                                            ${delete_post_html}
                                                                        </div>
                                                                    </div>

                                                                    <div class="post-comments">
                                                                        <form>
                                                                            <input placeholder="Napiši komentar..." type="text">
                                                                            <button onclick="commentPostSubmit(event)">OK</button>
                                                                        </form>
                                                                    </div>
                                                                </div>
                                                                ` + html;
    }

    createPost();
  };
});

async function getAllPosts() {
  let all_posts = new Post();
  all_posts = await all_posts.getAllPosts();

  all_posts.forEach(post => {
    async function getPostUser() {

      let user = new User();
      user = await user.get(post.user_id);

      let comments = new Comment();
      comments = await comments.get(post.id);

      comments_length = comments.length;

      let comments_html = '';
      if (comments.length > 0) {
        comments.forEach(comment => {
          if (session_id === comment.user_id) {
            comments_html += `<div class="single-comment">
                                  <span class="left-comment">${comment.content}</span>
                                  <span class="right-comment" data-comment_id="${comment.id}"><button onclick="removeMyComment(this)" title="Brisanje komentara" class="comment-remove">x</button></span>
                              </div>`;
          } else {
            comments_html += `<div class="single-comment">
                                  <p class="comment-user"><span class="comment-user-name">${comment.user_name}: </span>${comment.content}</p>
                              </div>`;
          }
        });
      }

      let html = document.querySelector('#allPostsWrapper').innerHTML;

      let delete_post_html = '';

      let korisnik = '';
      if (session_id === post.user_id) {
        delete_post_html = '<button onclick="removeMyPost(this)" title="Brisanje posta" class="remove-btn">x</button>';
        korisnik = 'My post: ';
      } else {
        korisnik = `${user.username}'s post: `;
      }

      document.querySelector('#allPostsWrapper').innerHTML = `<div class="single-post" data-post_id="${post.id}">
                                                                  <div class="post-content"><span class="autor">${korisnik} </span>${post.content}</div>

                                                                  <div class="post-action">
                                                                      <div>
                                                                          <button onclick="likePost(this)" class="likePostJS like-btn"><span>${post.likes}</span> Likes</button>
                                                                          <button onclick="commentPost(this)" class="comment-btn"><span>${comments_length}</span> Comments</button>
                                                                          ${delete_post_html}
                                                                      </div>
                                                                  </div>

                                                                  <div class="post-comments">
                                                                      <form>
                                                                          <input placeholder="Napiši komentar..." type="text">
                                                                          <button onclick="commentPostSubmit(event)">OK</button>
                                                                      </form>
                                                                      ${comments_html}
                                                                  </div>
                                                              </div>
                                                              ` + html;
    }

    getPostUser();
  });
}

getAllPosts();

const commentPostSubmit = e => {
  e.preventDefault();

  let btn = e.target;
  // red ispod sam isključila da bi moglo da se piše više komentara
  //btn.setAttribute('disabled', 'true');

  let main_post_el = btn.closest('.single-post');
  let post_id = main_post_el.getAttribute('data-post_id');

  //let html = main_post_el.querySelector('.post-comments').innerHTML;

  let comment_value = main_post_el.querySelector('input').value;

  async function getCommentUserName() {

    let current_user = new User();
    current_user = await current_user.get(session_id);
    let comment_name = current_user.username;

    if (comment_value !== '') {
      main_post_el.querySelector('input').value = '';

      let comment = new Comment();
      comment.content = comment_value;
      comment.user_id = session_id;
      comment.post_id = post_id;
      comment.user_name = comment_name;
      comment.create();

      main_post_el.querySelector('.post-comments').innerHTML += `<div class="single-comment">
                            <span class="left-comment">${comment.content}</span>
                            <span class="right-comment" data-comment_id="${comment.id}"><button onclick="removeMyComment(this)" title="Brisanje komentara" class="comment-remove">x</button></span>
                        </div>`
    } else {
      alert('Komentar je prazan');
    }
  }
  getCommentUserName();
};

const removeMyPost = btn => {
  let post_id = btn.closest('.single-post').getAttribute('data-post_id');

  btn.closest('.single-post').remove();

  let post = new Post();
  post.delete(post_id);

};

const likePost = btn => {
  let main_post_el = btn.closest('.single-post');
  let post_id = btn.closest('.single-post').getAttribute('data-post_id');
  let number_of_likes = parseInt(btn.querySelector('span').innerText);

  btn.querySelector('span').innerText = number_of_likes + 1;
  btn.setAttribute('disabled', 'true');

  let post = new Post();
  post.like(post_id, number_of_likes + 1);
};

const commentPost = btn => {

  let main_post_el = btn.closest('.single-post');
  let post_id = main_post_el.getAttribute('data-post_id');

  if (switchComment === 0) {
    main_post_el.querySelector('.post-comments').style.display = 'block';
    switchComment = 1;
  } else if (main_post_el.querySelector('.post-comments').style.display === 'block') {
    main_post_el.querySelector('.post-comments').style.display = 'none';
  } else {
    main_post_el.querySelector('.post-comments').style.display = 'block';
  }
};

const removeMyComment = btn => {

  let comment_id = btn.closest('.right-comment').getAttribute('data-comment_id');

  btn.closest('.single-comment').remove();

  let comment = new Comment();
  comment.delete(comment_id);

  console.log('Komentar je obrisan')
};
