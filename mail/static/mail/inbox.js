document.addEventListener('DOMContentLoaded', function () {

  var emailView = document.getElementById('emails-view')
  var composeView = document.getElementById('compose-view')
  var displayEmailView = document.getElementById('view-emails-view')

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'))
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'))
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'))
  document.querySelector('#compose').addEventListener('click', compose_email)

  // By default, load the inbox
  load_mailbox('inbox')

  function displayView(view) {
    if (view === 'emails-view') {
      emailView.style.display = 'block'
      composeView.style.display = 'none'
      displayEmailView.style.display = 'none'
    } else if (view === 'compose-view') {
      emailView.style.display = 'none'
      composeView.style.display = 'block'
      displayEmailView.style.display = 'none'
    } else {
      emailView.style.display = 'none'
      composeView.style.display = 'none'
      displayEmailView.style.display = 'block'
    }
  }

  function compose_email() {

    // Show compose view and hide other views
    displayView('compose-view')

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = ''
    document.querySelector('#compose-subject').value = ''
    document.querySelector('#compose-body').value = ''

    // When the user clicks on the Submit button, call the send_mail function.
    const form = document.getElementById('compose-form')

    form.addEventListener('submit', (event) => {
      // stop form submission
      event.preventDefault()
      // call the send_mail
      send_mail()
    })

  }

  function send_mail() {
    //Make a POST request to /emails, passing in values for recipients, subject, and body.

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
      })
    })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result)
        // If successful, load the user’s sent mailbox. If not, show error msg.
        if (result.ok) {
          console.log(`${result.message}`)
          load_mailbox('sent')
        }
        else {
          document.querySelector('small').innerText = result.error
        }
      })
  }


  function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    displayView('emails-view')

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`

    //Request the emails for a particular mailbox

    fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(emails => {
        // ... do something else with email ...
        emails.forEach(email => {
          const mail = document.createElement('div')
          if (email.read) {
            mail.setAttribute('id', 'mail_read')
          } else {
            mail.setAttribute('id', 'mail_unread')
          }
          mail.setAttribute('class', 'container')

          document.querySelector('#emails-view').append(mail)
          if (mailbox == "inbox") {
            const archieveButton = document.createElement('button')
            archieveButton.setAttribute('class', 'btn btn-outline-primary btn-sm')
            archieveButton.innerHTML = 'Archive'
            archieveButton.addEventListener('click', function () {
              archive_email(email.id)
            })
            document.querySelector('#emails-view').append(archieveButton)
          } else if (mailbox == "archive") {
            const unarchieveButton = document.createElement('button')
            unarchieveButton.setAttribute('class', 'btn btn-outline-primary btn-sm')
            unarchieveButton.innerHTML = 'Unarchive'
            unarchieveButton.addEventListener('click', function () {
              unarchive_email(email.id)
            })
            document.querySelector('#emails-view').append(unarchieveButton)
          }

          mail.innerHTML = `From:<strong>${email.sender}</strong>  Subject:${email.subject}   ${email.timestamp}`

          mail.addEventListener('click', function () {
            view_email(email.id)
          })

        })
      })

  }

  function view_email(email_id) {

    // Show email display view and hide other views
    displayView('display-emails-view')

    // make a GET request to request the email with the id
    fetch(`/emails/${email_id}`)
      .then(response => response.json())
      .then(email => {
        // Print email
        console.log(email)
        document.querySelector('#display-email').innerHTML = `<h3>${email.subject}</h3>${email.sender} ${email.timestamp} <br>to ${email.recipients}<br><br>${email.body}`

      })
    //Mark the email as read
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })

    document.querySelector('#reply').addEventListener('click', function () {
      reply_email(email_id)
    })


  }

  function reply_email(email_id) {
    // Show compose view and hide the others
    displayView('compose-view')

    // make a GET request to request the email with the id
    fetch(`/emails/${email_id}`)
      .then(response => response.json())
      .then(email => {
        // Prefill the composition fields
        document.querySelector('#compose-recipients').value = `${email.sender}`
        document.querySelector('#compose-subject').value = `Re:${email.subject}`
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`
      })

    // When the user clicks on the Submit button, call the send_mail function.
    const form = document.getElementById('compose-form')

    form.addEventListener('submit', (event) => {
      // stop form submission
      event.preventDefault()
      // call the send_mail
      send_mail()
    })

  }


  function archive_email(email_id) {
    //Archive the email 
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    load_mailbox('inbox')
  }

  function unarchive_email(email_id) {
    // unArchive the email 
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    load_mailbox('inbox')
  }

})




