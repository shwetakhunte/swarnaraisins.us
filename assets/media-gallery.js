class MediaGallery extends HTMLElement {
  constructor() {
    super();
    this.controller = new AbortController();
    this.signal = this.controller.signal;
    var self = this;
    document.addEventListener("MediaGalleryUpdated", function (event) {
      self.initialized();
    });
    document.dispatchEvent(new CustomEvent('MediaGalleryReady', {detail:self}));
  }

  connectedCallback() {
    if(!this.classList.contains('ajax')) this.initialized();
  }

  uniqid(length) {
    length = length || 10;
    var result = "",
      characters = "abcdefghijklmnopqrstuvwxyz0123456789",
      charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  initialized() {
    if (this.classList.contains("media-gallery-init")) return;
    this.selector  = "media-gallery-" + this.uniqid();
    this.classList.add(this.selector);
    this.classList.add('media-gallery-init');
    var isRTL     = document.body.classList.contains("rtl"),
        gallery   = this.querySelector("gallery .swiper"),
        thumbnail = this.querySelector("thumbnail .swiper"),
        options   = this.datasetToObject(gallery.dataset) || {},
        quickview = this.closest('#quick-view-modal'),
        mainAPI   = {};
    if (quickview || !gallery.classList.contains('gallery-main-grid') || window.matchMedia(options.matchMedia).matches) {
      if (thumbnail) {
          if(isRTL) thumbnail.setAttribute("dir", "rtl");
          var sliderThumb = this.renderSlider(thumbnail);
          Object.assign(mainAPI, { thumbs: {swiper: sliderThumb } });
      }
      var sliderMain  = this.renderSlider(gallery, mainAPI);
    }else{
      this.renderGrid(gallery);
    }
    this.renderFullScreen();
    document.body.addEventListener("afterVariantUpdated", function (event) {
        var variant = event.detail;
        if("featured_media", variant){
            var mediaId = variant.featured_media.id;
            if (sliderMain) {
              sliderMain.slides.forEach(function(item, index){
                if(item.dataset.mediaId == mediaId){
                  item.classList.add('matches');
                  sliderMain.slideTo(index);             
                }else{
                  item.classList.remove('matches');
                }
              });              
            }else {
              var element  = gallery.querySelector('[data-media-id="' + mediaId + '"]');
              if(element){
                gallery.querySelectorAll('[data-media-id]').forEach(function(item, index){
                  item.classList.remove('matches');
                });
                element.classList.add('matches');
                element.scrollIntoView({block: "center", inline: "nearest", behavior: 'smooth'});                  
              }
            }           
        }
    });
  }

  datasetToObject(dataset) {
    return JSON.parse(JSON.stringify(dataset), (key, value) => {
      try {
        return JSON.parse(value);
      } catch (e) {
        // return value;
      }
      try {
        return (0, eval)('(' + value + ')');
      } catch (e) {
        return value;
      }
    });
  }

  getBreakpoints(options) {
    if (!options.breakpoints) return;
    var gridResponsive = [];
    Object.entries(options.breakpoints).forEach((entry) => {
      var size = entry[0],
        value = entry[1],
        breakpoint = {};
      breakpoint[size] = parseInt(value.slidesPerView);
      gridResponsive.push(breakpoint);
    });
    return gridResponsive;
  }

  renderSlider(element, api) {
    var self = this,
        api = api || {};
    if (element.classList.contains("swiper-initialized")) {
      return;
    }
    var options = this.datasetToObject(element.dataset) || {};
    Object.assign(options, api);
    options.on = {
      afterInit: function(){
        if(this.params.direction == 'vertical') return;
        var swiperId = this.slidesEl.id,
          spaceBetween = this.params.spaceBetween,
          rows = this.params.grid.rows;
        if(rows > 1){
          var style = '#' + swiperId + ' .swiper-slide{ height: calc((100% - ' + (rows -1)*spaceBetween + 'px) / ' + rows + ');}';
          self.appendStyle(style);
        }
      }
    }
    return new Swiper(element, options);
  }
  
  renderGrid(element) {
      var options = this.datasetToObject(element.dataset) || {},
          responsive = this.getBreakpoints(options);
      if (responsive == undefined) return;
      if (iClass === undefined) {
        var gridWrapper = element.querySelector(".swiper-wrapper");
        gridWrapper.classList.add("flex-wrap");
        gridWrapper.querySelectorAll(":scope >*").forEach((el) => {
          el.classList.add("alo-item");
        });
        var iClass = ".alo-item";
      }
      var selector = '.' + this.selector,
        classes = selector + " " + iClass,
        padding =
          (options || {}).spaceBetween === void 0
            ? 0
            : options.spaceBetween / 2,
        style = "";
      var length = Object.keys(responsive).length;
      Object.entries(responsive).forEach((item) => {
        var key = parseInt(item[0]),
          value = item[1];
        var col = 0,
          maxWith = 0,
          minWith = 0;
        Object.entries(value).forEach((entry) => {
          var size = parseInt(entry[0]),
            num = parseInt(entry[1]);
          minWith = size + 1;
          col = num;
        });
        if (key + 2 < length) {
          Object.entries(responsive[key + 1]).forEach((entry) => {
            var size = parseInt(entry[0]),
              num = parseInt(entry[1]);
            maxWith = size;
            col = num;
          });
          style += ' @media (min-width: ' + minWith + 'px) and (max-width: ' + maxWith + 'px)';
        } else {
          if (key + 2 == length) return; // don't use key = length - 1;
          Object.entries(responsive[key]).forEach((entry) => {
            var size = parseInt(entry[0]),
              num = parseInt(entry[1]);
            maxWith = size;
            col = num;
          });
          style += ' @media (min-width: ' + maxWith + 'px)';
        }
        var clearRtl = classes + ':nth-child(' + col + 'n+1){clear: left}';
        clearRtl += ' .rtl ' + classes + ':nth-child(' + col + 'n+1){clear: right}';
        style += ' {' + selector + '{margin: 0 -' + padding + 'px}' + classes + '{padding: 0 ' + padding + 'px; box-sizing: border-box; width: calc(100% / ' + col + ')} ' + clearRtl + '}';
      });
      this.appendStyle(style);    
  }

  renderFullScreen() {
      let self = this,
          productGallery= self.querySelector('.product-gallery'),
          gallery = productGallery.querySelector('gallery'),
          galleryMain = gallery.querySelector('.gallery-main, .gallery-main-grid'),
          mySwiper = galleryMain.swiper,
          swiperSlide = gallery.querySelectorAll('.swiper-slide');
      if(!mySwiper) return;
      mySwiper.on('slideChange', function () {
          let dialog = galleryMain.closest('dialog.gallery-fullscreen');
          if(dialog) dialog.querySelector('.toggle-zoom').classList.remove('zoom-out');
      })
      swiperSlide.forEach((slide) => {
        slide.addEventListener('click', (event) => {
            if(slide.dataset.media_type != "image" || slide.closest('dialog.gallery-fullscreen')) return;
            let dialogModal = document.createElement('dialog-modal');
            dialogModal.innerHTML = `<dialog data-autoplay modal-mode="fullscreen" data-destroy="true" class="gallery-fullscreen"></dialog>`;
            productGallery.style.opacity=0;
            mySwiper.disable();
            document.body.appendChild(dialogModal);
            dialogModal.addEventListener("opened", (event) => {
              dialogModal.querySelector('dialog').appendChild(gallery);
              dialogModal.querySelector('dialog').insertAdjacentHTML("beforeend", '<span class="toggle-zoom">Zoom(+/-)</span>');
              /* Zoom */ 
              dialogModal.querySelectorAll('.toggle-zoom').forEach(element => {
                element.addEventListener('click', function(e) {
                  // (element.classList.toggle('zoom-out')) ? mySwiper.zoom.in() : mySwiper.zoom.out();
                  element.classList.toggle('zoom-out');
                  mySwiper.zoom.toggle();
                });
              });
              mySwiper.enable();
              mySwiper.zoom.enable();
              mySwiper.update();
            });
            dialogModal.addEventListener("close", (event) => {
                mySwiper.zoom.out();
                mySwiper.zoom.disable();
                mySwiper.disable();
                self.controller.abort();
                var gallery= dialogModal.querySelector('gallery');
                if(gallery) productGallery.prepend(gallery);
                productGallery.style.opacity=1;
            });
            dialogModal.addEventListener("closed", (event) => {
                mySwiper.enable();
                mySwiper.update();
            });
            galleryMain.addEventListener("wheel", function(event){
                const zoomIn = event.deltaY < 0;
                if (zoomIn && galleryMain.closest('dialog')) {
                  mySwiper.zoom.in();
                } else {
                  mySwiper.zoom.out();
                }
            });
        })
      });   
  }
  
  appendStyle(css) {
    var style = document.createElement('style');
      style.setAttribute('type', 'text/css');
      style.textContent = css;
    document.head.appendChild(style);
  }

}

customElements.define("media-gallery", MediaGallery);
