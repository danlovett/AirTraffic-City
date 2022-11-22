let reason = CryptoJS.AES.decrypt(window.location.href.split('?')[1], "authentication-error").toString(CryptoJS.enc.Utf8)

if(reason == 'noAuth') {
    $('<p>', {
        text: 'Please login.',
        id: 'auth-error',
        class: 'text-red color-black text-center m10 fs15'
    }).appendTo('.sep')
}

setTimeout(() => {
    $("#auth-error").hide('slow', () => { $target.remove() });
}, 3000);
