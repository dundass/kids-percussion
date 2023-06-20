var TwinklGame = TwinklGame || {};

(function (tw) {

    "use strict";

    var addInstrument = function (state) {
        state = state || {};
        state.triggerContainerId = state.triggerContainerId || "triggers";

        state.manifest = state.manifest || [{src: "", id: ""}];
        // state.soundSets = state.soundSets || [{name: "default", idPrefix: ''}];
        state.shortcuts = state.shortcuts || {keyCodes: [49, 50, 51, 52, 53, 54, 55, 56, 57, 48],
            chars: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']};
        state.octave = state.octave || 0;
        state.currentSoundSet = 0;
        state.hasNoteLabels = state.hasNoteLabels || false;
        state.keysDown = [];
        state.lastNote = -1;
        state.audioTriggers = [];
        state.notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
        state.lastMouseNote = 0;
        state.ongoingTouches = [];
        state.isPlaying = false;
        state.playTimer = null;

        return function (o) {
            var triggerContainer = document.getElementById(state.triggerContainerId);

            var changeSoundSet = function (soundSetIndex) {
                if(state.soundSetLabelContainerId)
                    document.getElementById(state.soundSetLabelContainerId).innerHTML = (soundSetIndex+1) + ". " + state.soundSets[soundSetIndex].name;

                soundChangeAction(soundSetIndex);
            };

            var playSound = function (i) {   // refactor to fit with {id: "", src: ""} ?
                // console.log("sound played and muted is: " + this.muted);
                state.lastNote = i;
                if(o.hasOwnProperty('getMuted') ? !o.getMuted() : true) {   // TODO - consider changing to createjs.Sound.muted
                    if(state.soundEngine.hasOwnProperty('isReady') && state.soundEngine.isReady()) {
                        // createjs.Sound
                        var soundItem = state.soundSets ? state.soundSets[state.currentSoundSet].idPrefix+(i + (state.octave * 12))
                            : (state.manifest[i].id || state.manifest[i].src);
                        state.soundEngine.play(soundItem);
                    } else {
                        // other sound implementations ...
                    }
                }
            };

            var stopSound = function (i) {

            };

            var pressTrigger = function (i) {
                if(!state.audioTriggers[i].className.includes('pressed')) state.audioTriggers[i].className += " pressed";
            };

            var releaseTrigger = function (i) {
                state.audioTriggers[i].className = state.audioTriggers[i].className.replace(/ pressed/g, "");
            };

            var playTune = function (tuneObject, isTeaching) {
                isTeaching = isTeaching || false;
                state.isPlaying = true;
                if(isTeaching && state.teachButtonId) {
                    var btn = document.getElementById(state.teachButtonId);
                    btn.className = btn.className.replace("teach", "pause");
                } else if(!isTeaching && state.playButtonId) {
                    var btn = document.getElementById(state.playButtonId);
                    btn.className = btn.className.replace("play", "pause");
                }

                var tuneProgress = 0;
                if(!isTeaching) playSound(tuneObject.note[0]);
                pressTrigger(tuneObject.note[0]);

                var playNext = function () {
                    var note = tuneObject.note[tuneProgress];

                    // if(!isTeaching) stopSound(note);
                    releaseTrigger(note);

                    tuneProgress++;
                    note = tuneObject.note[tuneProgress];

                    if(note) {
                        if (!isTeaching) playSound(note);
                        pressTrigger(note);
                    } else {
                        state.isPlaying = false;
                        if(isTeaching && state.teachButtonId) {
                            var btn = document.getElementById(state.teachButtonId);
                            btn.className = btn.className.replace("pause", "teach");
                        } else if(!isTeaching && state.playButtonId) {
                            var btn = document.getElementById(state.playButtonId);
                            btn.className = btn.className.replace("pause", "play");
                        }
                    }

                    // console.log(tuneProgress + " " + tuneObject.note[tuneProgress] + " " + tuneObject.dur[tuneProgress]);

                    if (tuneProgress < tuneObject.note.length) {
                        if(isTeaching) {

                        }
                        else {
                            state.playTimer = setTimeout(playNext, tuneObject.dur[tuneProgress]);
                        }
                    }
                };

                if(isTeaching) {
                    state.lastNote = -1;
                    // if teaching, poll to check if the progress is complete or not
                    state.playTimer = setInterval(function () {
                        if(tuneProgress < tuneObject.note.length) {
                            var pressed = state.audioTriggers[tuneObject.note[tuneProgress]].className.includes("pressed");
                            if(!pressed) pressTrigger(tuneObject.note[tuneProgress]);

                            if(state.lastNote === tuneObject.note[tuneProgress]) playNext();
                        } else {
                            state.lastNote = -1;
                            clearInterval(state.playTimer);
                        }

                        state.lastNote = -1;
                    }, 100);
                } else {
                    // if playing, schedule next note
                    state.playTimer = setTimeout(playNext, tuneObject.dur[tuneProgress]);
                }
            };

            var teachTune = function (tuneObject) {
                playTune(tuneObject, true);
            };

            var stopPlayOrTeach = function () {
                if(state.playTimer) {
                    if(state.isPlaying) clearTimeout(state.playTimer);
                    else clearInterval(state.playTimer);
                }
                for(var i = 0; i < state.audioTriggers.length; i++)
                    state.audioTriggers[i].className = state.audioTriggers[i].className.replace(/ pressed/g, '');

                var teachBtn = document.getElementById(state.teachButtonId);
                teachBtn.className = teachBtn.className.replace("pause", "teach");
                var playBtn = document.getElementById(state.playButtonId);
                playBtn.className = playBtn.className.replace("pause", "play");
                state.isPlaying = false;
            };

            try {
                state.audioTriggers = Array.prototype.slice.call(triggerContainer.children);
            } catch(e) {
                console.log("error getting audio triggers -> "+e.name+": "+e.message)
            }

            var soundChangeAction = function (soundSetIndex) {
                soundSetIndex = soundSetIndex || 0;
                if(!state.soundSets) return;
                var classes = state.soundSets[soundSetIndex].classes;
                if(classes) {
                    for(var i = 0; i < state.audioTriggers.length; i++) {
                        // for(var j = 0; j < state.soundSets.length; j++)
                            // if(tw.Utils.hasClass(state.audioTriggers[i], state.soundSets[j].classes[i].split(' ')[0]))
                        //         tw.Utils.removeClass(state.audioTriggers[i], state.soundSets[j].classes[i].split(' ')[0]);
                        // tw.Utils.addClass(state.audioTriggers[i], classes[i].split(' ')[0]);
                        state.audioTriggers[i].style.background = 'url('+classes[i]+') no-repeat center';
                    }
                }
            };

            changeSoundSet(state.currentSoundSet);
            for(var i = 0; i < state.audioTriggers.length; i++) {
                if(state.hasNoteLabels) state.audioTriggers[i].innerHTML = ('<span>' + state.notes[i % state.notes.length] + '</span>') || "";
            }

            if(state.playButtonId) {
                var playButton = document.getElementById(state.playButtonId);
                var playHandler = function (e) {
                    e.preventDefault();
                    var tuneName = document.getElementById("tune-selector").value;
                    if(tw.tunes[tuneName] && !state.isPlaying) {
                        playTune(tw.tunes[tuneName]);
                    } else if(tw.tunes[tuneName]) {
                        stopPlayOrTeach();
                    }
                };
                playButton.addEventListener("mousedown", playHandler);
                playButton.addEventListener("touchstart", playHandler);
            }
            if(state.teachButtonId) {
                var teachButton = document.getElementById(state.teachButtonId);
                var teachHandler = function (e) {
                    e.preventDefault();
                    var tuneName = document.getElementById("tune-selector").value;
                    if(tw.tunes[tuneName] && !state.isPlaying) {
                        teachTune(tw.tunes[tuneName]);
                    } else if(tw.tunes[tuneName]) {
                        stopPlayOrTeach();
                    }
                };
                teachButton.addEventListener("mousedown", teachHandler);
                teachButton.addEventListener("touchstart", teachHandler);
            }

            if(state.octaveUpButtonId) {
                var octaveUpButton = document.getElementById(state.octaveUpButtonId);
                var octaveUpHandler = function (e) {
                    e.preventDefault();
                    if(state.octave < 2) {
                        state.octave++;
                        if(state.octave === 1) {
                            var dwn = document.getElementById(state.octaveDownButtonId);
                            dwn.className = dwn.className.replace(/ pressed/g, "");
                        }
                        else if(state.octave === 2) {
                            octaveUpButton.className += " pressed";
                        }
                        changeSoundSet(state.currentSoundSet);
                    }
                };
                octaveUpButton.addEventListener("mousedown", octaveUpHandler);
                octaveUpButton.addEventListener("touchstart", octaveUpHandler);
            }
            if(state.octaveDownButtonId) {
                var octaveDownButton = document.getElementById(state.octaveDownButtonId);
                var octaveDownHandler = function (e) {
                    e.preventDefault();
                    if(state.octave > 0) {
                        state.octave--;
                        if(state.octave === 1) {
                            var up = document.getElementById(state.octaveUpButtonId);
                            up.className = up.className.replace(/ pressed/g, "");
                        }
                        else if(state.octave === 0) {
                            octaveDownButton.className += " pressed";
                        }
                        changeSoundSet(state.currentSoundSet);
                    }
                };
                octaveDownButton.addEventListener("mousedown", octaveDownHandler);
                octaveDownButton.addEventListener("touchstart", octaveDownHandler);
            }

            var nextSound = function (e) {
                e.preventDefault();
                state.currentSoundSet++;
                state.currentSoundSet %= state.soundSets.length;
                changeSoundSet(state.currentSoundSet);
            };
            var prevSound = function (e) {
                e.preventDefault();
                state.currentSoundSet--;
                if(state.currentSoundSet < 0) state.currentSoundSet = state.soundSets.length - 1;
                changeSoundSet(state.currentSoundSet);
            };

            if(state.nextSoundButtonId) {
                var nextSoundButton = document.getElementById(state.nextSoundButtonId);
                nextSoundButton.addEventListener("mousedown", nextSound);
                nextSoundButton.addEventListener("touchstart", nextSound);
            }
            if(state.prevSoundButtonId) {
                var prevSoundButton = document.getElementById(state.prevSoundButtonId);
                prevSoundButton.addEventListener("mousedown", prevSound);
                prevSoundButton.addEventListener("touchstart", prevSound);
            }

            triggerContainer.addEventListener("mousedown", function (ev) {
                var i = state.audioTriggers.indexOf(ev.target);
                if(i !== -1) {
                    pressTrigger(i);
                    playSound(i);
                    state.lastMouseNote = i;
                }
            });

            triggerContainer.addEventListener("mouseup", function (ev) {
                var i = state.lastMouseNote;
                releaseTrigger(i);
                // stopSound(i);
            });

            document.addEventListener('mouseup', function (ev) {
                var i = state.lastMouseNote;
                releaseTrigger(i);
            });

            document.addEventListener("keydown", function (ev) {
                var i = state.shortcuts.keyCodes.indexOf(ev.keyCode);
                if(i !== -1) {
                    pressTrigger(i);
                    if(!state.keysDown[i]) playSound(i);
                    state.keysDown[i] = true;
                }
            });

            document.addEventListener("keyup", function (ev) {
                var i = state.shortcuts.keyCodes.indexOf(ev.keyCode);
                if(i !== -1) {
                    releaseTrigger(i);
                    state.keysDown[i] = false;
                }
            });

            triggerContainer.addEventListener("touchstart", function (ev) {
                ev.preventDefault();
                var touches = ev.changedTouches;
                // console.log("started: " + document.elementFromPoint(touches[0].pageX, touches[0].pageY));
                for(var i = 0; i < touches.length; i++) {
                    state.ongoingTouches.push(tw.Utils.copyTouch(touches[i]));
                    var trigIdx = state.audioTriggers.indexOf(touches[i].target);
                    if (trigIdx !== -1) {
                        pressTrigger(trigIdx);
                        playSound(trigIdx);
                    }
                    // TODO - remove !!!
                    // document.getElementsByClassName('central')[0].innerHTML = trigIdx + '';
                }
            });

            function getElementFromPoint(x, y, classNames) {
                var blackElems = triggerContainer.getElementsByClassName(classNames + ' black'),
                    whiteElems = triggerContainer.getElementsByClassName(classNames + ' white'),
                    bounds;
                for(var i = 0; i < blackElems.length; i++) {
                    bounds = blackElems[i].getBoundingClientRect();
                    if(x >= bounds.x && x <= bounds.x + bounds.width
                    && y >= bounds.y && y <= bounds.y + bounds.height) return blackElems[i];
                }
                for(var i = 0; i < whiteElems.length; i++) {
                    bounds = whiteElems[i].getBoundingClientRect();
                    if(x >= bounds.x && x <= bounds.x + bounds.width
                        && y >= bounds.y && y <= bounds.y + bounds.height) return whiteElems[i];
                }
                return document.documentElement;
            }

            triggerContainer.addEventListener("touchmove", function (ev) {
                ev.preventDefault();
                var touches = ev.changedTouches;
                // console.log("moved: " + document.elementFromPoint(touches[0].pageX, touches[0].pageY));
                for(var i = 0; i < touches.length; i++) {
                    var ongoingIdx = tw.Utils.getTouchIndexById(touches[i].identifier, state.ongoingTouches);
                    if(ongoingIdx === -1) return;
                    var prevElement = getElementFromPoint(state.ongoingTouches[ongoingIdx].pageX,
                        state.ongoingTouches[ongoingIdx].pageY, 'trigger piano-key'),
                        nextElement = getElementFromPoint(touches[i].pageX, touches[i].pageY, 'trigger piano-key');
                    if(nextElement !== prevElement) {
                        // touch has moved to new audioTrigger
                        var prevIdx = state.audioTriggers.indexOf(prevElement),
                            nextIdx = state.audioTriggers.indexOf(nextElement);
                        if(prevIdx !== -1) releaseTrigger(prevIdx);
                        if(nextIdx !== -1) {
                            pressTrigger(nextIdx);
                            playSound(nextIdx);
                            // console.log('note played: ' + nextIdx);
                        }

                        // TODO - remove !!!
                        // document.getElementsByClassName('central')[1].innerHTML = prevIdx + ' ' + nextIdx;
                    } else {
                        var prevIdx = state.audioTriggers.indexOf(prevElement),
                            nextIdx = state.audioTriggers.indexOf(nextElement);
                        // document.getElementsByClassName('central')[1].innerHTML = prevIdx + ' ' + nextIdx;
                    }
                    // update ongoingTouches
                    state.ongoingTouches.splice(ongoingIdx, 1, tw.Utils.copyTouch(touches[i]));

                }
            });

            triggerContainer.addEventListener("touchend", function (ev) {
                ev.preventDefault();
                var touches = ev.changedTouches;
                // console.log("ended: " + document.elementFromPoint(touches[0].pageX, touches[0].pageY));

                for(var i = 0; i < touches.length; i++) {
                    var ongoingIdx = tw.Utils.getTouchIndexById(touches[i].identifier, state.ongoingTouches);
                    if(ongoingIdx === -1) return;
                    // var trigElement = document.elementFromPoint(touches[i].pageX, touches[i].pageY);

                    try {
                        var prevElement = document.elementFromPoint(state.ongoingTouches[ongoingIdx].pageX, state.ongoingTouches[ongoingIdx].pageY, 'trigger piano-key'),
                            nextElement = document.elementFromPoint(touches[i].pageX, touches[i].pageY, 'trigger piano-key');
                        var prevIdx = state.audioTriggers.indexOf(prevElement),
                            nextIdx = state.audioTriggers.indexOf(nextElement);
                        if (prevIdx !== -1) releaseTrigger(prevIdx);
                        if (nextIdx !== -1) releaseTrigger(nextIdx);
                    } catch (error) {
                        // lol fix this another time
                        // Safari 13.0.5 or earlier is sending in NaN or undefined to elementFromPoint - not sure why - pageX/pageY issue or maybe the indexing ?
                    }

                        // document.getElementsByClassName('central')[2].innerHTML = prevIdx + ' ' + nextIdx;
                    // remove touch from ongoingTouches
                    state.ongoingTouches.splice(ongoingIdx, 1);

                }

            });

            document.addEventListener('touchend', function (ev) {
                if(ev.changedTouches.length === 1) {
                    for (var i = 0; i < state.audioTriggers.length; i++) {
                        if(state.audioTriggers[i].className.includes('pressed')) tw.Utils.removeClass(state.audioTriggers[i], 'pressed');
                    }
                }
            });

            // document.addEventListener('touchstart', function (ev) { ev.preventDefault() }, false);
            // document.addEventListener('touchmove', function (ev) { ev.preventDefault() }, false);

            return Object.assign({}, o, {
                manifest: state.manifest,
                triggers: state.audioTriggers,
                soundSets: state.soundSets || [],
                soundEngine: state.soundEngine,
                getCurrentSoundSet: function() {
                    return state.currentSoundSet
                },
                getPlaying: function () {
                    return state.isPlaying;
                },
                getOctave: function () {
                    return state.octave;
                },
                setSoundChangeAction: function (f) {
                    soundChangeAction = f;
                },
                nextSound: nextSound,
                prevSound: prevSound,
                playSound: playSound,
                stopSound: stopSound,
                pressTrigger: pressTrigger,
                releaseTrigger: releaseTrigger,
                playTune: playTune,
                teachTune: teachTune,
                stopPlayOrTeach: stopPlayOrTeach,
                soundChangeAction: soundChangeAction
            });
        };
    };

    var createPiano = function (opts) {

        // old map - works for win, not mac
        // var shortcuts = {keyCodes: [220,  65,  90,  83,  88,  67,  70,  86,  71,  66,  72,  78,  77,  75,  188, 76,  190, 191, 192,  81,  50,  87,  51,  69,  82,  53,  84,  54,  89,  85,  56,  73,  57,  79,  48,  80],
        //                     chars: ['\\', 'a', 'z', 's', 'x', 'c', 'f', 'v', 'g', 'b', 'h', 'n', 'm', 'k', ',', 'l', '.', '/', '\'', 'q', '2', 'w', '3', 'e', 'r', '5', 't', '6', 'y', 'u', '8', 'i', '9', 'o', '0', 'p']};

        // var ua = document.documentElement.getAttribute('data-useragent');
        // if(ua && ua.includes('Macintosh')) {
        var shortcuts = {
                keyCodes: [90,  83,  88,  68,  67,  86,  71,  66,  72,  78,  74,  77,  188, 76,  190, 186, 191,  81,  50,  87,  51,  69,  52,  82,  84,  54,  89,  55, 85,  73,  57,  79,  48,  80, 189, 219],
                chars:    ['z', 's', 'x', 'd', 'c', 'v', 'g', 'b', 'h', 'n', 'j', 'm', ',', 'l', '.', ';', '/', 'q', '2', 'w', '3', 'e', '4', 'r', 't', '6', 'y', '7', 'u', 'i', '9', 'o', '0', 'p', '-', '[']
            };
        // }

        opts.octave = opts.octave || 1;
        opts.hasNoteLabels = opts.hasNoteLabels || true;
        opts.shortcuts =  shortcuts;
        opts.labelContentsArray = shortcuts.chars;

        var pi = tw.Utils.pipe(
            // tw.addContainer(),
            // tw.addUI(opts),
            addInstrument(opts),
            tw.addLabels(opts)
        )({});

        pi.titleAnimation = tw.Utils.loadAnimateClip(
            'InstrumentGame', // anim name
            document.getElementById('title-canvas'), // canvas to draw on
            document.getElementById(opts.containerId), // main container for resizing
            false   // autoStart - don't !
        );

        pi.createjsRenderFunc = function () {
            pi.titleAnimation.parent.update();
        };

        createjs.Ticker.framerate = 25;
        createjs.Ticker.addEventListener('tick', pi.createjsRenderFunc);

        var letsGoBtn = document.getElementById('lets-go-button'),
            letsGoHandler = function () {
                tw.Utils.addClass(document.getElementsByClassName('title-text')[0], 'hidden');
                // tw.Utils.addClass(document.getElementsByClassName('footer')[0], 'hidden');
                tw.Utils.addClass(document.getElementById('lets-go-button'), 'hidden');
                MicroModal.show('help-modal');
            };
        letsGoBtn.addEventListener('mousedown', letsGoHandler);
        letsGoBtn.addEventListener('touchstart', letsGoHandler);

        var playBtn = document.getElementById('play-btn'),
            playHandler = function (e) {
                createjs.Ticker.removeEventListener('tick', pi.createjsRenderFunc);
                document.getElementsByClassName('title-screen')[0].style.display = 'none';
                // tw.Utils.removeClass(document.getElementById('triggers'), 'title-position');
                tw.Utils.removeClass(e.target, 'visible');
                tw.Utils.removeClass(document.getElementById('close-help-btn'), 'hidden');
                pi.soundEngine.stop('Chatter');
                pi.soundEngine.play('Clapping');
            };
        playBtn.addEventListener('mousedown', playHandler);
        playBtn.addEventListener('touchstart', playHandler);

        var closeButtonHandler = function () {
            createjs.Ticker.addEventListener('tick', pi.createjsRenderFunc);
            pi.soundEngine.play('Chatter', {loop: -1});
            document.getElementsByClassName('title-screen')[0].style.display = 'block';
            // tw.Utils.addClass(document.getElementById('triggers'), 'title-position');
            tw.Utils.removeClass(document.getElementsByClassName('title-text')[0], 'hidden');
            // tw.Utils.removeClass(document.getElementsByClassName('footer')[0], 'hidden');
            tw.Utils.removeClass(document.getElementById('lets-go-button'), 'hidden');
            tw.Utils.addClass(document.getElementById('play-btn'), 'visible');
            tw.Utils.addClass(document.getElementById('close-help-btn'), 'hidden');
        };
        var closeButton = document.getElementById('close-button');
        closeButton.addEventListener('mousedown', closeButtonHandler);
        closeButton.addEventListener('touchstart', closeButtonHandler);

        // fullscreen

        var screenIsSmall = true, isFullScreen = false;

        var resizeHandler = function () {

            var smallDisplay = true;

            if(window.innerWidth >= 1200) smallDisplay = false; // old = 1184

            if(isFullScreen) smallDisplay = true;

            if(smallDisplay !== screenIsSmall) {
                screenIsSmall = !screenIsSmall;
                if(screenIsSmall) {
                    tw.Utils.removeClass(document.querySelector('#' + opts.containerId), 'interactive-large');
                } else {
                    tw.Utils.addClass(document.querySelector('#' + opts.containerId), 'interactive-large');
                }
            }

        };

        var fs = document.getElementById('fullscreen-button');

        var triggerFullscreen = function () {
            !isFullScreen ? tw.Utils.makeFullScreen(document.getElementById(opts.containerId)) : tw.Utils.leaveFullScreen();
        };

        fs.addEventListener('mousedown', triggerFullscreen);
        fs.addEventListener('touchstart', triggerFullscreen);

        if(window.$) {
            window.onresize = resizeHandler;

            $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function () {
                isFullScreen = !isFullScreen;
                resizeHandler();
                var s = ["expand-screen", "reduce-screen"];
                fs.className = isFullScreen ? fs.className.replace(s[0], s[1]) : fs.className.replace(s[1], s[0]);
            });

            resizeHandler();
        }

        // mute

        var muteButton = document.getElementById('mute-button'),
            isMuted = false,
            muteHandler = function () {
                isMuted = !isMuted;
                Howler.mute(isMuted);
                var s = ["sound-off", "sound-on"];
                muteButton.className = isMuted ? muteButton.className.replace(s[0], s[1]) : muteButton.className.replace(s[1], s[0]);
            };

        muteButton.addEventListener('mousedown', muteHandler);
        muteButton.addEventListener('touchstart', muteHandler);

        // seasonal

        var date = new Date(),
            tuneSelector = document.getElementById('tune-selector'),
            tuneOptions = tuneSelector.querySelectorAll('[value]');

        // console.log(tuneSelector.children)

        // for(var i = 0; i < tuneOptions.length; i++) {
        //     var tuneName = tuneOptions[i].getAttribute('value');
        //     if(tuneName !== null && tw.tunes[tuneName].dates) {
        //         if(date.getMonth() < tw.tunes[tuneName].dates.start.month || date.getMonth() > (tw.tunes[tuneName].dates.start.month + tw.tunes[tuneName].dates.end.month)) {
        //             tuneSelector.removeChild(tuneOptions[i]);
        //         } else {
        //             // the current month is within the date range
        //             if() {
        //
        //             }
        //         }
        //     }
        // }

        for(var i = 0; i < tuneOptions.length; i++) {
            var tuneName = tuneOptions[i].getAttribute('value');
            // console.log(tuneName)
            // console.log(tw.tunes[tuneName])
            if(tuneName !== null && tw.tunes[tuneName]) {
                if(tw.tunes[tuneName].season) {
                    if(tw.tunes[tuneName].season === 'christmas') {
                        if(date.getMonth() !== 11 || (date.getMonth() > 0 && date.getDay() > 5)) {
                            tuneSelector.removeChild(tuneOptions[i]);
                        }
                    }
                }
            }
        }

        return pi;
    };

    var createPercussion = function (opts) {

        var perc = tw.Utils.pipe(
            // tw.addContainer(),
            // tw.addUI(),
            tw.addScorer(),
            addInstrument(opts)
        )({});

        perc.animateStage = tw.Utils.loadAnimateClip('percussion', document.getElementById('title-canvas'), document.getElementById(opts.containerId));

        function restartAnimation (e) {
            var target = e.keyCode && opts.shortcuts.keyCodes.includes(e.keyCode) ? perc.triggers[opts.shortcuts.keyCodes.indexOf(e.keyCode)] : e.target;
            if(target === document.body || target === window) return;   // ! W A R N I N G !

            if(!tw.Utils.hasClass(target, 'animating')) target.className += ' animating';
            target.className = target.className.replace(/animating/g, 'not-animating');
            void target.offsetWidth;
            target.className = target.className.replace(/not-animating/g, 'animating');
        }

        var successes = opts.successMessages,
            fails = opts.failMessages,
            numSuccesses = 0,
            numFails = 0,
            hitWindow = 0.2,
            firstStart = true;

        function checkHit (e) {
            var target = e.keyCode && opts.shortcuts.keyCodes.includes(e.keyCode) ? perc.triggers[opts.shortcuts.keyCodes.indexOf(e.keyCode)] : e.target;
            if(target === document.body || target === window) return;   // ! W A R N I N G !

            var i = perc.triggers.indexOf(target);
            var enc = document.getElementsByClassName('encouragement')[i];
            tw.Utils.removeClass(enc, 'fadeOutUp');
            setTimeout(function() {
                tw.Utils.addClass(enc, 'fadeOutUp');
            }, 1);

            if(perc.progress % 1 < hitWindow && perc.rhythm[i][(perc.progress % 16)|0] === 1
            || perc.progress % 1 > (1 - hitWindow) && perc.rhythm[i][((perc.progress + 1) % 16)|0] === 1
            || perc.progress % 1 < 0.5 + hitWindow && perc.rhythm[i][(perc.progress % 16)|0] === 2
            || perc.progress % 1 > 0.5 - hitWindow && perc.rhythm[i][((perc.progress + 1) % 16)|0] === 2) {
                // success
                numSuccesses++;
                enc.innerHTML = successes[(Math.random() * successes.length)|0] + '!';
            } else {
                // fail
                numFails++;
                enc.innerHTML = fails[(Math.random() * fails.length)|0] + '!';
            }

            console.log(numSuccesses + ' / ' + numFails);

        }

        perc.triggers.forEach(function (trigger) {
            trigger.addEventListener('mousedown', restartAnimation);
            trigger.addEventListener('touchstart', restartAnimation);
        });
        document.addEventListener('keydown', restartAnimation);

        perc.gridElements = {
            0: Array.prototype.slice.call(document.getElementById('perc-game').getElementsByTagName('tr')[0].children),
            1: Array.prototype.slice.call(document.getElementById('perc-game').getElementsByTagName('tr')[1].children)
        };

        var oldSoundChangeAction = perc.soundChangeAction;
        perc.setSoundChangeAction(function (soundSetIndex) {
            oldSoundChangeAction(soundSetIndex);
            perc.updateGrid();
        });

        // perc.rhythm = {0: [1,1,0,2,1,1,0,0,1,1,0,0,1,0,1,0], 1: [0,0,1,0,0,0,1,0,0,0,1,2,0,2,0,0]}; // TODO - separate rhythm per mode ? -> if u cancel then return to creative, u don't lose pattern
        perc.rhythm = {0: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], 1: [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0]};
        perc.progression = {
            0: [{0: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], 1: [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0]}, {0: [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0], 1: [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1]}],
            1: [{0: [2,0,1,0,2,0,1,0,2,0,1,0,2,0,1,0], 1: [0,2,0,1,0,2,0,1,0,2,0,1,0,2,0,1]}, {0: [2,0,1,0,2,0,1,0,2,0,1,0,2,0,1,0], 1: [0,1,0,2,0,1,0,2,0,1,0,2,0,1,0,2]}],
            2: [{0: [0,1,2,0,0,1,2,0,0,1,2,0,0,1,2,0], 1: [1,0,0,2,1,0,0,2,1,0,0,2,1,0,0,2]}, {0: [1,2,0,0,1,2,0,0,1,2,0,0,1,2,0,0], 1: [0,0,2,1,0,0,2,1,0,0,2,1,0,0,2,1]}],
            3: [{0: [1,1,0,1,2,0,2,0,1,1,0,1,2,0,2,0], 1: [0,0,2,0,0,2,0,1,0,0,2,0,0,2,0,1]}, {0: [1,0,0,1,1,1,0,1,1,0,0,1,1,1,0,1], 1: [0,2,2,0,0,0,2,0,0,2,2,0,0,0,2,0]}],
            4: [{0: [1,2,1,0,2,0,2,1,1,0,1,0,2,2,1,0], 1: [0,2,0,1,0,2,2,1,0,1,0,1,2,2,0,1]}, {0: [1,0,2,0,2,0,1,1,2,0,2,1,2,0,1,0], 1: [1,0,2,0,0,2,1,1,0,2,2,1,2,0,0,1]}]
        };

        perc.mode = 'creative'; // or 'challenge'
        perc.timer = null;
        perc.progressBar = document.getElementsByClassName('perc-grid-progress')[0];

        var reset = function () {
            perc.speed = 0.02; // 0.06
            perc.progress = 15.99;
            perc.firstCycle = true;
            perc.countingIn = true;
            perc.skillLevel = 0;
            clearInterval(perc.timer);
            clearTimeout(perc.countdown);
            numSuccesses = 0;
            numFails = 0;
            perc.rhythm = perc.progression[0][(Math.random()*2)|0];
            perc.updateGrid();
            perc.progressBar.style.left = '100%';
        };

        perc.updateGrid = function () {
            var classes = perc.soundSets.map(function(ss) { return ss.classes });
            for(var i = 0; i < perc.rhythm[0].length; i++) {
                for(var j = 0; j < classes.length; j++) {
                    // if (tw.Utils.hasClass(perc.gridElements[0][i], classes[j])) tw.Utils.removeClass(perc.gridElements[0][i], classes[j]);
                    // if (tw.Utils.hasClass(perc.gridElements[1][i], classes[j])) tw.Utils.removeClass(perc.gridElements[1][i], classes[j]);
                    perc.gridElements[0][i].style.background = '';
                    perc.gridElements[1][i].style.background = '';
                    if (tw.Utils.hasClass(perc.gridElements[0][i], 'double')) tw.Utils.removeClass(perc.gridElements[0][i], 'double');
                    if (tw.Utils.hasClass(perc.gridElements[1][i], 'double')) tw.Utils.removeClass(perc.gridElements[1][i], 'double');
                }
            }
            for(var i = 0; i < perc.rhythm[0].length; i++) {
                if (perc.rhythm[0][i] > 0) {
                    // tw.Utils.addClass(perc.gridElements[0][i], classes[perc.getCurrentSoundSet()]);
                    perc.gridElements[0][i].style.background = 'url(' + classes[perc.getCurrentSoundSet()][0] + ') no-repeat center';
                    if(perc.rhythm[0][i] === 2) tw.Utils.addClass(perc.gridElements[0][i], 'double');
                }
                if (perc.rhythm[1][i] > 0) {
                    // tw.Utils.addClass(perc.gridElements[1][i], classes[perc.getCurrentSoundSet()]);
                    perc.gridElements[1][i].style.background = 'url(' + classes[perc.getCurrentSoundSet()][1] + ') no-repeat center';
                    if(perc.rhythm[1][i] === 2) tw.Utils.addClass(perc.gridElements[1][i], 'double');
                }
            }
        };

        reset();

        if(perc.mode === 'creative') {
            var grid = document.getElementsByClassName('perc-grid')[0],
                gridRows = Array.prototype.slice.call(grid.getElementsByTagName('tr')),
                gridChildren = [Array.prototype.slice.call(gridRows[0].children),
                                Array.prototype.slice.call(gridRows[1].children)];
            var percCycleHandler = function (e) {
                if(tw.Utils.hasClass(e.target, 'one') || tw.Utils.hasClass(e.target, 'two')) {
                    // e.target is a perc grid child
                    var row = gridChildren[0].includes(e.target) ? 0 : 1;
                    var i = gridChildren[row].indexOf(e.target);
                    perc.rhythm[row][i] = (perc.rhythm[row][i] + 1) % 3;
                    perc.updateGrid();
                }
            };
            grid.addEventListener('mousedown', percCycleHandler);
            grid.addEventListener('touchstart', percCycleHandler);
        }

        perc.start = function () {

            tw.Utils.removeClass(perc.triggers[0], 'big');
            tw.Utils.removeClass(perc.triggers[1], 'big');
            tw.Utils.addClass(perc.triggers[0], 'small');
            tw.Utils.addClass(perc.triggers[1], 'small');
            tw.Utils.addClass(document.getElementById('perc-game'), 'visible');
            tw.Utils.removeClass(document.getElementById('creative-button'), 'visible');
            tw.Utils.removeClass(document.getElementById('challenge-button'), 'visible');
            tw.Utils.addClass(document.getElementById('reset-button'), 'visible');
            tw.Utils.addClass(document.getElementsByClassName('button-backing')[0], 'three');

            if(perc.mode === 'challenge') {
                perc.triggers.forEach(function (trigger) {
                    trigger.addEventListener('mousedown', checkHit);
                    trigger.addEventListener('touchstart', checkHit);
                });
                document.addEventListener('keydown', checkHit);
                tw.Utils.removeClass(document.getElementById('creative-play'), 'visible');
            } else {
                tw.Utils.addClass(document.getElementById('creative-play'), 'visible');
            }

            perc.updateGrid();
            var style = [perc.triggers[0].style, perc.triggers[1].style];

            var playback = function () {

                var prevProgress = perc.progress;
                perc.progress = (perc.progress + perc.speed) % 16;

                if((prevProgress|0) === 15 && (perc.progress|0) === 0) {
                    // console.log('popped');
                    if (perc.mode === 'challenge') {

                        var total1 = perc.rhythm[0].reduce(function (acc, val) {
                            return val > 0 ? acc + 1 : acc;
                        }), total2 = perc.rhythm[1].reduce(function (acc, val) {
                            return val > 0 ? acc + 1 : acc;
                        });

                        if (numSuccesses / (numFails + 0.0001) > 0.9 && numSuccesses > (total1 + total2) * 0.9) {
                            // gen new rhythm
                            // inc speed
                            // check to see if maximum level reached
                            perc.skillLevel++;
                            if (perc.skillLevel < Object.keys(perc.progression).length) {
                                perc.rhythm = perc.progression[perc.skillLevel][(Math.random() * 2) | 0];
                                perc.updateGrid();
                                perc.speed += 0.001;
                                perc.soundEngine.play('LevelUp');
                                perc.countingIn = true;
                            } else {
                                clearInterval(perc.timer);
                                MicroModal.show('endgame-modal');
                            }
                        }

                        numSuccesses = 0;
                        numFails = 0;
                    }
                    else if (perc.firstCycle) {
                        // blocks timer from being cleared on first cycle (progress begins at 15.99 or sutin)
                        perc.firstCycle = false;
                        // perc.progress = 0;
                    }
                    else {
                        clearInterval(perc.timer);
                        creativeStopHandler();
                    }
                }

                if(perc.countingIn && perc.mode === 'challenge') {
                    if(perc.progress < 4) {
                        // TODO - count in visual
                    } else {
                        perc.progress = 15.99;
                        perc.countingIn = false;
                        perc.firstCycle = true;
                    }
                } else {
                    // UI - progress bar and trig borders
                    perc.progressBar.style.left = 100 * (perc.progress / 16.0) + '%';
                    for(var i = 0; i < perc.triggers.length; i++) {
                        if(perc.progress % 1 < 0.4 && perc.rhythm[i][perc.progress|0] > 0) {
                            // tw.Utils.addClass(perc.triggers[i], 'highlighted');
                            style[i].transition = 'width 0.5s, top 1s, height 0.5s, background-color 0.5s';
                            style[i].backgroundColor = 'rgba(255,255,255,0.7)';
                        } // TODO - highlight for double ?
                        else if(perc.progress % 1 > 0.6 && perc.rhythm[i][((perc.progress + 1) % 16)|0] > 0) {
                            // tw.Utils.addClass(perc.triggers[i], 'highlighted');
                            style[i].transition = 'width 0.5s, top 1s, height 0.5s, background-color 0.5s';
                            style[i].backgroundColor = 'rgba(255,255,255,0.7)';
                        }
                        else {
                            // tw.Utils.removeClass(perc.triggers[i], 'highlighted');
                            style[i].backgroundColor = 'rgba(255,255,255,0)';
                        }
                        // transition: width 0.5s, top 1s, height 0.5s, background-color 0.5s;
                        // background-color: rgba(255,255,255,0.7);
                    }
                }

                // every beat
                if((perc.progress|0) !== (prevProgress|0)) {
                    if(perc.mode === 'challenge') {
                        // metronome
                        (perc.progress|0) % 4 === 0 ? perc.soundEngine.play('Metro0') : perc.soundEngine.play('Metro1');
                    }
                    else {
                        // creative - is this trigger active ?
                        if(perc.rhythm[0][perc.progress|0] > 0) {
                            perc.soundEngine.play(perc.soundSets[perc.getCurrentSoundSet()].idPrefix + '0');
                        }
                        if(perc.rhythm[1][perc.progress|0] > 0) {
                            perc.soundEngine.play(perc.soundSets[perc.getCurrentSoundSet()].idPrefix + '1');
                        }
                    }
                } else if(((perc.progress + 0.5)|0) !== ((prevProgress + 0.5)|0) && perc.mode === 'creative') {
                    // creative - check for double hit
                    if(perc.rhythm[0][perc.progress|0] === 2) {
                        perc.soundEngine.play(perc.soundSets[perc.getCurrentSoundSet()].idPrefix + '0');
                    }
                    if(perc.rhythm[1][perc.progress|0] === 2) {
                        perc.soundEngine.play(perc.soundSets[perc.getCurrentSoundSet()].idPrefix + '1');
                    }
                }

                // TODO - metronome visual ?

            };

            perc.play = function () {

                perc.speed = 0.02;
                perc.progress = 16 - perc.speed;
                perc.progressBar.style.left = '100%';
                perc.firstCycle = true;

                perc.timer = setInterval(playback, 1000 / 60);

                console.log('playing')

                // if(perc.mode === 'challenge') perc.soundEngine.play('Metro0');

            };

            var playAgainButton = document.getElementById('play-again-button'),
                playAgainHandler = function () {
                    reset();
                    // perc.countdown = setTimeout(perc.play, 2000);
                    perc.play();
                    perc.updateGrid();
                };
            playAgainButton.addEventListener('mousedown', playAgainHandler);
            playAgainButton.addEventListener('touchstart', playAgainHandler);

            if(perc.mode === 'challenge') playAgainHandler();

            var creativePlayBtn = document.getElementById('creative-play'),
                creativePlayHandler = function () {
                    perc.play();
                    tw.Utils.removeClass(creativePlayBtn, 'play');
                    tw.Utils.addClass(creativePlayBtn, 'stop');
                    creativePlayBtn.addEventListener('mousedown', creativeStopHandler);
                    creativePlayBtn.removeEventListener('mousedown', creativePlayHandler);
                    creativePlayBtn.addEventListener('touchstart', creativeStopHandler);
                    creativePlayBtn.removeEventListener('touchstart', creativePlayHandler);
                },
                creativeStopHandler = function () {
                    clearInterval(perc.timer);
                    tw.Utils.removeClass(creativePlayBtn, 'stop');
                    tw.Utils.addClass(creativePlayBtn, 'play');
                    creativePlayBtn.addEventListener('mousedown', creativePlayHandler);
                    creativePlayBtn.removeEventListener('mousedown', creativeStopHandler);
                    creativePlayBtn.addEventListener('touchstart', creativePlayHandler);
                    creativePlayBtn.removeEventListener('touchstart', creativeStopHandler);
                };

            if(firstStart) {
                creativePlayBtn.addEventListener('mousedown', creativePlayHandler);
                creativePlayBtn.addEventListener('touchstart', creativePlayHandler);
                firstStart = false;
            }
        };

        perc.stop = function () {
            clearTimeout(perc.countdown);
            clearInterval(perc.timer);

            tw.Utils.removeClass(perc.triggers[0], 'small');
            tw.Utils.removeClass(perc.triggers[1], 'small');
            tw.Utils.addClass(perc.triggers[0], 'big');
            tw.Utils.addClass(perc.triggers[1], 'big');
            tw.Utils.removeClass(document.getElementById('perc-game'), 'visible');
            tw.Utils.addClass(document.getElementById('creative-button'), 'visible');
            tw.Utils.addClass(document.getElementById('challenge-button'), 'visible');
            tw.Utils.removeClass(document.getElementById('reset-button'), 'visible');
            tw.Utils.removeClass(document.getElementsByClassName('button-backing')[0], 'three');
            var style = [perc.triggers[0].style, perc.triggers[1].style];
            for(var i = 0; i < style.length; i++) style[i].border = 'none';
            // for(var i = 0; i < perc.triggers.length; i++) tw.Utils.removeClass(perc.triggers[i], 'highlighted');
            for(var i = 0; i < perc.triggers.length; i++) style[i].backgroundColor = 'rgba(255,255,255,0)';

            perc.triggers.forEach(function (trigger) {
                trigger.removeEventListener('mousedown', checkHit);
                trigger.removeEventListener('touchstart', checkHit);
            });
            document.removeEventListener('keydown', checkHit);
        };

        var creativeBtn = document.getElementById('creative-button'),
            challengeBtn = document.getElementById('challenge-button'),
            resetBtn = document.getElementById('reset-button'),
            creativeStart = function () {
                reset();
                perc.mode = 'creative';
                MicroModal.show('creative-modal');
            },
            challengeStart = function () {
                reset();
                perc.mode = 'challenge';
                MicroModal.show('challenge-modal');
            },
            resetHandler = function () {
                perc.stop();
                // reset();
            };

        creativeBtn.addEventListener('mousedown', creativeStart);
        challengeBtn.addEventListener('mousedown', challengeStart);
        resetBtn.addEventListener('mousedown', function() {perc.stop(); reset()});
        creativeBtn.addEventListener('touchstart', creativeStart);
        challengeBtn.addEventListener('touchstart', challengeStart);
        resetBtn.addEventListener('touchstart', function() {perc.stop(); reset()});

        var letsGoBtn = document.getElementById('lets-go-button'),
            letsGoHandler = function () {
                tw.Utils.addClass(document.getElementsByClassName('title-text')[0], 'hidden');
                // tw.Utils.addClass(document.getElementsByClassName('footer')[0], 'hidden');
                MicroModal.show('help-modal');
            };
        letsGoBtn.addEventListener('mousedown', letsGoHandler);
        letsGoBtn.addEventListener('touchstart', letsGoHandler);

        var playBtn = document.getElementById('play-button'),
            playHandler = function () {
                reset();
                document.getElementsByClassName('title-screen')[0].style.display = 'none';
                Array.prototype.slice.call(document.getElementsByClassName('bottom-bar')).forEach(function (btn) { tw.Utils.addClass(btn, 'visible') });
                perc.soundEngine.stop('Chatter');
                perc.soundEngine.play('Clapping');
            };
        playBtn.addEventListener('mousedown', playHandler);
        playBtn.addEventListener('touchstart', playHandler);

        var closeBtn = document.getElementById('close-button'),
            closeHandler = function () {
                perc.stop();
                tw.Utils.removeClass(document.getElementsByClassName('title-text')[0], 'hidden');
                document.getElementsByClassName('title-screen')[0].style.display = 'block';
                // tw.Utils.removeClass(document.getElementsByClassName('footer')[0], 'hidden');
                Array.prototype.slice.call(document.getElementsByClassName('bottom-bar')).forEach(function (btn) { tw.Utils.removeClass(btn, 'visible') });
                perc.soundEngine.play('Chatter', {loop: true});
            };
        closeBtn.addEventListener('mousedown', closeHandler);
        closeBtn.addEventListener('touchstart', closeHandler);

        perc.soundEngine.play('Chatter', {loop: true});

        // fullscreen

        var screenIsSmall = true, isFullScreen = false;

        var resizeHandler = function () {

            var smallDisplay = true;

            if(window.innerWidth >= 1200) smallDisplay = false; // old = 1184

            if(isFullScreen) smallDisplay = true;

            if(smallDisplay !== screenIsSmall) {
                screenIsSmall = !screenIsSmall;
                if(screenIsSmall) {
                    tw.Utils.removeClass(document.querySelector('#' + opts.containerId), 'interactive-large');
                } else {
                    tw.Utils.addClass(document.querySelector('#' + opts.containerId), 'interactive-large');
                }
            }

        };

        var fs = document.getElementById('fullscreen-button');

        var triggerFullscreen = function () {
            !isFullScreen ? tw.Utils.makeFullScreen(document.getElementById(opts.containerId)) : tw.Utils.leaveFullScreen();
        };

        fs.addEventListener('mousedown', triggerFullscreen);
        fs.addEventListener('touchstart', triggerFullscreen);

        if(window.$) {
            window.onresize = resizeHandler;

            $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function () {
                isFullScreen = !isFullScreen;
                resizeHandler();
                var s = ["expand-screen", "reduce-screen"];
                fs.className = isFullScreen ? fs.className.replace(s[0], s[1]) : fs.className.replace(s[1], s[0]);
                // console.log(isFullScreen)
                // console.log(fs.className)
            });

            resizeHandler();
        }

        return perc;
    };

    var createKazoo = function (opts) {

        var kaz = tw.Utils.pipe(
            // tw.addContainer(),
            tw.addUI(),
            addInstrument(opts)
        )({});

        return kaz;
    };

    tw.createPiano = createPiano;
    tw.createPercussion = createPercussion;
    tw.createKazoo = createKazoo;

    tw.tunes = {
        "We Wish You A Merry Christmas": {
            // dates: {start: {month: 11, day: 1}, end: {month: 1, day: 5}},
            season: 'christmas',
            note: [7, 12,12,14,12,11, 9,5,9, 14,14,16,14,12, 11,7,11, 16,16,17,16,14, 12,9,7,7, 9,14,11,12,  7, 12,12,12,11, 11,12,11,9,7, 14,16,14,14,12,12, 19,7,7,7, 9,14,11,12],
            dur: [500, 500,250,250,250,250, 500,500,500, 500,250,250,250,250, 500,500,500, 500,250,250,250,250, 500,500,250,250, 500,500,500,1000, 500, 500,500,500,1000, 500,500,500,500,1000, 500,500,250,250,250,250, 500,500,250,250, 500,500,500,1000]
        },
        "Silent Night": {
            // dates: {start: {month: 11, day: 1}, end: {month: 1, day: 5}},
            season: 'christmas',
            note: [19,21,19,16, 19,21,19,16, 26,26,23, 24,24,19, 21,21,24,23,21, 19,21,19,16, 21,21,24,23,21, 19,21,19,16, 26,26,29,26,23, 24,28, 24,19,16,19,17,14,12],
            dur: [750,250,500,1500, 750,250,500,1500, 1000,500,1500, 1000,500,1500, 1000,500,750,250,500, 750,250,500,1500, 1000,500,750,250,500, 750,250,500,1500, 1000,500,750,250,500, 1500,1500, 500,500,500,750,250,500, 1500]
        },
        "Good King Wenceslas": {
            // dates: {start: {month: 11, day: 1}, end: {month: 1, day: 5}},
            season: 'christmas',
            note: [12,12,12,14, 12,12,7, 9,7,9,11, 12,12, 12,12,12,14, 12,12,7, 9,7,9,11, 12,12,  19,17,16,14,16,14,12, 9,7,9,11, 12,12, 7,7,9,11,12,12,14, 19,17,16,14, 12,17,12],
            dur: [500,500,500,500, 500,500,1000, 500,500,500,500, 1000,1000,  500,500,500,500, 500,500,1000, 500,500,500,500, 1000,1000,  500,500,500,500, 500,500,1000, 500,500,500,500, 1000,1000,  500,500,500,500, 500,500,1000, 500,500,500,500, 1000,1000,1000]
        },
        "Twinkl Twinkl Little Star": {
            note: [12, 12, 19, 19, 21, 21, 19, 17, 17, 16, 16, 14, 14, 12, 19, 19, 17, 17, 16, 16, 14, 19, 19, 17, 17, 16, 16, 14, 12, 12, 19, 19, 21, 21, 19, 17, 17, 16, 16, 14, 14, 12],
            dur: [500,500,500,500,500,500,1000, 500,500,500,500,500,500,1000, 500,500,500,500,500,500,1000, 500,500,500,500,500,500,1000, 500,500,500,500,500,500,1000, 500,500,500,500,500,500,1000]
        },
        "Frere Jacques": {
            note: [12, 14, 16, 12, 12, 14, 16, 12, 16, 17, 19, 16, 17, 19, 19, 21, 19, 17, 16, 12, 19, 21, 19, 17, 16, 12, 12, 7, 12, 12, 7, 12],
            dur: [500,500,500,500, 500,500,500,500, 500,500,1000, 500,500,1000, 250,250,250,250,500,500, 250,250,250,250,500,500, 500,500,1000, 500,500,1000]
        },
        "Happy Birthday": {
            note: [19, 19, 21, 19, 24, 23, 19, 19, 21, 19, 26, 24, 19, 19, 31, 28, 24, 23, 21, 29, 29, 28, 24, 26, 24],
            dur: [333,166,500,500,500,1000, 333,166,500,500,500,1000, 333,166,500,500,500,500,500, 333,166,500,500,500,1000]
        },
        "Row, Row, Row Your Boat": {
            note: [12, 12, 12, 14, 16, 16, 14, 16, 17, 19, 24, 24, 24, 19, 19, 19, 16, 16, 16, 12, 12, 12, 19, 17, 16, 14, 12],
            dur: [500,500,333,166,500, 333,166,333,166,1000, 166,166,166,166,166,166,166,166,166,166,166,166, 333,166,333,166,500]
        }
    };

})(TwinklGame);
