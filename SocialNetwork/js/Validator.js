class Validator {
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

    if (elFields[fieldName].email) {
      if (!this.validateEmail(fieldValue)) {
        this.errors[fieldName].push('Neispravna email adresa');
      }
    }

    if (elFields[fieldName].username) {
      if (!this.validateUserName(fieldValue)) {
        this.errors[fieldName].push('Neispravno korisničko ime');
      }
    }

    if (fieldValue.length < elFields[fieldName].minlength || fieldValue.length > elFields[fieldName].maxlength) {
      this.errors[fieldName].push(`Polje mora imati minimalno ${elFields[fieldName].minlength} i maksimalno ${elFields[fieldName].maxlength} karaktera`);
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
    const email_string = `[A-Z0-9._%#+-]+@(?:[A-Z0-9.-]+\.[A-Z]{2,4}|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\])`;
    if (email_string.test(email)) {
      return true;
    }

    return false;
  }

  validateUserName(username) {
    const name_string = `^(?=.{5,20}$)(?:[a-zA-Z\d]+(?:(?:\.|-|_)[a-zA-Z\d])*)+$`;
    if (name_string.test(username)) {
      return true;
    }

    return false;
  }
}
