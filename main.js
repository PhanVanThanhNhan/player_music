const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY ='F8_PLAYER'

const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playlist = $('.playlist')
const playbtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextbtn = $('.btn-next')
const prevbtn = $('.btn-prev')
const randombtn = $('.btn-random')
const repeatbtn = $('.btn-repeat')

const app = {
    currentIndex : 0,
    isPLaying : false,
    isRandom : false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    song : [
    {
        name: 'Cây đa quán dốc',
        singer: 'LEO',
        path: "./assets/music/CayDaQuanDocNewVersionCover-LEO-8783632.mp3",
        image: "./assets/img/CDQD.png"
    },
    {
        name: '11:11',
        singer: 'MiiNa',
        path: "./assets/music/1111-MiiNaDREAMeRRIN9DREAMeRVietNam-8721776.mp3",
        image: "./assets/img/1111.png"
    },
    {
        name: 'Mẹ anh bán bánh mì',
        singer: 'Phúc Du',
        path: "./assets/music/YeuAnhDiMeAnhBanBanhMi-PhucDu-8698703.mp3",
        image: "./assets/img/BM.png"
    },
    {
        name: 'Rồi ta sẽ ngắm pháo hoa cùng nhau',
        singer: 'Olew',
        path: "./assets/music/RoiTaSeNgamPhaoHoaCungNhau-OlewVietNam-8485329.mp3",
        image: "./assets/img/RTSNPH.png"
    },
    {
        name: 'Đến giờ cơm',
        singer: 'Ái Phương',
        path: "./assets/music/DenGioCom-AiPhuongMinhCaRi-8552100.mp3",
        image: "./assets/img/DGC.png"
    }
    ],
    setconfig:function(key,value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render:function(){
        const htmls = this.song.map((song,index)=>{
            return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>`
        })
        $('.playlist').innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.song[this.currentIndex]
            }
        })
    },
    handleEvents: function(){
        const _this = this
        const cdwidth = cd.offsetWidth
        //Xử lý cd quay/ dừng quay
        const cdthumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg'}
        ],{
            duration: 4000, //10 giây
            interation: Infinity,
        })
        cdthumbAnimate.pause()

        //Xử lý phóng to/ thu nhỏ cd
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdwidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth +"px": 0 
            cd.style.opacity = newCdWidth / cdwidth
        }
        //xử lý khi click play
        playbtn.onclick = function(){
            if(_this.isPLaying){
                audio.pause()
            }
            else{
                audio.play()
            }
        }
        //khi song được play
        audio.onplay = function(){
            _this.isPLaying = true
            player.classList.add('playing')
            cdthumbAnimate.play()
        }

        //khi song bị pause
        audio.onpause = function(){
            _this.isPLaying = false
            player.classList.remove('playing')
            cdthumbAnimate.pause()
        }

        //khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration *100)
                progress.value = progressPercent
            }
        }

        //Xử lý khi tua bài hát
        progress.onchange = function(e){
            const seekTime = audio.duration / 100* e.target.value
            audio.currentTime = seekTime
        }

        //khi nhấn next button
        nextbtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }
            else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrolltoActiveSong()
        }
        //khi nhấn prev button
        prevbtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }
            else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrolltoActiveSong()
        }
        //xử lí next song khi audio ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }
            else
            {
                nextbtn.click()
            }
        }
        //khi nhấn random button
        randombtn.onclick = function(){
            _this.isRandom = !_this.isRandom
            _this.setconfig('isRandom',_this.isRandom)
            randombtn.classList.toggle("active", _this.isRandom)
        }
        //xử lí lặp lại song
        repeatbtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat
            _this.setconfig('isRepeat',_this.isRepeat)
            repeatbtn.classList.toggle("active", _this.isRepeat)
        }
        //xử lí click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option)')){
                //xử lí khi click vào song
                if(songNode){
                     _this.currentIndex = Number(songNode.dataset.index)
                     _this.loadCurrentSong()
                     audio.play()
                     _this.render()
                }
                //xử lí khi click vào option
                if( e.target.closest('.option)')){}
            }
        }
    },
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        //Object.assign(this, this.config) 
    },
    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex >= this.song.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.song.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function(){
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.song.length)
        }
        while(newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    scrolltoActiveSong: function(){
       setTimeout(function(){
        $('.song.active').scrollIntoView({
            behavior:'smooth',
            block:'nearest'
        })
       },300)
    },
    
    start: function(){
        //gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        //Định nghĩa các thuộc tính cho object
        this.defineProperties()
        //lắng nghe và xử lý các sự kiện
        this.handleEvents()
        //Tải thông tin bài đầu tiên vào giao diện khi chạy ứng dụng
        this.loadCurrentSong()
        //render playlist
        this.render()

        //Hiển thị trạng thái ban đầu của button repeat & random
        randombtn.classList.toggle("active", this.isRandom)
        repeatbtn.classList.toggle("active", this.isRepeat)
    }
}

app.start();

