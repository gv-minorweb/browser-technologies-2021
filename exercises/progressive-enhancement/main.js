let recognition
let recognizing = false
let final_transcript = ''
let ignore_onend = false

const speechToggle = document.querySelector('.js-speech')
const lightBulb = document.querySelector('.js-lightbulb')

const speechResult = document.querySelector('.speech-result')
const speechResultFinal = speechResult.querySelector('.final')
const speechResultInterim = speechResult.querySelector('.interim')

const matchingWords = ['lights']

speechToggle.addEventListener('click', toggleSpeech)

if (!('webkitSpeechRecognition' in window)) {
  console.log('Speech is not supported')
} else {
  recognition = new webkitSpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-US'

  recognition.onstart = () => {
    recognizing = true
    speechToggle.classList.add('is-active')
    speechToggle.innerText = 'Stop speaking'
  }

  recognition.onend = () => {
    recognizing = false
    speechToggle.innerText = 'Start speaking'
    
    if (ignore_onend) return
    if (!final_transcript) return

    speechToggle.classList.remove('is-active')
    speechResult.classList.remove('is-speaking')

    const words = final_transcript.toLowerCase().split(' ')

    const isOn = matchWords(words, [...matchingWords, 'on'])
    const isOff = matchWords(words, [...matchingWords, 'off'])

    if (isOn) lightBulb.classList.add('is-on')
    if (isOff) lightBulb.classList.remove('is-on')
  }

  recognition.onresult = (e) => {
    let interim_transcript = ''

    if (typeof(e.results) == 'undefined') {
      recognition.onend = null
      recognition.stop()
      return
    }

    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        final_transcript += e.results[i][0].transcript
        recognition.stop()
      } else {
        interim_transcript += e.results[i][0].transcript
      }
    }

    speechResult.classList.add('is-speaking')

    speechResultFinal.innerText = final_transcript
    speechResultInterim.innerText = interim_transcript
  }
}

function matchWords(source, against) {
  const match = against.every(word => source.includes(word))
  return match
}

function toggleSpeech(e) {
  console.log(recognition)
  if (recognizing) {
    recognition.stop()
    speechToggle.classList.remove('is-active')
    return
  }

  final_transcript = ''

  recognition.start()

  ignore_onend = false
  speechResultFinal.innerText = ''
  speechResultInterim.innerText = ''
}