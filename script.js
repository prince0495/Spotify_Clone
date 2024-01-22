main()
var songs;
var currentFolder;
async function getSongs(folder){
    currentFolder = folder
    songs = []
    let a = await fetch(`/${currentFolder}/`)
    let response = await a.text()
    let element = document.createElement("div")
    element.innerHTML = response
    let linksOfSongs = element.getElementsByTagName("a")
    for (let i = 0; i < linksOfSongs.length; i++) {
        const e = linksOfSongs[i];
        if(e.href.endsWith(".mp3")){
            songs.push(e.href.split(`/${currentFolder}/`)[1])
        }
    }
    // Show all the songs in the Playlist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""
    for (const song of songs) {
        let artistName = song.replaceAll("%20", " ").split("_")[1]
        if(artistName== undefined){
            artistName = ""
        }
        songUl.innerHTML += `<li>
        <div class="music-side-cover">
            <div class="first-music-side-cover">
                <img src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>${artistName}</div>
                </div>
            </div>
            <div class="play-music">
                <span>Play Music</span>
                <img src="img/play.svg" alt="">
            </div>
        </div>
    </li>`
    }
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}
let currentAudio = new Audio()
function playMusic(track, pause=false){
    currentAudio.src = `/${currentFolder}/` + track
    if(!pause){
        currentAudio.play()
        document.getElementById("play").src = "img/pause.svg"
    }
    document.querySelector(".song-info").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"
}
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
// Display Albums
async function displayAlbums(){
    let a = await fetch(`/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        if(e.href.includes("/songs/") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
            <div class="play">
                <img src="img/playmusic.svg" alt="">
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`

        }
    }

    // Add event listener to card
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}
// Main
async function main(){
    await getSongs("songs/playlist_1")
    playMusic(songs[0], true)
    displayAlbums()
    if(currentAudio.paused){
        document.getElementById("play").src = "img/playmusic.svg"
    }
    else{
        document.getElementById("play").src = "img/pause.svg"
    }
   
    // Adding event listener to play, pause, next
    let play = document.getElementById("play")
    play.addEventListener("click", ()=>{
        if(currentAudio.paused){
            currentAudio.play()
            play.src = "img/pause.svg"
        }
        else{
            currentAudio.pause()
            play.src = "img/playmusic.svg"
        }
    })
    currentAudio.addEventListener("timeupdate", ()=>{
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentAudio.currentTime)} / ${secondsToMinutesSeconds(currentAudio.duration)}`
        document.querySelector(".circle").style.left = ((currentAudio.currentTime/currentAudio.duration)*100 - 1) + "%";
    })
    document.querySelector(".progress-bar").addEventListener("click", e=>{
        let percentage = e.offsetX/e.target.getBoundingClientRect().width * 100 - 1;
        document.querySelector(".circle").style.left = percentage + "%"
        currentAudio.currentTime = (currentAudio.duration*(percentage + 1))/100
    })
    // Add Event listener to hamburger
    document.getElementById("hamburger").addEventListener("click", e=>{
        document.querySelector(".left").style.left = "0"
        document.querySelector(".right").style.opacity = "0.5"
    })
    document.getElementById("cross").addEventListener("click", e=>{
        document.querySelector(".left").style.left = "-120%"
        document.querySelector(".right").style.opacity = "1"
    })
    // Add Event listener to previous and next
    previous.addEventListener("click", e=>{
        let index = songs.indexOf(currentAudio.src.split(`/${currentFolder}/`)[1]);
        if(index-1>=0){
            playMusic(songs[index-1])
        }
    })
    next.addEventListener("click", e=>{
        let index = songs.indexOf(currentAudio.src.split(`/${currentFolder}/`)[1]);
        if(index+1 < songs.length){
            playMusic(songs[index+1])
        }
    })
    // Add event listener to song volume
    let volume = document.getElementById("song-volume")
    volume.addEventListener("click", e=>{
        currentAudio.volume = parseInt(e.target.value) / 100;
        if(currentAudio.volume>0){
            document.querySelector(".volume").firstElementChild.src = document.querySelector(".volume").firstElementChild.src.replace("mute.svg", "volume.svg");
        }
    })
    // Add event listener to mute track
    document.querySelector(".volume").firstElementChild.addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentAudio.volume = 0;
            document.getElementById("song-volume").value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentAudio.volume = 0.2;
            document.getElementById("song-volume").value = 20;
        }
    })
    volume.addEventListener("touchend", e => {
        console.log(parseInt(e.target.value));
        currentAudio.volume = parseInt(e.target.value) / 100;
    })
    let srcCheck = true;
    // Add event listener to repeat button
    document.querySelector(".repeat").firstElementChild.addEventListener("click", e=>{
        if(e.target.src.includes("repeat.svg")){
            srcCheck = false;
            e.target.src = e.target.src.replace("repeat.svg", "repeat2.svg")
        }
        else{
            srcCheck = true;
            e.target.src = e.target.src.replace("repeat2.svg", "repeat.svg")
        }
    })
    // When song finished
    currentAudio.addEventListener("ended", e=>{
        document.getElementById("play").src = "img/playmusic.svg"
        if(srcCheck){
            let index = songs.indexOf(currentAudio.src.split(`/${currentFolder}/`)[1]);
            if(index+1 < songs.length){
                playMusic(songs[index+1])
            }
        }
        else{
            let index = songs.indexOf(currentAudio.src.split(`/${currentFolder}/`)[1]);
            playMusic(songs[index])
        }
    })
    let mediaQuery = window.matchMedia("(max-width: 701px)")
    async function bottomHandle(mediaQuery){
        let a = await fetch(`/songs/`)
            setTimeout(() => {
                document.querySelector(".card-container").lastElementChild.style.marginBottom  = "20vh"
            }, 12000);
    }
    bottomHandle(mediaQuery)
    // Add event listener to space
    document.addEventListener("keydown", e=>{
        if(e.key==" "){
            if(currentAudio.paused){
                currentAudio.play()
                play.src = "img/pause.svg"
            }
            else{
                currentAudio.pause()
                play.src = "img/playmusic.svg"
            }
        }
    })
}