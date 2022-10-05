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

function processHTML(place, errorDisplay) {
    $(`#${place}`).attr('placeholder', `${validationError(`${errorDisplay}`)}`)

}


$('#signup-form').on('submit', function(event) {
    event.preventDefault();

    let name = $('#signup-full-name').val()
    let email = $('#signup-email').val()
    let password = $('#signup-password').val()

    let firstName = name.split(' ')[0]

    //validate name
    if(name.includes(' ') == 1) {
        if(firstName.length <= 3) {
            processHTML('signup-full-name', 'nickname')
        } else {
            validName = true
        }
    } else {
        processHTML('signup-full-name', 'nameSpace')
    }
    
    if(firstName.length <= 3) {
        processHTML('signup-full-name', 'nickname')
    } else {
        validName = true
    }

    //validate email
    if(email.includes('@') && email.includes('.')) {
        $.get('../pkg/JSON/users.json', function(data) {
            if(data.users.emails.length != 0 && data.users.emails.includes(email)) {
                processHTML('signup-email', 'emailExists')
            } else {
                validEmail = true
            }
        })
    } else {
        processHTML('signup-email', 'emailFormat')
    }


    document.getElementById('signup-full-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
})