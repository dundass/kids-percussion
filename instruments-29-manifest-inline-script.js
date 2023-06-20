// bongos, minimal kit, woods (blocks+shakers), steel drum? gong (zindexed circles w diff tone per hit area)?

        var percussion;

        function init() {

            var howlPlayers = {};

            for(var i = 0; i < lib.manifest.length; i++)
                if(lib.manifest[i].src.includes('.mp3')) howlPlayers[lib.manifest[i].id] = new Howl({src: [lib.manifest[i].src]});

            var opts = {
                soundSets: [{name: Twinkl.lang.bongos, idPrefix: 'Bongo', classes: [lib.manifest[9].src, lib.manifest[10].src]},
                    {name: Twinkl.lang.drumkit, idPrefix: 'DrumKit', classes: [lib.manifest[11].src, lib.manifest[12].src]},
                    {name: Twinkl.lang.woodblocks, idPrefix: 'Woodblocks', classes: [lib.manifest[13].src, lib.manifest[14].src]}],
                manifest: lib.manifest,
                soundEngine: {
                    play: function (id, opts) {
                        opts = opts || {};
                        if(opts.loop) howlPlayers[id].loop(true);
                        howlPlayers[id].play();
                    },
                    stop: function (id) {
                        // stop all sound - actually wait there's no function for this in Howler ... so lets just do it per sound
                        howlPlayers[id].stop();
                    },
                    isReady: function () {
                        return true;    // lol
                    }
                },
                containerId: "wrapper",
                nextSoundButtonId: "next-button",
                prevSoundButtonId: "prev-button",
                soundSetLabelContainerId: "sound-set-text",
                successMessages: [Twinkl.lang.goodjob, Twinkl.lang.welldone, Twinkl.lang.youdidit],
                failMessages: [Twinkl.lang.nearly, Twinkl.lang.close, Twinkl.lang.almost]
            };

            percussion = TwinklGame.createPercussion(opts);

            TwinklGame.Utils.attachButtonSounds(howlPlayers['click']);

            var preloaderDiv = document.getElementById("preload-div");
            preloaderDiv.removeAttribute("class");
            setTimeout(function () {
                preloaderDiv.style.zIndex = "-1";
            }, preloaderDiv.style.transitionDuration);

            TwinklGame.Utils.translate(Twinkl.lang);

            MicroModal.init();
        }