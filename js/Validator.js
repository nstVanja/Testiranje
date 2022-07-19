class Validator {
  api_url = 'https://62a6efa397b6156bff8300bc.mockapi.io';
  constructor(config, formID) {
    this.elementsConfig = config;
    this.formID = formID;
    this.errors = {};

    this.generateErrorsObject();
    this.inputListener();
  }

  generateErrorsObject() {
    for (let field in this.elementsConfig) {
      this.errors[field] = [];
    }
  }

  inputListener() {
    let inputSelector = this.elementsConfig;

    for (let field in inputSelector) {
      let el = document.querySelector(`${this.formID} input[name="${field}"]`);

      el.addEventListener('input', this.validate.bind(this));
    }
    console.log('inputSelector');
    console.log(inputSelector);
  }

  validate(e) {
    let elFields = this.elementsConfig;

    let field = e.target;
    let fieldName = field.getAttribute('name');
    let fieldValue = field.value;

    this.errors[fieldName] = [];

    if (elFields[fieldName].required) {
      if (fieldValue === '') {
        this.errors[fieldName].push('Polje je prazno');
      }
    }



    //   ** Provera username - duplikat i space **    //
    if (fieldName === 'korisnicko_ime') {

      let valid_user = document.querySelector('#korisnicko_ime').value;

      const podaci = fetch(this.api_url + '/users')
        .then((response) => response.json())
        .then((data) => {
          return data;
        });

      const checkDuplicate = async () => {
        const db_user = await podaci;

        let uzetiId = 0;
        let ca = document.cookie.split('=');

        if (ca == '') {
          uzetiId = 0;
          console.log('uzetiId ' + uzetiId);
        } else {
          uzetiId = ca[1];
          console.log('uzetiId ' + uzetiId);
        }

        for (let i = 0; i < db_user.length; i++) {
          console.log('valid_user ' + valid_user);

          if (db_user[i].username === valid_user && uzetiId === 0) {
            this.errors[fieldName].push('Korisničko ime već postoji');
            alert('Korisničko ime već postoji');
            break;
          }
          if (db_user[i].username === valid_user && uzetiId !== db_user[i].user_id) {
            this.errors[fieldName].push('Korisničko ime već postoji');
            alert('Korisničko ime već postoji');
            break;
          }
        }
      };
      checkDuplicate();

    }
    //   ******************    //

    if (fieldName === 'korisnicko_ime') {

      if (!this.validateUserName(fieldValue)) {
        this.errors[fieldName].push('Korisničko ime ne sme da sadrži space karakter');
      } else {
        console.log('Ispravno korisničko ime');
      }
    }

    if (elFields[fieldName].email) {
      if (!this.validateEmail(fieldValue)) {
        this.errors[fieldName].push('Neispravna email adresa');
      }
    }

    if (fieldValue.length < elFields[fieldName].minlength || fieldValue.length > elFields[fieldName].maxlength) {
      this.errors[fieldName].push(`Polje mora imati minimalno ${elFields[fieldName].minlength}, a maksimalno ${elFields[fieldName].maxlength} karaktera`);
    }

    if (elFields[fieldName].matching) {
      let matchingEl = document.querySelector(`${this.formID} input[name="${elFields[fieldName].matching}"]`);

      if (fieldValue !== matchingEl.value) {
        this.errors[fieldName].push('Lozinke se ne poklapaju');
      }

      if (this.errors[fieldName].length === 0) {
        this.errors[fieldName] = [];
        this.errors[elFields[fieldName].matching] = [];
      }
    }

    this.populateErrors(this.errors);
  }

  validationPassed() {
    for (let key of Object.keys(this.errors)) {
      if (this.errors[key].length > 0) {
        return false;
      }
    }
    return true;
  }

  populateErrors(errors) {
    for (const elem of document.querySelectorAll('ul')) {
      elem.remove();
    }

    for (let key of Object.keys(errors)) {
      let parentElement = document.querySelector(`${this.formID} input[name="${key}"]`).parentElement;
      let errorsElement = document.createElement('ul');
      parentElement.appendChild(errorsElement);

      errors[key].forEach(error => {
        let li = document.createElement('li');
        li.innerText = error;

        errorsElement.appendChild(li);
      });
    }
  }

  validateEmail(email) {

    const valid = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (valid.test(email)) {
      return true;
    }

    return false;
  };

  validateUserName(username) {

    let position = username.search(/ /i);;
    if (position === -1) {
      return true;
    }

    return false;
  }
  //Moze i sa username trimovanjem

  /*
  const checkUsername = () => {

  let valid = false;
  const username = usernameEl.value.trim();

  if (!isRequired(username)) {
      showError(usernameEl, 'Username cannot be blank.');
  } else {
      showSuccess(usernameEl);
      valid = true;
  }
  return valid;
  }*/

}
