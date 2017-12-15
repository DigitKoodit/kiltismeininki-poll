'use strict';

(function() {

    const goodMoodB = document.getElementById('goody-moody');
    const okMoodB = document.getElementById('okey-moody');
    const badMoodB = document.getElementById('bady-moody');

    const title = document.getElementById('title');
    const moodText = document.getElementById('current-mood');

    goodMoodB.onclick = function() {sendMood(1)};
    okMoodB.onclick = function() {sendMood(0)};
    badMoodB.onclick = function() {sendMood(-1)};

    const state = loadState();
    let lastClicked = state ? state.lastClicked : 0;
    console.log(state.lastClicked);

    const API_URL = 'https://digit.niemisami.com/api/guild/mood';
    requestMood();

    function sendMood(mood) {
        if(!fetch) {
            showMessage('Nääh et pysty lähettämään meinikiä. Hanki uudempi selain!');
            return;
        }

        var millisSinceLastClick = +new Date() - lastClicked;

        if(millisSinceLastClick < 10000) {
            showMessage('Odotappa vielä ' + (10 - (millisSinceLastClick / 1000)) + ' sekuntia');
            return;
        }

        fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({mood: mood}),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(parseJson)
            .then(function(response) {
                lastClicked = new Date().getTime();
                saveState({
                    lastClicked: lastClicked
                });

                if(response.status === 404) {
                    throw new Error(response.statusText);
                }
                showMessage('KIITTI!');
                showMood(response.mood, response.hours);
            })
        .catch(function(reason) {
            showMessage('SHII! MEININKIÄ EI VOITU VÄLITTÄÄ :\'(');
        })
    }

    function requestMood() {
        fetch(API_URL)
            .then(parseJson)
            .then(function(response) {
                showMood(response.mood, response.hours);
            });
    }

    function parseJson(response) {

        var contentType = response.headers.get("content-type");
        if(contentType && contentType.includes("application/json")) {
            return response.json();
        }
        throw new TypeError("Oops, we haven't got JSON!");
    }

    function showMessage(message) {
        title.innerHtml = message;
        title.textContent = message;
        return;
    }

    function showMood(mood, hours) {
        moodText.innerHtml = 'Meininki viimeisen ' + hours + ' tunnin aikana ' + mood;
        moodText.textContent = 'Meininki viimeisen ' + hours + ' tunnin aikana ' + mood;
        return;
    }


    function loadState() {
        if(!Storage) {
            console.log('No access to storage');
            return; 
        }
        try {
            const serializedState = localStorage.getItem('state');
            if(serializedState === null) {
                return undefined;
            }
            return JSON.parse(serializedState);
        } catch(err) {
            console.log(err);
            return undefined;
        }
    }
    function saveState(state) {
        if(!Storage) {
            console.log('No access to storage');
            return; 
        }
        try {
            const serializedState = JSON.stringify(state);
            localStorage.setItem('state', serializedState);
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }
})();
