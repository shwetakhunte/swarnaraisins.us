if (!customElements.get('grid-slider')) {
  class GridSlider extends HTMLElement {
    constructor() {
      super();
      let self = this;
      this.lazyslider = true;
      document.addEventListener("GridSliderUpdated", function (event) {
        self.lazyslider = false;
        self.initialized();
      });
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
      var isRTL = document.body.classList.contains("rtl"),
        options = this.getDataset();
      this.querySelectorAll(":scope .swiper").forEach((element) => {
        if (element.classList.contains('grid-init')) return;
        this.selector = "grid-slider-" + this.uniqid();
        element.classList.add(this.selector, 'grid-init');
        if (isRTL) {
          element.setAttribute("dir", "rtl");
        }
        if (options.slidesPerView) {
          this.sliderRender(element);
          return;
        }else{
          this.renderGrid(element);
        }
      });
    }
  
    getDataset() {
      if(!this.Dataset) this.Dataset = this.datasetToObject(this.dataset);
      return this.Dataset;
    }

    datasetToObject(dataset, evalX)  {
      let object  = Object.assign({}, dataset);
      for (let property in object) {
          let value = object[property];
          try {
              value = JSON.parse(value)
          } catch (e) {
          }
          if(evalX){
              try {
                  /* return value if is function */
                  value = (0, eval)('(' + value + ')');
              } catch (e) {
                  value = value;
              }
          }
          object[property]  = value;
      }
      return  object;
    }

    datasetParseToObject(dataset, evalX) {
      return JSON.parse(JSON.stringify(dataset), (key, value) => {
          try {
            return JSON.parse(value);
          } catch (e) {
            return value;
          }
          if(evalX){
              try {
                  /* return value if is function */
                  value = (0, eval)('(' + value + ')');
              } catch (e) {
                  value = value;
              }
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
  
    sliderRender(element) {
      var self = this;
      if (element.classList.contains("swiper-initialized")) {
        return;
      }
      var options = this.getDataset() || {};
      if(options.navigation){
        Object.assign(options, {
          navigation: {
            nextEl: '.' + this.selector + ' ' + options.navigation.nextEl,
            prevEl: '.' + this.selector + ' ' + options.navigation.prevEl
          }
        });
      }
      var onEvent = options.on || {};
      Object.assign(onEvent, {
        afterInit: function(){
          var swiperId = this.slidesEl.id,
            spaceBetween = this.params.spaceBetween,
            rows = this.params.grid.rows;
          if(rows > 1){
            var style = '#' + swiperId + ' .swiper-slide{ height: calc((100% - ' + (rows -1)*spaceBetween + 'px) / ' + rows + ') !important;}';
            self.appendStyle(style);
          }
        },
        autoplayTimeLeft(s, time, progress) {
          var progressCircle = self.querySelector(".autoplay-progress svg");
          var progressContent = self.querySelector(".autoplay-progress span");
          if(progressCircle) progressCircle.style.setProperty("--progress", 1 - progress);
          if(progressContent) progressContent.textContent = `${Math.ceil(time / 1000)}s`;
        }
      });
      options.on = onEvent;
      if (!localStorage.getItem("touchstart") && window.matchMedia('(max-width: 768px)').matches && window.matchMedia("(pointer: coarse)").matches) {
          document.body.addEventListener("touchstart", (event) => {
              localStorage.setItem("touchstart", true);
              new Swiper(element, options);
          }, {once : true});
      } else {
        if ('IntersectionObserver' in window && self.lazyslider) {
          const observerSlider = new IntersectionObserver((entries, observer) => {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                new Swiper(element, options);
                observerSlider.unobserve(entry.target);
              }
            });
          }, { root: null, rootMargin: '10px', threshold: 0.5 });
          observerSlider.observe(self);
        }else {
          new Swiper(element, options);
        }
      }
    }
    renderGrid(element) {
      var options = this.getDataset() || {},
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
    
    appendStyle(css) {
      var style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.textContent = css;
      document.head.appendChild(style);
    }
  
  }
  
  customElements.define("grid-slider", GridSlider);
}