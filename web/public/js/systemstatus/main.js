let mqtt
const reconnectTimeout = 2000
const host = 'mqtt'
const port = 9001
// const eventsContainer = document.getElementById('events-container')
const userEvents = document.getElementById('user-events')
const computerEvents = document.getElementById('computer-events')
const regex = new RegExp('computers/(status|login|logout|processedcommand|commands)/([a-zA-Z0-9-]+)', 'i')

function onConnect () {
  console.log('Connected')
  mqtt.subscribe('computers/#')
}

function onFailure () {
  console.log('Connection Attempt to Host ' + host + ' failed')
  setTimeout(MQTTConnect, reconnectTimeout)
}

async function getUserInfo (user) {
  const url = `/api/user/${user}`
  const data = await axios.get(url)
  return {
    fullName: data.data.data.fullNameRev,
    photo: data.data.data.photo
  }
}

async function createLogElement (msg) {
  const data = msg.destinationName.match(regex)
  const action = data[1]
  const host = data[2]
  const payload = msg.payloadString
  if (action && host) {
    const card = document.createElement('div')
    card.className = 'card d-flex flex-row flex-wrap animated mr-1 mb-1'
    const date = (new Date()).toLocaleString()
    let str = `${date} `
    let payloadObject
    switch (action) {
      case 'status':
        str += `<a target="_blank" href="/computer/status/${host}">${host}</a> `
        if (payload === 'online') {
          str += 'se ha encendido'
        } else {
          str += 'se ha apagado'
        }
        break
      case 'login':
        str += `<a target="_blank" href="/user/${payload}">${payload}</a> ha iniciado sesión en <a target="_blank" href="/computer/user/${host}">${host}</a>`
        break
      case 'logout':
        str += `<a target="_blank" href="/user/${payload}">${payload}</a> ha cerrado sesión en <a target="_blank" href="/computer/user/${host}">${host}</a>`
        break
      case 'processedcommand':
        payloadObject = JSON.parse(payload)
        str += `<a target="_blank" href="/computer/status/${host}">${host}</a> ha ejecutado el comando ${payloadObject.PROCESSEDCOMMAND}`
        break
      case 'commands':
        payloadObject = JSON.parse(payload)
        str += `petición de ${payloadObject.COMMAND} para <a target="_blank" href="/computer/status/${host}">${host}</a>`
        break
    }
    const cardBlock = document.createElement('div')
    cardBlock.className = 'card-block d-flex flex-column'

    const bodyText = document.createElement('p')
    bodyText.className = 'card-text'

    // const strEl = document.createTextNode(str);
    // bodyText.appendChild(strEl);

    bodyText.innerHTML = str

    cardBlock.appendChild(bodyText)

    card.appendChild(cardBlock)

    if (action === 'login' || action === 'logout') {
      const { fullName, photo } = await getUserInfo(payload)
      const photoEl = document.createElement('img')
      photoEl.src = photo
      photoEl.className = 'card-img-top rounded-circle p-1'
      // photoEl.style.width = '40px';
      // photoEl.style.maxHeight = '45px';
      // photoEl.style.alignSelf = 'center';
      card.prepend(photoEl)

      // put fullName paragraph
      const fullNameText = document.createElement('p')
      fullNameText.className = 'card-text'
      const fullNameStr = document.createTextNode(fullName)
      // fullNameText.style.marginTop = '-1rem';
      fullNameText.appendChild(fullNameStr)

      cardBlock.appendChild(fullNameText)

      if (action === 'login') {
        card.classList.add('flipInX', 'text-white', 'bg-success')
      } else {
        card.classList.add('flipInY', 'text-white', 'bg-danger')
      }
      userEvents.prepend(card)
    } else {
      if (action === 'status') {
        card.classList.add('p-1')
        if (payload === 'online') {
          card.classList.add('flipInX', 'text-white', 'bg-success')
        } else {
          card.classList.add('flipInY', 'text-white', 'bg-danger')
        }
      } else {
        card.classList.add('lightSpeedIn', 'text-white', 'bg-info')
      }
      computerEvents.prepend(card)
    }
  }
}

function onMessageArrived (msg) {
  createLogElement(msg)
}

function MQTTConnect () {
  console.log('Connecting to ' + host)
  mqtt = new Paho.MQTT.Client(host, port, 'clientjs')
  const options = {
    timeout: 3,
    onSuccess: onConnect,
    onFailure: onFailure
  }
  mqtt.onMessageArrived = onMessageArrived
  mqtt.connect(options)
}

MQTTConnect()
