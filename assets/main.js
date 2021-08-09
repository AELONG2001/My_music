const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'My music'

const playList = $('.playlist');
const backgroundCD = $('.background-img-song');
const cd = $('.cd');
const heading = $('h2');
const cdThumb = $('.cd-thumb');
const audio =   $('#audio') ;
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const volumeBtn = $('.volume-song');
const barVolume = $('.bar-input');
const volumeMain = $('#bar-input-main');
const modeBtn = $('.background-on');


const app = {
    currentIndex: 0,
    oldIndexRandom : [],
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isTimeUpdate: true,
    isVolume: true,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs : [
        {
            name: "Đi Đi Đi",
            author: "K-ICM",
            path: "./assets/songs/Đi Đi Đi.mp3",
            image: "./assets/img/K-ICM.jpg"
        },
    
        {
            name: "Em Mỉm Cười Trông Thật Đẹp",
            author: "not yet",
            path: "./assets/songs/EMCTTD.mp3",
            image: "./assets/img/EMCTTD.jpg"
        },
        
        {
            name: "Sẽ hứa đi cùng nhau",
            author: "Soobin Hoàng Sơn",
            path: "./assets/songs/Se-Hua-Di-Cung-Nhau-Di-De-Tro-Ve-3-SOOBIN-Da-LAB.mp3",
            image: "./assets/img/SHDCN.jpg"
        },
    
        {
            name: "Con đường bình phàm",
            author: "not yet",
            path: "./assets/songs/Con Đường Bình Phàm.webm",
            image: "./assets/img/simple-road.jpg"
        },

        {
            name : "Summer Time",
            author: "not yet",
            path: "./assets/songs/Summertime-K-391.mp3",
            image: "./assets/img/SummerTime.jpg",
        },

        {
            name: "Ngẫu Hứng",
            author: "not yet",
            path: "./assets/songs/Ngẫu-hứng.webm",
            image: "./assets/img/coolman.jpg"
        },

    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    
    render: function() {
        const html = this.songs.map((song, index)=> {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}"  data-index = "${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.author}</p>
                    </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                    </div>
            </div>
            `;

        });
        playList.innerHTML = html.join('');
    },

    defineProperties: function() {
      Object.defineProperty(this, "currentSong", {
        get: function() {                                   
            return this.songs[this.currentIndex];
        }
      });
    },



    handleEvent: function() {
       const _this = this;
       
       const backgroundCdWidth = backgroundCD.offsetWidth;
       const backgroundCdHeight = backgroundCD.offsetHeight;
       const cdWidth = cd.offsetWidth;


       //Xử lý bật tắt volume
       volumeBtn.onclick = function() {
           barVolume.classList.toggle('volume-on');
       }

       //Xử lý thay đổi chế độ màn hình
       modeBtn.onclick = function() {
           modeBtn.classList.toggle('icon-change');
           player.classList.toggle('player-change');
       }

       //Xử lý điều chỉnh âm thanh
        audio.volume = 1;
        volumeMain.value = audio.volume * 100;

        volumeMain.oninput = function() {
            audio.volume = volumeMain.value / 100;
        }

       //Xử lý CD quay / dừng
       const cdThumbAnimation = cdThumb.animate([
           {transform : 'rotate(360deg)'}
       ], {
           duration : 10000, //10 second
           iterations : Infinity
       })
       cdThumbAnimation.pause();
   
 
       //Xử lý phóng to / thu nhỏ CD
       document.onscroll = function() {
           const scrollTop = window.scrollY || document.documentElement.scrollTop;
           const newBackgroundCdWidth = backgroundCdWidth - scrollTop;
           const newBackgroundCdHeight = backgroundCdHeight - scrollTop;
           const newCdWidth = cdWidth - scrollTop;
        
           //Xử lý scroll cho background CD
           backgroundCD.style.width = newBackgroundCdWidth > 0 ? newBackgroundCdWidth + 'px' : 0;
           backgroundCD.style.height = newBackgroundCdHeight > 0 ? newBackgroundCdHeight + 'px' : 0;
           backgroundCD.style.opacity = newBackgroundCdWidth / backgroundCdWidth;

           cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
           cd.style.opacity = newCdWidth / cdWidth;

       }

       //Xử lý khi click play
       playBtn.onclick = function() {
           if(_this.isPlaying) {
              audio.pause();
           }else {
              audio.play();
           }
           
       }

       //Khi song được play
       audio.onplay = function() {
           _this.isPlaying = true;
           player.classList.add('playing');
           cdThumbAnimation.play();
       }

       //Khi song bị pause
       audio.onpause = function() {
          _this.isPlaying = false;
          player.classList.remove('playing');
          cdThumbAnimation.pause();
       }

       //Khi tiến độ bài hát thay đổi
       audio.ontimeupdate = function() {
           if(audio.duration) {
               const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
               if(isTimeUpdate) {
                 progress.value = progressPercent;
               }
           }
       }

       //Xử lý khi tua bài hát
       progress.onchange = function(e) {
           const seekTime = audio.duration / 100 * e.target.value;
           if(_this.isTimeUpdate) {
              audio.currentTime = seekTime;
           }
       }

       //fix lỗi khi tua bài hát
       const isTouch = 'touchstart' || 'mousedown';
       progress.addEventListener(isTouch, function() {
           isTimeUpdate = false;
       })

       //Khi next bài hát
       nextBtn.onclick = function() {
           if(_this.isRandom) {
              _this.playRandomSong();
           }else {
              _this.nextSong();
           }
         
           audio.play();
           _this.render();
           _this.scrollToActiveSong();
       }

       //Khi prev bài hát
       prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            }else {
                _this.prevSong();
            }
           
            audio.play();
            _this.render();
            _this.scrollToActiveSong();


       }

       //Khi random bài hát
       randomBtn.onclick = function(e) {
           _this.isRandom = !_this.isRandom;
           _this.setConfig('isRandom', _this.isRandom)
           this.classList.toggle('active', _this.isRandom);
       }

       //Khi repeat bài hát
       repeatBtn.onclick = function() {
           _this.isRepeat = !_this.isRepeat;
           _this.setConfig('isRepeat', _this.isRepeat)
           this.classList.toggle('active', _this.isRepeat);
       } 

       //Xử lý next bài hát khi audio ended
       audio.onended = function () {
           if(_this.isRepeat) {
               audio.play();
           }else {
              nextBtn.click();
           }
           
       }
       
       //Lắng nghe hành vi click vào playlist
       playList.onclick = function(e) {
          const clickSong = e.target.closest('.song:not(.active)');
          const clickOption = e.target.closest('.option');
          if(clickSong || !clickOption) {
             //Xử lý khi click vào bài hát
             if(clickSong) {
                _this.currentIndex = Number(clickSong.dataset.index)
                _this.loadCurrentSong();
                _this.render();
                audio.play();
             }

             //Xử lý khi click vào option
             if(clickOption) {
                 
             } 
          }
       }
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            const getActiveSong = $('.song.active').scrollIntoView({
               behavior: 'smooth',
               block: 'center'
            })
        },100)
    },

    loadCurrentSong: function() {

       heading.textContent = this.currentSong.name;
       cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
       audio.src = this.currentSong.path;

    },

    loadConfig: function() {
       this.isRandom = this.config.isRandom;
       this.isRepeat = this.config.isRepeat;
    },

    prevSong: function () {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }

        this.loadCurrentSong();
    },

    nextSong: function () {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }

        this.loadCurrentSong();
    },

    playRandomSong: function() {
        let newIndex;
        this.oldIndexRandom.push(this.currentIndex);
        if(this.oldIndexRandom.length === this.songs.length) {
            this.oldIndexRandom = [];
        }
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(this.oldIndexRandom.includes(newIndex))

        this.currentIndex = newIndex;
        this.loadCurrentSong();

    },

    start : function() {
       //Gán cấu hình từ config vào ứng dụng
       this.loadConfig();

       //Định nghĩa các thuộc tính cho object
       this.defineProperties()

       //Lắng nghe và xử lý các sự kiện
       this.handleEvent();

       //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
       this.loadCurrentSong();

       //Render playlist
       this.render();

       //Hiển thị trạng thái ban đầu của button repeat & random
       randomBtn.classList.toggle('active', this.isRandom);
       repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start()
