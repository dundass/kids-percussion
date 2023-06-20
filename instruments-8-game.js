var TwinklGame = TwinklGame || {};

(function (tw) {

    "use strict";

    var createContainer = function (state) {
        state = state || {};
        state.containerId = state.containerId || 'animation_container';
        var container = document.getElementById(state.containerId),
            containerStyle = container.style;

        var resize = function () {
            var aspectRatio = 1280 / 720,
                w = containerStyle.width,
                h = containerStyle.height,
                vw = document.documentElement.clientWidth,
                vh = document.documentElement.clientHeight;
            // vw = tw.Utils.clientWidth(),
            // vh = tw.Utils.clientHeight();
            // vw = window.innerWidth,
            // vh = window.innerHeight;

            if (vw / vh > aspectRatio) {
                w = vh * aspectRatio;
                h = vh;
                containerStyle.position = 'absolute';
                containerStyle.left = (vw - w) / 2 + 'px';
                containerStyle.top = 0 + 'px';
                containerStyle.width = w + 'px';
                containerStyle.height = '100%';
            } else {
                w = vw;
                h = vw / aspectRatio;
                containerStyle.position = 'absolute';
                containerStyle.left = 0 + 'px';
                containerStyle.top = (vh - h) / 2 + 'px';
                containerStyle.width = '100%';
                containerStyle.height = h + 'px';
                containerStyle.minHeight = h + 'px';
            }
            // container.style.width = w + "px";
            // container.style.height = h + "px";
        };

        window.addEventListener('resize', resize);
        resize();

        return {
            container: container,
            resize: resize
        }
    };
    
    var createUI = function (state) {
        state = state || {};
        state.fullScreenButtonId = state.fullScreenButtonId || "fullscreen-button";
        state.muteButtonId = state.muteButtonId || "mute-button";
        state.closeButtonId = state.closeButtonId || "close-button";
        state.helpButtonId = state.helpButtonId || "help-button";
        state.fullScreen = state.fullScreen || false;
        state.muted = state.muted || false;

        var fullScreenButton = document.getElementById(state.fullScreenButtonId),
            muteButton = document.getElementById(state.muteButtonId),
            closeButton = document.getElementById(state.closeButtonId),
            helpButton = document.getElementById(state.helpButtonId);

        var toggleFullScreen = function (e) {
            e.preventDefault();
            state.fullScreen = !state.fullScreen;
            state.fullScreen ? tw.Utils.makeFullScreen(state.containerId ? document.getElementById(state.containerId) : document.documentElement) : tw.Utils.leaveFullScreen();
            var s = ["expand-screen", "reduce-screen"];
            fullScreenButton.className = state.fullScreen ? fullScreenButton.className.replace(s[0], s[1]) : fullScreenButton.className.replace(s[1], s[0]);
        };

        var toggleMuted = function (e) {
            e.preventDefault();
            state.muted = !state.muted;
            var s = ["sound-off", "sound-on"];
            muteButton.className = state.muted ? muteButton.className.replace(s[0], s[1]) : muteButton.className.replace(s[1], s[0]);

        };

        var toggleHelping = function (e) {
            e.preventDefault();
            state.helping = !state.helping;
        };

        var close = function (e) {
            e.preventDefault();
            var title = document.getElementById('titleScreen') || document.getElementById('title-screen');
            if(title) title.style.display = 'block';
        };

        var getFullScreen = function () {
            return state.fullScreen;
        };

        var getMuted = function () {
            return state.muted;
        };

        var getHelping = function () {
            return state.helping;
        };

        // mouse events
        if(fullScreenButton) fullScreenButton.addEventListener("click", toggleFullScreen);
        if(muteButton) muteButton.addEventListener("click", toggleMuted);
        if(helpButton) helpButton.addEventListener("click", toggleHelping);
        if(closeButton) closeButton.addEventListener("click", close);

        // touch events
        if(fullScreenButton) fullScreenButton.addEventListener("touchstart", toggleFullScreen);
        if(muteButton) muteButton.addEventListener("touchstart", toggleMuted);
        if(helpButton) helpButton.addEventListener("touchstart", toggleHelping);
        if(closeButton) closeButton.addEventListener("touchstart", close);

        // TODO - not firing in chrome ? how to handle esc as well as FS button ??
        document.addEventListener("keydown", function (ev) {
            if(ev.keyCode === 27) state.fullScreen = false;
        });

        // document.addEventListener("fullscreenchange", function (ev) {
        //     console.log(document.fullscreen);
        //     if(document.fullscreen) state.fullScreen = false;
        // });
        
        return {
            fullScreenButton: fullScreenButton,
            muteButton: muteButton,
            closeButton: closeButton,
            helpButton: helpButton,
            getFullScreen: getFullScreen,
            getMuted: getMuted,
            getHelping: getHelping,
            toggleFullScreen: toggleFullScreen,
            toggleMuted: toggleMuted,
            toggleHelping: toggleHelping
        }
    };

    var addUI = function(state) {
        state = state || {};
        state.fullScreenButtonId = state.fullScreenButtonId || "fullscreen-button";
        state.muteButtonId = state.muteButtonId || "mute-button";
        state.closeButtonId = state.closeButtonId || "close-button";
        state.helpButtonId = state.helpButtonId || "help-button";
        state.fullScreen = state.fullScreen || false;
        state.muted = state.muted || false;

        return function (o) {

            var fullScreenButton = document.getElementById(state.fullScreenButtonId),
                muteButton = document.getElementById(state.muteButtonId),
                closeButton = document.getElementById(state.closeButtonId),
                helpButton = document.getElementById(state.helpButtonId);

            var fullScreenElement = state.containerId ? document.getElementById(state.containerId) : document.documentElement;

            var triggerFullScreen = function () {
                state.fullScreen ? tw.Utils.makeFullScreen(fullScreenElement) : tw.Utils.leaveFullScreen();
            };

            var toggleFullScreen = function (e) {
                e.preventDefault();
                state.fullScreen = !state.fullScreen;
                triggerFullScreen();
                var s = ["expand-screen", "reduce-screen"];
                fullScreenButton.className = state.fullScreen ? fullScreenButton.className.replace(s[0], s[1]) : fullScreenButton.className.replace(s[1], s[0]);
            };

            var toggleMuted = function (e) {
                e.preventDefault();
                state.muted = !state.muted;
                var s = ["sound-off", "sound-on"];
                muteButton.className = state.muted ? muteButton.className.replace(s[0], s[1]) : muteButton.className.replace(s[1], s[0]);

            };

            var toggleHelping = function (e) {
                e.preventDefault();
                state.helping = !state.helping;
            };

            var close = function (e) {
                e.preventDefault();
                var title = document.getElementById('titleScreen') || document.getElementById('title-screen');
                if(title) title.style.display = 'block';
            };

            var getFullScreen = function () {
                return state.fullScreen;
            };

            var getMuted = function () {
                return state.muted;
            };

            var getHelping = function () {
                return state.helping;
            };

            // mouse events
            fullScreenButton.addEventListener("mousedown", toggleFullScreen);
            muteButton.addEventListener("mousedown", toggleMuted);
            helpButton.addEventListener("mousedown", toggleHelping);
            closeButton.addEventListener("mousedown", close);

            // touch events
            fullScreenButton.addEventListener("touchstart", toggleFullScreen);
            muteButton.addEventListener("touchstart", toggleMuted);
            helpButton.addEventListener("touchstart", toggleHelping);
            closeButton.addEventListener("touchstart", close);

            // TODO - not firing in chrome ? how to handle esc as well as FS button ??
            document.addEventListener("keydown", function (ev) {
                if(ev.keyCode === 27) state.fullScreen = false;
            });

            // document.addEventListener("fullscreenchange", function (ev) {
            //     console.log(document.fullscreen);
            //     if(document.fullscreen) state.fullScreen = false;
            // });

            return Object.assign({}, o, {
                fullScreenButton: fullScreenButton,
                muteButton: muteButton,
                closeButton: closeButton,
                helpButton: helpButton,
                getFullScreen: getFullScreen,
                getMuted: getMuted,
                getHelping: getHelping,
                toggleFullScreen: toggleFullScreen,
                toggleMuted: toggleMuted,
                toggleHelping: toggleHelping
            });
        }
    };

    var addScorer = function (state) {
        state = state || {};
        state.score = state.score || 0;
        state.scoreTarget = state.scoreTarget || 100;

        return function (o) {

            return Object.assign({}, o, {
                increaseScore: function (val) {
                    val = val || 10;
                    state.score += val;
                    return this;
                },
                decreaseScore: function (val) {
                    val = val || 10;
                    state.score -= val;
                    return this;
                },
                getScore: function () {
                    return state.score;
                },
                setTarget: function (val) {
                    state.scoreTarget = val;
                    return this;
                },
                hasWon: function () {
                    return (state.score >= state.scoreTarget);
                },
                hasLost: function () {
                    return (state.score <= 0);
                },
                success: function () {
                    console.log("congratulations ! you've won !")
                }
            });
        };
    };

    var addLabels = function (state) {
        state = state || {};
        state.labelContainerId = state.labelContainerId || "labels";
        state.labelContentsArray = state.labelContentsArray || [""];

        return function (o) {
            var labelContainer = document.getElementById(state.labelContainerId);
            var labels = [];
            try {
                labels = Array.prototype.slice.call(labelContainer.children);
            } catch(e) { console.log("error getting labels -> "+e.name+": "+e.message) }
            for(var i = 0; i < labels.length; i++) labels[i].innerHTML = state.labelContentsArray[i];

            return Object.assign({}, o, {
                labels: labels
            });
        }
    };

    var createHowlerPlayer = function (soundMap) {
        soundMap = soundMap || {};  // {'Name': 'url', ...}

        if(!Howl) {
            console.error('make sure you\'ve added Howler.js to your <head> !');
            return {};
        }

        var soundIds = Object.keys(soundMap), playerMap = {};

        for(var i = 0; i < soundIds.length; i++) {
            playerMap[soundIds[i]] = new Howl(soundMap[soundIds[i]]);
        }

        return playerMap;
    };

    var attachButtonSounds = function (clickPlayer) {
        var buttons = Array.prototype.slice.call(document.getElementsByClassName('font-button'))
            .concat(Array.prototype.slice.call(document.getElementsByClassName('text-button')));
        var handler = function () { clickPlayer.play() };
        for(var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('mousedown', handler);
            buttons[i].addEventListener('touchstart', handler);
        }
    };

    tw.addUI = addUI;
    tw.addScorer = addScorer;
    tw.addLabels = addLabels;

    // refactor pending
    tw.createContainer = createContainer;
    tw.createUI = createUI;
    tw.createHowlerPlayer = createHowlerPlayer;
    tw.attachButtonSounds = attachButtonSounds;

})(TwinklGame);