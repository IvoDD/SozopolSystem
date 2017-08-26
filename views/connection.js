var socket = io();

socket.on('init', (competitionName)=>{
    setUp(competitionName);
});