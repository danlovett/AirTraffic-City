let validName, validEmail, validPassword

function cipherPassword(string) {
    string = string.toUpperCase();
    return string.replace(/[A-Z]/g, rot13);
  
    function rot13(c) {
        const charCode = c.charCodeAt();
        //A = 65, Z = 90
        return String.fromCharCode(
            ((charCode + 13) <= 90) ? charCode + 13 : (charCode + 13) % 90 + 64
        )
    }
}

function validationError(error) {
    switch (error) {
        case 'nickname':
            return 'Nickname!';
        case 'nameSpace':
            return 'There\'s not a space';
        case 'emailExists':
            return 'user exists; login?'
        case 'emailFormat':
            return 'must contain @ and .'
        default:
            break;
    }
}

function formAnswer(type) {
    if(type == 'name') {
        itemTextReponse = '^ Full name must contain a <strong>space</strong> ^'
    } else if(type == 'email') {
        itemTextReponse = '^ Email must contain an <strong>"@" and "."</strong> ^'
    } else if(type == 'nickname') {
        type = 'name';
        itemTextReponse = '^ Are you sure that is not a <strong>nickname</strong>? ^'
    } else if(type == 'password') {
        itemTextReponse = '^ Needs to be <strong>at least 6 characters long</strong> ^'
    }

    if(type != 'success') {
        $("<p>", {
            text: `${itemTextReponse}`,
            class: 'errorMessage'
        }).appendTo(`#s-${type}`)
    } else {
        $('#signup-title').css('color', 'green')
    }
}


$('#signup-form').on('submit', function(event) {
    event.preventDefault();

    let name = $('#signup-full-name').val()
    let email = $('#signup-email').val()
    let password = $('#signup-password').val()

    let first_name = name.split(' ')[0]
    let last_name = name.split(' ')[1]

    //validate name
    if(name.includes(' ') == 1) {
        validName = true
    } else {
        formAnswer('name')
    }
    
    if(first_name.length <= 3) {
        formAnswer('nickname')
    } else {
        validName = true
    }

    //validate email
    if(email.includes('@') && email.includes('.')) {
        validEmail = true
    } else {
        formAnswer('email')
    }

    if(password.length >= 6) {
        validPassword = true
    } else {
        formAnswer('password')
    }

    if(validName && validEmail && validPassword) {
        formAnswer('success')
        appendUser(first_name, last_name, email, password)
    } 


    document.getElementById('signup-full-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
})