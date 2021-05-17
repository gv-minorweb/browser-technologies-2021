import { getPrevSibling, getNextSibling } from './getSibling.js'
import getFormData from './getFormData.js'

(function() {

  let formData = {}

  const form = document.querySelector('form')
  const formSections = form.querySelectorAll('.js-section')
  const formQuestions = form.querySelectorAll('.js-question') // Fieldset
  const formNavigation = form.querySelector('.js-navigation')
  const formInputs = form.querySelectorAll('input')
  const formSelects = form.querySelectorAll('select')
  const formSubmitBtn = form.querySelector('.js-submit')

  let activeQuestion = 1

  let progressBar
  let nextBtn
  let prevBtn

  // Check localStorage and fill form with data
  formData = getFormData('formData') || {}

  if (formData && Object.keys(formData).length !== 0) {
    formInputs.forEach((input) => {
      const elName = input.getAttribute('name')

      if (formData[elName]) {
        if (input.type === 'radio' && input.value == formData[elName]) {
          input.checked = true
        }

        if (input.type === 'checkbox' && formData[elName].includes(input.value)) {
          input.checked = true
        }

        if (input.type === 'text') {
          input.value = formData[elName]
        }
      }
    })

    formSelects.forEach((select) => {
      const elName = select.getAttribute('name')
      const options = select.options

      Array.prototype.forEach.call(options, (option, index) => {
        if (option.value == formData[elName]) {
          select.value = option.value
        } 
      })
    })
  }

  createSections()
  createNavigation()
  createProgressIndicator()

  // Show one section at a time
  function createSections() {
    // Sections
    formSections.forEach((section, index) => {      
      // Make first section active
      if (index > 0) section.classList.add('is-hidden')
      formSections[0].classList.add('is-active')

      const sectionQuestions = section.querySelectorAll('.js-question')
      // Questions
      sectionQuestions.forEach((question, index) => {
        // Make first question active
        if (index > 0) question.classList.add('is-hidden')
        sectionQuestions[0].classList.add('is-active')
      })
    })
  }

  function createNavigation() {
    // Navigation
    nextBtn = document.createElement('button')
    nextBtn.classList.add('button')
    nextBtn.type = 'button'
    nextBtn.innerText = 'Doorgaan'

    prevBtn = nextBtn.cloneNode()
    prevBtn.innerText = 'Terug'

    if (activeQuestion === 1) {
      prevBtn.classList.add('is-invisible')
    }

    nextBtn.addEventListener('click', navigate('next'))
    prevBtn.addEventListener('click', navigate('prev'))

    formNavigation.insertAdjacentElement('afterbegin', nextBtn)
    formNavigation.insertAdjacentElement('afterbegin', prevBtn)

    // Hide submit button if user is not on the last question
    if (activeQuestion !== formQuestions.length) {
      formSubmitBtn.classList.add('is-hidden')
    }
  }

  function navigate(direction) {
    return () => {
      const currentSection = document.querySelector('.js-section.is-active')
      const currentQuestion = currentSection.querySelector('.js-question.is-active')
      const currentQuestionFields = currentQuestion.querySelectorAll('input, select')

      const prevSection = getPrevSibling(currentSection, '.js-section')
      const nextSection = getNextSibling(currentSection, '.js-section')

      const prevQuestion = getPrevSibling(currentQuestion, '.js-question')
      const nextQuestion = getNextSibling(currentQuestion, '.js-question')

      if (direction === 'next') {
        // Not the last question, validating current question before progressing
        if (nextQuestion || nextSection) {
          let fieldsValid = []

          const errorMsg = currentQuestion.querySelector('.error-message') || document.createElement('span')
          
          // Validate current question
          currentQuestionFields.forEach((field, index) => {
            let fieldValidity

            if (field.type === 'checkbox') {
              fieldValidity = field.checked
            } else {
              fieldValidity = field.checkValidity()
            }

            fieldsValid = [...fieldsValid, fieldValidity]

            // Field is not valid, show error
            if (!fieldValidity) {
              field.classList.add('has-error')
            } else {
              field.classList.remove('has-error')
            }
          })
          
          const isValid = (el) => el === true

          // Question is invalid
          if (fieldsValid.some(isValid)) {
            errorMsg.innerText = ''
          } else {
            errorMsg.classList.add('error-message')
            errorMsg.innerText = currentQuestion.dataset.error
            currentQuestion.insertAdjacentElement('beforeend', errorMsg)
            return
          }

          updateActiveQuestion(activeQuestion + 1)
        }

        // Is not last question
        if (nextQuestion) {
          currentQuestion.classList.add('is-hidden')
          currentQuestion.classList.remove('is-active')
          nextQuestion.classList.remove('is-hidden')
          nextQuestion.classList.add('is-active')
        }
        else if (nextSection) {
          const firstQuestion = nextSection.querySelector('.js-question')
          firstQuestion.classList.remove('is-hidden')
          firstQuestion.classList.add('is-active')

          currentSection.classList.add('is-hidden')
          currentSection.classList.remove('is-active')

          nextSection.classList.remove('is-hidden')
          nextSection.classList.add('is-active')
        }
      }

      else if (direction === 'prev') {
        if (prevQuestion || prevSection) {
          updateActiveQuestion(activeQuestion - 1)
        }

        // Is not last question
        if (prevQuestion) {
          currentQuestion.classList.add('is-hidden')
          currentQuestion.classList.remove('is-active')
          prevQuestion.classList.remove('is-hidden')
          prevQuestion.classList.add('is-active')
        }
        else if (prevSection) {
          currentSection.classList.add('is-hidden')
          currentSection.classList.remove('is-active')

          prevSection.classList.remove('is-hidden')
          prevSection.classList.add('is-active')
        }
      }

      if (activeQuestion === 1) {
        prevBtn.classList.add('is-invisible')
      } else {
        prevBtn.classList.remove('is-invisible')
      }

      if (activeQuestion === formQuestions.length) {
        nextBtn.classList.add('is-hidden')
        formSubmitBtn.classList.remove('is-hidden')
      } else {
        nextBtn.classList.remove('is-hidden')
        formSubmitBtn.classList.add('is-hidden')
      }
    }
  }

  // Progress indicator
  function createProgressIndicator() {
    // Create progress bar
    progressBar = document.createElement('div')
    progressBar.classList.add('progress-bar')

    updateProgressIndicator()
    
    document.body.insertAdjacentElement('afterbegin', progressBar)

    // Set active question
    form.dataset.activeQuestion = activeQuestion
  }

  // Set correct width progress bar
  function updateProgressIndicator() {
    form.dataset.activeQuestion = activeQuestion
    progressBar.style.transform = `scaleX(${activeQuestion / formQuestions.length})`
  }

  function updateActiveQuestion(value) {
    activeQuestion = value
    updateProgressIndicator()
  }

  // Update form fields on input
  formInputs.forEach((input) => {
    input.addEventListener('input', updateInput)
  })

  formSelects.forEach((select) => {
    select.addEventListener('input', updateInput)
  })

  form.addEventListener('submit', handleFormSubmit)

  function updateInput(e) {
    const elName = this.getAttribute('name')
    const elValue = this.value

    if (this.type === 'checkbox') {
      const checkboxes = form.querySelectorAll(`input[name=${elName}]`)
      let checkboxesValues = []

      checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
          checkboxesValues[index] = checkbox.value
        }
      })

      formData[elName] = checkboxesValues
    } else {
      formData[elName] = elValue
    }

    if ('localStorage' in window) {
      localStorage.setItem('formData', JSON.stringify(formData))
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    alert('Form submitted')
  }

}())