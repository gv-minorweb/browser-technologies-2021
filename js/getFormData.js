import getLocalStorage from './getLocalStorage.js'

function getFormData() {
  let formData

  if (window.localStorage) {
    formData = getLocalStorage('formData')
  }

  return formData
}

export default getFormData