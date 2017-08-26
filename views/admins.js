var socket = io();

socket.on('result', function(success){
    if (success){alert("Successful registration");}
    else{alert("Username taken!");}
})

function register(){
    socket.emit('register', document.getElementById("inputEmail").value, document.getElementById("inputPassword").value);
}