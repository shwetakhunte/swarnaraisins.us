/* aaa-element.js */
Element.prototype.onEvent = function(events, selector, fn){
    events.split(' ').forEach((event) => {
        this.addEventListener(event, (e) => {
            if(typeof fn !== 'function') return;
            element = e.target.closest(selector);
            if(element) fn.bind(element)(e);
        })
    })
}
        
Element.prototype.on = function(events, fn){
    events.split(' ').forEach((event) => {
        this.addEventListener(event, (e) => {
            if(typeof fn  !== 'function') return;
            fn.bind(e.target)(e);
        })
    })
}

Element.prototype.getSibling = function(){
    let siblings = [];
    for (let sibling of this.parentNode.children) {
        if (sibling !== this) siblings.push(sibling);
    }
    return siblings;
}

Element.prototype.slideUp = function(duration = 500, classes)  {
    this.style.transitionProperty = 'height, margin, padding';
    this.style.transitionDuration = duration + 'ms';
    this.style.boxSizing = 'border-box';
    this.style.height = this.offsetHeight + 'px';
    this.offsetHeight;
    this.style.overflow = 'hidden';
    this.style.height = 0;
    this.style.paddingTop = 0;
    this.style.paddingBottom = 0;
    this.style.marginTop = 0;
    this.style.marginBottom = 0;
    window.setTimeout(() => {
        this.style.display = 'none';
        this.style.removeProperty('height');
        this.style.removeProperty('padding-top');
        this.style.removeProperty('padding-bottom');
        this.style.removeProperty('margin-top');
        this.style.removeProperty('margin-bottom');
        this.style.removeProperty('overflow');
        this.style.removeProperty('transition-duration');
        this.style.removeProperty('transition-property');
        if(classes) this.classList.remove(classes);
    }, duration);
}
    
Element.prototype.slideDown = function(duration = 500, classes)  {
    this.style.removeProperty('display');
    let display = window.getComputedStyle(this).display;

    if (display === 'none')
            display = 'block';
    this.style.display  = display;
    let height = this.offsetHeight;
    this.style.overflow = 'hidden';
    this.style.height = 0;
    this.style.paddingTop = 0;
    this.style.paddingBottom = 0;
    this.style.marginTop = 0;
    this.style.marginBottom = 0;
    this.offsetHeight;
    this.style.boxSizing = 'border-box';
    this.style.transitionProperty = "height, margin, padding";
    this.style.transitionDuration = duration + 'ms';
    this.style.height = height  + 'px';
    this.style.removeProperty('padding-top');
    this.style.removeProperty('padding-bottom');
    this.style.removeProperty('margin-top');
    this.style.removeProperty('margin-bottom');
    window.setTimeout(() => {
        this.style.removeProperty('height');
        this.style.removeProperty('overflow');
        this.style.removeProperty('transition-duration');
        this.style.removeProperty('transition-property');
        if(classes) this.classList.add(classes);
    }, duration);
}

Element.prototype.slideToggle = function(duration = 500)  {
    if  (window.getComputedStyle(this).display === 'none') {
        return this.slideDown(duration);
    } else  {
        return this.slideUp(duration);
    }
}
/* End aaa-element.js */
 

/* accordion-tab.js */
if (!customElements.get("accordion-tab")) {
    customElements.define("accordion-tab", class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.load()
        }
        getDataset() {
            if(!this.Dataset) this.Dataset = this.datasetToObject(this.dataset);
            return this.Dataset;
        }
        datasetToObject(dataset) {
            return JSON.parse(JSON.stringify(dataset), (key, value) => {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            });
        }
        load() {
            let self = this;
            this.querySelectorAll('.tab-title').forEach( tab => {
                tab.addEventListener('click', function(event) {
                    let config = self.getDataset(),
                        tabPanel = tab.closest('.tab-panel'),
                        status = tabPanel.classList.toggle('active');
                    if(status && config.siblingsClose){
                        for (let panel of self.querySelectorAll('.tab-panel')) {
                            if (panel !== tabPanel) {
                                if(panel.classList.contains('active')){
                                    let tabTitle = panel.querySelector('.tab-title');
                                    if(tabTitle) tabTitle.click();
                                }
                            }
                        }
                    }
                    if(config.scrollIntoView) tabPanel.scrollIntoView({ block: "start", inline: "nearest", behavior: 'smooth' });
                });
            });
        }
    });
}
/* End accordion-tab.js */
 

/* action-condition.js */
if (!customElements.get("action-condition")) {
    class ActionCondition extends HTMLElement {
        constructor() {
            super();
            this.onMutation = this.onMutation.bind(this);
        }
        connectedCallback() {
            this.load();
            this.observer = new MutationObserver(this.onMutation);
            this.observer.observe(this, {
                childList: true,
                subtree: true
            });
        }
        disconnectedCallback() {
            this.observer.disconnect();
        }

        load() {
            var self = this,
                condition = this.querySelector('input[type="checkbox"]'),
                action = this.querySelector('.action');
            if (condition && action) {
                if(!condition.checked){
                    action.classList.add('disabled');
                }else{
                    action.classList.remove('disabled');
                }
                condition.addEventListener('change', function (event) {
                    if (event.currentTarget.checked) {
                        action.classList.remove('disabled');
                    } else {
                        action.classList.add('disabled');
                    }
                });
            }
        }
        onMutation(mutations) {
            this.load();
        }
    }

    customElements.define("action-condition", ActionCondition);
}
/* End action-condition.js */
 

/* ajax-recommendations.js */
if (!customElements.get("ajax-recommendations")) {
    class AjaxRecommendations extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.init();
        }
        init() {
            if(this.dataset.matchMedia && !window.matchMedia(this.dataset.matchMedia).matches) return;
            this.closeX();
            this.getProduct();
        }
        getProduct() {
            var self = this,
                url = self.dataset.url,
                sectionId = self.dataset.sectionId || this.tagName.toLowerCase(),
                productId = self.dataset.productId;
            self.classList.add("init");
            fetch(`${url}&section_id=${sectionId}&product_id=${productId}`)
                .then((response) => response.text())
                .then((responseText) => {
                    var html = new DOMParser().parseFromString(responseText, "text/html"),
                        source = html.querySelector(self.tagName.toLowerCase());
                    if (source) self.innerHTML = source.innerHTML;
                });
        }

        closeX() {
            this.addEventListener("click", function (event) {
                var target = event.target,
                    open = target.closest(".open-recommendations");
                if (open) {
                    if (target.matches(".close-x") || target.closest(".close-x")) {
                        open.classList.remove("open-recommendations");
                    }
                }

            });
        }
    }

    customElements.define("ajax-recommendations", AjaxRecommendations);
    customElements.define("minicart-recommendations", class extends AjaxRecommendations { });
}
/* End ajax-recommendations.js */
 

/* back-to-top.js */
if (!customElements.get('back-to-top')) {
    customElements.define('back-to-top', class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.load();
        }
        load() {
            var self = this,
            lastScrollTop = 0;
            window.addEventListener("scroll", (event) => {
                let status = window.scrollY,
                  documentHeight = Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.offsetHeight,
                    document.body.clientHeight,
                    document.documentElement.clientHeight
                );
                if(status + window.innerHeight == documentHeight){
                    document.documentElement.classList.add('scroll_down_end');
                }else {
                    document.documentElement.classList.remove('scroll_down_end');
                }
                if(status == 0){
                    document.documentElement.classList.add('scroll_up_end');
                }else {
                    document.documentElement.classList.remove('scroll_up_end');
                }
                if (status > lastScrollTop){
                    document.documentElement.classList.add('scroll_down');
                    document.documentElement.classList.remove('scroll_up', 'scroll_init');
                } else if(status == lastScrollTop){
                    document.documentElement.classList.add('scroll_init');
                    document.documentElement.classList.remove('scroll_down', 'scroll_up');
                } else {
                    document.documentElement.classList.add('scroll_up');
                    document.documentElement.classList.remove('scroll_down', 'scroll_init');
                }
                lastScrollTop = status;
                if (status > 500) {
                    self.classList.add('show');
                } else {
                    self.classList.remove('show');
                }
                let percent = (status/(documentHeight - window.innerHeight))*100;
                self.style.setProperty("--height", `${percent.toFixed(2)}%`);
            });
            self.addEventListener("click", function(e) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return false;
            });
        }
    })
}
/* End back-to-top.js */
 

/* bought-together.js */
if (!customElements.get("bought-together")) {
  class BoughtTogether extends HTMLElement {
    constructor() {
      super();
      this.settings = {
        MainRequire: true,
      };
      var self = this;
      document.addEventListener("DOMContentLoaded", function (event) {
        self.init();
      });
      document.addEventListener("BoughtTogetherUpdated", function (event) {
        self.init();
      });
      document.dispatchEvent(
        new CustomEvent("BoughtTogetherReady", { detail: self })
      );
    }

    uniqid(length) {
      length = length || 10;
      var result = "",
        characters = "abcdefghijklmnopqrstuvwxyz0123456789",
        charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }

      return result;
    }

    init() {
      var self = this;
      if (this.classList.contains("bought-together-init")) return;
      this.classList.add("bought-together-init");
      this.renderElement();
      var checkbox = self.querySelectorAll(
          'input[name="bought-together-checkbox"]'
        ),
        number = checkbox.length;
      checkbox.forEach((checbox) => {
        checbox.addEventListener("click", function (e) {
          if (event.currentTarget.checked) {
            number++;
            this.closest(".item-product").classList.add("selected-product");
          } else {
            number--;
            this.closest(".item-product").classList.remove("selected-product");
          }
          self.renderDiscountAnnouncement(number);
          self.renderPrice();
        });
      });
      document.body.addEventListener("afterVariantUpdated", function (e) {
        self.renderPrice();
      });
    }

    datasetToObject(dataset) {
      return JSON.parse(JSON.stringify(dataset), (key, value) => {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      });
    }

    renderElement() {
      var self = this,
        data = this.datasetToObject(this.dataset);
      this.querySelector(".add-bought-together").addEventListener(
        "click",
        function () {
          this.classList.add("loading");
          var _self = this,
            items = [];
          self.querySelectorAll(".product-item").forEach((product) => {
            let boughtTogether = product.querySelector('input[name="bought-together-checkbox"]');
            if(boughtTogether && boughtTogether.checked){
              let addToCartForm = product.querySelector('form[action$="/cart/add"]'),
                formData = new FormData(addToCartForm);
              items.push(Object.fromEntries(formData));
            }
          });
          if (!items.length) {
            return;
          }
          fetch(window.Shopify.routes.root + "cart/add.js", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: `application/json`,
            },
            body: JSON.stringify({
              items: items,
            }),
          })
            .then((response) => response.json())
            .then((product) => {
              _self.classList.remove("loading");
              document.body.dispatchEvent(
                new CustomEvent("update:miniCart", {
                  bubbles: true,
                })
              );
            })
            .catch((error) => {});
          document.body.addEventListener(
            "contentUpdated",
            function () {
              document
                .querySelector('.push_side[data-id="#js_cart_popup"]')
                .click();
            },
            { once: true }
          );
        }
      );
    }

    renderPrice() {
      var self = this,
        totalPrice = 0,
        totalComparePrice = 0;
      self.querySelectorAll(".product-item").forEach((product) => {
        var addToCartForm = product.querySelector('form[action$="/cart/add"]'),
          formData = new FormData(addToCartForm);
        if (!formData.get("bought-together-checkbox")) return;
        var dataJson = product.querySelector(".data-json-product"),
          jsonProduct = dataJson
            ? JSON.parse(dataJson.innerHTML)
            : product.querySelector("[data-js-product]").dataset.jsonProduct,
          productId = formData.get("id");
        jsonProduct.variants.forEach((variant) => {
          if (productId == variant.id) {
            totalPrice = totalPrice + parseFloat(variant.price);
            totalComparePrice = variant.compare_at_price
              ? totalComparePrice + variant.compare_at_price
              : totalComparePrice + variant.price;
          }
        });
      });
      if (totalComparePrice <= totalPrice) {
        self
          .querySelector(".info-bought-together")
          .classList.add("hidden-save");
      } else {
        self
          .querySelector(".info-bought-together")
          .classList.remove("hidden-save");
      }

      self.querySelector(".special-price").innerHTML = Shopify.formatMoney(
        totalPrice,
        theme.moneyFormat
      );
      self.querySelector(".compare-price").innerHTML = Shopify.formatMoney(
        totalComparePrice,
        theme.moneyFormat
      );
      self.querySelector(".save-price").innerHTML = Shopify.formatMoney(
        totalComparePrice - totalPrice,
        theme.moneyFormat
      );
    }

    renderDiscountAnnouncement(number) {
      var announcement = this.querySelector(".alo-discount-announcement");
      if (!announcement) return;
      var aloDiscount = announcement.querySelectorAll(".alo-discount"),
        msg = announcement.querySelector(".qty_item_" + number);
      for (let discount of aloDiscount) {
        if (discount !== msg) discount.classList.add("hidden");
      }
      if (msg) {
        msg.classList.remove("hidden");
      }
    }

    appendStyle(css) {
      var style = document.createElement("style");
      style.setAttribute("type", "text/css");
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  customElements.define("bought-together", BoughtTogether);
}

/* End bought-together.js */
 

/* campaign-bar.js */
if (!customElements.get("campaign-bar")) {
    class CampaignBar extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.load()
        }
        load() {
            let self = this,
            closeX = this.querySelector('.close-x');
            if(closeX){
                closeX.addEventListener('click', (event) => {
                    self.classList.add('close-bar');
                    self.classList.remove('show');
                });
            }
        }
    }
    customElements.define("campaign-bar", CampaignBar);
    customElements.define("top-bar", class extends CampaignBar { });
    customElements.define("footer-bar", class extends CampaignBar { });
}
/* End campaign-bar.js */
 

/* collection-storage.js */
if (!customElements.get("collection-compare")) {
    class CollectionStorage extends HTMLElement {
        constructor() {
            super();
            this.namespace = this.tagName.toLowerCase().replace('collection', 'shop');
            this.storageName =  window?.theme?.customer ? `${this.namespace}-customer-'${window.theme.customer.id}` : `${this.namespace}-guest`;
        }
        connectedCallback() {
            this.load()
        }

        load() {
            let self = this,
                items   = this.getItems(),
                template = self.dataset.view,
                collectionEmpty = self.querySelector('.collection-empty'),
                productHtml = '';
                if(items.length){
                    if(self.hasAttribute('data-url')){
                        self.getContent();
                    }else{
                        items.forEach(function(handle, index) {
                            productHtml += self.getProductLazy(handle, template);
                        });
                        var swiper = self.querySelector('.swiper-wrapper');
                        if(swiper) swiper.innerHTML = productHtml;
                        document.dispatchEvent(new Event('GridSliderUpdated'));                     
                    }
                    document.body.dispatchEvent(new Event('contentUpdated'));
                }else{
                    if(collectionEmpty) collectionEmpty.style.display = 'block';
                }
                document.addEventListener(self.namespace, function(event){
                    let handle = event.detail.handle,
                      status = event.detail.status;
                    if(status){
                        self.querySelectorAll(`[data-handle="${handle}"]`).forEach(product => {
                          product.remove();
                        });
                        if(!self.getItems().length && collectionEmpty){
                            collectionEmpty.style.display = 'block';
                        }
                    }
                });
                self.clearStorage();
        }

        getContent() {
            let self = this,
                namespace = self.namespace,
                items = this.getItems(),
                query = [];
            items.forEach(handle => {
              query.push(`handle:${handle}`);
            });
            query = query.join(' OR ');
            var params = {
                    q: query,
                    type: 'product',
                    'options[unavailable_products]': 'last',
                    view: namespace.replace('shop-', '')
                },
                queryString = Object.keys(params).map(key => {
                  return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
                }).join('&');
            fetch(`${Shopify.routes.root}search?${queryString}`)
            .then((response) => response.text())
            .then(responseText => {
                let html = new DOMParser().parseFromString(responseText, 'text/html'),
                    content = '';
                if(html) content = html.querySelector(self.tagName.toLowerCase());
                if(content) self.outerHTML = content.outerHTML;
            }).catch(err => {
                console.log(err);
            });      
        }
      
        clearStorage() {
          let self = this;
          self.querySelectorAll('.js-clear-storage').forEach(element => {
                element.addEventListener('click', function(event){
                    self.querySelectorAll(self.namespace).forEach(button => {
                        button.click();
                    })
                });
          });
        }
      
        getItems() {
            let storage = localStorage.getItem(this.storageName);
            return storage ? JSON.parse(storage) : [];
        }
      
        getProductLazy(handle, template, classes) {
            template = template || 'pr_lazy_load';
            return '<div class="swiper-slide lazyload" data-handle="' + handle + '" data-include="' + Shopify.routes.root + 'products/' + handle + '/?view=' + template + '"></div>'
        };

    };

    customElements.define("collection-compare", CollectionStorage);
    customElements.define("collection-wishlist", class extends CollectionStorage { });
}
/* End collection-storage.js */
 

/* compare-color.js */
if (!customElements.get("compare-color")) {
    customElements.define("compare-color", class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.load()
        }
        load() {
            let self = this;
            self.querySelectorAll('.compare-color-value').forEach( element => {
                element.addEventListener('click' , function (e) {
                    let product = document.querySelector('product-single'),
                        dataJson = product.querySelector('.data-json-product'),
                        jsonProduct = dataJson ? JSON.parse(dataJson.innerHTML) : product.dataset.jsonProduct,
                        color = element.dataset.value,
                        variant = self.getFeatureImageByOptions(jsonProduct, [color]);
                    if(Object.keys(variant).length){
                        var colorImage = element.closest('.compare-color-popup-content').querySelector('.compare-color-image');
                        var colorSpecial = colorImage.querySelector('[data-color="' + color + '"]');
                        if(!colorSpecial){
                            colorImage.insertAdjacentHTML('afterbegin', `<div class="color-img"><span class="close">X</span><img data-color="${color}" src="${variant.featured_image.src}" ><span class="color-text">${color}</span></div>`);
                        }else {
                            colorSpecial.closest('.color-img').classList.remove('hidden');
                        }
                    }  
                });
            });
            self.addEventListener('click' , function (e) {
                let target = e.target;
                if(target.matches('.compare-color-image .close')){
                    target.closest('.color-img').classList.add('hidden');
                }
            });
        }
        getFeatureImageByOptions(jsonProduct, options) {
            let $variant = {};
            if (jsonProduct.hasOwnProperty('variants')) {
                jsonProduct.variants.forEach(function(variant){
                    if(variant.hasOwnProperty('featured_image') && variant.featured_image){
                        if( variant.options.toString() === options.toString() || variant.options.toString().indexOf(options.toString()) > -1){
                            $variant = variant;
                            return false;
                        }
                    }
                });
            }
            return $variant;
        }
    });
}
/* End compare-color.js */
 

/* count-down.js */
if (!customElements.get('count-down')) {
    class CountDown extends HTMLElement {

        constructor() {
            super();
            this.settings = {
                layout: '<span class="box-count day"><span class="number">0</span><span class="text">Days</span></span><span class="box-count hrs"><span class="number">0</span><span class="text">Hrs</span></span><span class="box-count min"><span class="number">0</span><span class="text">Mins</span></span><span class="box-count secs"><span class="number">0</span> <span class="text">Secs</span></span>',
                leadingZero: true,
                countStepper: -1, // s: -1 // min: -60 // hour: -3600
                timeout: '<span class="timeout">Time out!</span>',
            }
            var self = this;
            document.addEventListener("CountDownUpdated", function (event) {
                self.init();
            });
            document.dispatchEvent(new CustomEvent('CountDownReady', {detail:self}));
        }

        connectedCallback() {
            let self = this;
            if (!localStorage.getItem("touchstart")) {
                document.addEventListener("touchstart", (event) => {
                    localStorage.setItem("touchstart", true);
                    self.init();
                }, {once : true});
                document.addEventListener("mouseover", (event) => {
                    localStorage.setItem("touchstart", true);
                    self.init();
                }, {once : true});
            }else{
                this.init();
            }
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

        init() {
            if (this.classList.contains("count-down-init")) return;
            var data  = this.getDataset();
            Object.assign(this.settings, data);
            this.classList.add('count-down-init');
            this.renderTimer();
        }

        getDataset() {
            if(!this.Dataset) this.Dataset = this.datasetToObject(this.dataset);
            return this.Dataset;
        }

        datasetToObject(dataset) {
            return JSON.parse(JSON.stringify(dataset), (key, value) => {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            });
        }
      
        renderTimer() {
            var data  = this.getDataset();
            if(!data.timer){
                var date = new Date(),
                    year = ('y' in data) ? Number(data.y.toString().replace("yyyy", date.getFullYear())) : date.getFullYear(),
                    mm   = ('m' in data) ? Number(data.m.toString().replace("mm", date.getMonth() + 1)) : date.getMonth() + 1,
                    dd   = ('d' in data) ? Number(data.d.toString().replace("dd", date.getDate() + 1)) : date.getDate() + 1,
                    hh   = ('h' in data) ? Number(data.h.toString().replace("hh", date.getHours())) : date.getHours(),
                    ii   = ('i' in data) ? Number(data.i.toString().replace("ii", date.getMinutes())) : date.getMinutes(),
                    ss   = ('s' in data) ? Number(data.s.toString().replace("ss", date.getSeconds())) : date.getSeconds(),
                    newDate = new Date(year, mm -1, dd, hh, ii, ss); // the month is 0-indexed

                    if('plusHour' in data) newDate.setHours(newDate.getHours() + Number(data.plusHour));
                    if('plusMin' in data) newDate.setMinutes(newDate.getMinutes() + Number(data.plusMin));
                    if('plusSec' in data) newDate.setSeconds(newDate.getSeconds() + Number(data.plusSec));

                data.timer = newDate;
            }
            var gsecs = data.timer;
            if (typeof gsecs === 'string') gsecs = gsecs.replace(/-/g, '/');
            if (isNaN(gsecs) || typeof gsecs === 'object') {
                var start = Date.parse(new Date());
                var end = isNaN(gsecs) ? Date.parse(gsecs) : gsecs;
                var end = (typeof gsecs === 'object') ? gsecs : Date.parse(gsecs);
                gsecs = (end - start) / 1000;
            }
            if (gsecs > 0) {
                var isLayout = this.querySelector('.min .number');
                if (!isLayout) {
                    this.innerHTML = this.settings.layout;                                   
                }
                this.CountBack(gsecs);
            } else {
                this.classList.add('the-end');
                if(this.settings.timeout) this.innerHTML = this.settings.timeout;
            }
        }

        calcage(secs, num1, num2) {
            var s = ((Math.floor(secs / num1) % num2)).toString();
            if (this.settings.leadingZero && s.length < 2) s = "0" + s;
            return "<b>" + s + "</b>";
        }

        CountBack(secs) {
            var self = this,
                countStepper = this.settings.countStepper,
                setTimeOutPeriod = (Math.abs(countStepper) - 1) * 1000 + 990;
            var count = setInterval(function timer() {
                if (secs < 0) {
                    clearInterval(count);
                    self.classList.add('the-end');
                    if(self.settings.timeout) self.innerHTML = self.settings.timeout;
                    return;
                }
                var day  = self.querySelector('.day .number'),
                    hour = self.querySelector('.hour .number, .hrs .number'),
                    min  = self.querySelector('.min .number'),
                    sec  = self.querySelector('.sec .number, .secs .number');
                if(day)  day.innerHTML  = self.calcage(secs, 86400, 100000);
                if(hour) hour.innerHTML = self.calcage(secs, 3600, 24);
                if(min)  min.innerHTML  = self.calcage(secs, 60, 60);
                if(sec)  sec.innerHTML  = self.calcage(secs, 1, 60);
                secs += countStepper;
                return timer;
            }(), setTimeOutPeriod);
        }

        appendStyle(css) {
            var style = document.createElement('style');
                style.setAttribute('type', 'text/css');
                style.textContent = css;
            document.head.appendChild(style);
        }

    }

    customElements.define("count-down", CountDown);
}
/* End count-down.js */
 

/* count-up.js */
if (!customElements.get('count-up')) {
    class CountUp extends HTMLElement {

        constructor() {
            super();
            this.settings = {
                min: 0,
                max: 100,
                step: 1,
                speed: 1,
                infinite: true
            }
        }

        connectedCallback() {
             this.init();
        }

        init() {
            if (this.classList.contains("count-up-init")) return;
            var self = this,
                data  = this.getDataset();
                Object.assign(this.settings, data);
            this.classList.add('count-up-init');
            if ("IntersectionObserver" in window) {
                let counterObserver = new IntersectionObserver(function(entries, observer) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            self.renderCounter();
                            self.classList.add('inView');
                            if(!data.infinite) counterObserver.unobserve(entry.target);
                        }else{
                            self.classList.remove('inView');
                        }
                    });
                });
                counterObserver.observe(self);                                  
            } else {
                self.renderCounter();
            }
        }

        getDataset() {
            if(!this.Dataset) this.Dataset = this.datasetToObject(this.dataset);
            return this.Dataset;
        }

        datasetToObject(dataset) {
            return JSON.parse(JSON.stringify(dataset), (key, value) => {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            });
        }

        renderCounter(counter){
            var self = this,
                min = this.settings.min,
                max = this.settings.max,
                step = this.settings.step,
                speed = this.settings.speed,
                counter = counter || min,
                element = this.querySelector('.counter');
            counter = counter + step;
            if (counter <= max) {
                element.innerHTML = counter.toString();
                setTimeout(function(){
                    self.renderCounter(counter);
                }, speed)    
            }else{
                element.innerHTML = max.toString();
            } 
        }

    }

    customElements.define("count-up", CountUp);
}
/* End count-up.js */
 

/* customer-visitors.js */
if (!customElements.get("customer-visitors")) {
    customElements.define("customer-visitors", class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.load()
        }

        randomInteger(min, max) {
            return Math.round(min - 0.5 + Math.random() * (max - min + 1));
        };

        load() {
            var self = this,
                counter = self.querySelector('[data-js-counter]'),
                min = self.dataset.min,
                max = self.dataset.max,
                interval_min = self.dataset.intervalMin,
                interval_max = self.dataset.intervalMax,
                stroke = +self.dataset.stroke,
                current_value,
                new_value;
            self.classList.add('visitors--processing');
            function update() {
                setTimeout(function () {
                    if (!self.classList.contains('visitors--processing')) {
                        return;
                    }
                    current_value = +counter.textContent;
                    new_value = self.randomInteger(min, max);
                    if (Math.abs(current_value - new_value) > stroke) {
                        new_value = new_value > current_value ? current_value + stroke : current_value - stroke;
                        new_value = self.randomInteger(current_value, new_value);
                    }
                    counter.textContent = new_value;
                    update();
                }, self.randomInteger(interval_min, interval_max) * 1000);
            };
            update();
        }
    });
}
/* End customer-visitors.js */
 

/* dialog-modal.js */
if (!customElements.get("dialog-modal")) {

    customElements.define("dialog-modal", class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            let self = this;
            if (!localStorage.getItem("touchstart")) {
                document.addEventListener("touchstart", (event) => {
                    localStorage.setItem("touchstart", true);
                    self.init();
                }, {once : true});
                document.addEventListener("mouseover", (event) => {
                    localStorage.setItem("touchstart", true);
                    self.init();
                }, {once : true});
            }else{
                this.init();
            }
        }

        init() {
            if(this.classList.contains('init')) return;
            this.classList.add('init');
            let self = this;
            this.dialog = this.querySelector('dialog');
            if(this.dialog){
                if (this.dialog.hasAttribute('data-autoplay')) {
                    var autoplay = this.dialog.dataset.autoplay || 0;
                    this.dialog.classList.add('opening');
                    setTimeout(function () {
                        self.load();;
                    }, autoplay);
                }
            }else{
                let trigger = this.querySelectorAll(':scope [dialog-trigger]');
                if(trigger.length){
                    trigger.forEach(element => {
                        element.addEventListener('click', (event) => {
                            event.preventDefault();
                            self.renderTemplate();
                            if(!element.classList.contains('init')){
                                self.renderTrigger(element);
                                element.classList.add('init');
                            }
                            self.load();
                        })
                    })
                }else{
                    let template = this.querySelector('template'),
                        dialog = template.content.querySelector('dialog');
                    if (dialog && dialog.hasAttribute('data-autoplay')) {
                        var autoplay = dialog.dataset.autoplay || 0;
                        dialog.classList.add('opening');
                        setTimeout(function () {
                            self.renderTemplate()
                            self.load();;
                        }, autoplay);
                    }
                }
            }
        }

        renderTrigger(element)
        {
            let self = this;
            self.dialog = self.querySelector('dialog');
            let src = element.getAttribute('href');
            if(src){
                if (src.includes('youtube.com/')) {
                    let videoId = self.getYoutubeID(src);
                    src = `//www.youtube.com/embed/${videoId}?autoplay=1`;
                    self.dialog.insertAdjacentHTML('afterbegin', `<iframe class="dialog-iframe" src="${src}" frameborder="0" allowfullscreen></iframe>`);
                } else if (src.includes('vimeo.com/')) {
                    let videoId = self.getVimeoID(src);
                    src = `//player.vimeo.com/video/${videoId}?autoplay=1`
                    self.dialog.insertAdjacentHTML('afterbegin', `<iframe class="dialog-iframe" src="${src}" frameborder="0" allowfullscreen></iframe>`);
                } else {
                    if(!self.dialog){
                        let template = this.querySelector(src) || document.querySelector(src);
                        self.dialog = template.content.querySelector('dialog')
                        self.append(self.dialog)
                    }
                }
            }

        }

        uniqid(length) {
            length = length || 10;
            var result = "",
                characters = "abcdefghijklmnopqrstuvwxyz0123456789",
                charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(
                    Math.floor(Math.random() * charactersLength)
                );
            }
            return result;
        }

        /* Create open event */
        createOpenEvent(dialog) {
            var self = this;
            const observer = new MutationObserver(records => {
                records.forEach(async record => {
                    if (record.attributeName !== "open") { return; }
                    if (record.target.hasAttribute("open")) {
                        const dialog = record.target
                        dialog.removeAttribute('inert');
                        dialog.dispatchEvent(new Event('open'));
                        await self.animationsComplete(dialog);
                        dialog.classList.remove('opening');
                        dialog.dispatchEvent(new Event('opened'));
                    }
                });
            });

            observer.observe(dialog, { attributes: true });
        }

        dialogRender(events) {
            
        }

        getVimeoID(url) {
            var regExp = /^.*vimeo.com\/(\d+)($|\/)/;
            var match = url.match(regExp);
            return match ? match[1] : false;
        }

        getYoutubeID(url) {
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            var match = url.match(regExp);
            return (match && match[7].length == 11) ? match[7] : false;
        }

        load() {
            let self = this,
                dialog = this.querySelector('dialog');

            if(!dialog) return;
            if(!dialog.classList.contains('init')){
                dialog.append(this.renderButtonX());
                dialog.classList.add('init');
            }
            if (dialog.hasAttribute('data-match-media') && !window.matchMedia(dialog.dataset.matchMedia).matches) return;
            self.cookie = (dialog.dataset.cookie && typeof Cookies !== 'undefined');
            if (self.cookie && Cookies.get(dialog.dataset.cookie) == 'true') return;

            this.createOpenEvent(dialog);
            let modalMode = dialog.getAttribute('modal-mode');
            dialog.addEventListener("open", () => {
                (modalMode) ? document.documentElement.classList.add('dialog-open', `dialog-${modalMode}`) : document.documentElement.classList.add('dialog-open');
                self.dispatchEvent(new Event('open'));
                self.onOpen();
            });
            dialog.addEventListener("opened", () => {
                self.dispatchEvent(new Event('opened'));
                setTimeout(function(){
                 	dialog.classList.add('transition');
                }, 100);
                self.afterOpen();
            });

            dialog.showModal();

            dialog.addEventListener('click', function (event) {
                var rect = dialog.getBoundingClientRect(),
                    isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
                        rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
                if (!isInDialog) {
                    dialog.close();
                }
            });
            dialog.querySelectorAll(":scope .close-x").forEach((element) => {
                element.addEventListener("click", (event) => {
                    let transition = dialog.classList.contains('transition') ? 500: 0;
                    dialog.classList.remove('transition');
                    setTimeout(function(){
                        dialog.close();
                    }, transition);
                });
            });
            document.addEventListener('dialog:close', function(event) {
                dialog.close();
            })
            dialog.addEventListener("close", (event) => {
                (modalMode) ? document.documentElement.classList.remove('dialog-open', `dialog-${modalMode}`) : document.documentElement.classList.remove('dialog-open');
                if (dialog.querySelector('.do-not-show-again input:checked')) {
                    dialog.dataset.expires = 365;
                }
                if (self.cookie) {
                    Cookies.set(dialog.dataset.cookie, 'true', { expires: Number(dialog.dataset.expires), path: '/' });
                }
                self.dialogClose(event);
            });
        }

        // wait for all dialog animations to complete their promises
        async animationsComplete(dialog) {
            await Promise.allSettled(
                dialog.getAnimations().map(animation =>
                    animation.finished));
        }

        async dialogClose({ target: dialog }) {
            this.dispatchEvent(new Event('close'));
            dialog.setAttribute('inert', '');
            dialog.classList.add('closing');
            await this.animationsComplete(dialog);
            dialog.classList.remove('closing');
            dialog.dispatchEvent(new Event('closed'));
            this.dispatchEvent(new Event('closed'));
            if (dialog.dataset.destroy) {
                this.destroy();
            }
        }

        renderButtonX()
        {
            let button = document.createElement("span");
            button.classList.add('close-x', 'close');
            button.textContent = 'x';
            return button;
        }

        renderTemplate() {
            /* reuiqre in template must exist tag dialog */
            let template = this.querySelector('template');
            if (template){
                template.parentNode.replaceChild(template.content, template);
            }
        }

        destroy() {
            this.remove();
        }

        onOpen() {

        }

        afterOpen() {

        }

    });
}
/* End dialog-modal.js */
 

/* dialog-polyfill.js */
if (!window.HTMLDialogElement) {

    window.HTMLDialogElement = HTMLUnknownElement;

    const proto = HTMLUnknownElement.prototype;

    let activeDialog = null;
    let maxZIndex = 1000;

    proto.showModal = function(){
        this.__lastActiveElement = document.activeElement;

        this.style.display = 'block';
        setTimeout(()=>{ // makes backdrop-transitions work
            this.style.display = '';
            this.show();
            this.setAttribute('aria-modal', 'true');
        })
        this.classList.add('dialog-polyfill-as-modal');

        // focus first element autofocus if available
        const focusableEl = this.querySelector('[autofocus]') || this.querySelector('a[href],button,input,textarea,select,details,[contenteditable],[tabindex]');
        focusableEl?.focus();

        this.addEventListener('blur',preventBlurListener,true);
        addEventListener('keydown',escListener,true);

        // backdrop
        if (!this.__backdrop) {
            this.__backdrop = document.createElement('div');
            this.__backdrop.classList.add('backdrop');
        }
        this.__backdrop.style.zIndex = maxZIndex++;
        this.after(this.__backdrop);

        this.style.zIndex = maxZIndex++;

        activeDialog = this;
    }
    proto.show = function(){
        this.setAttribute('open', '');
        this.setAttribute('role', 'dialog'); // todo: this should be in the constructor
    }
    proto.close = function(returnValue){
        this.classList.remove('dialog-polyfill-as-modal');
        this.removeAttribute('open');
        this.setAttribute('aria-modal', 'false');
        this.__backdrop?.remove();
        this.removeEventListener('blur',preventBlurListener,true)
        removeEventListener('keydown',escListener,true);
        if (returnValue!=null) activeDialog.returnValue = returnValue;
        activeDialog = null;
        this.__lastActiveElement?.focus();
        const event = new Event('close',{bubbles:false})
        this.dispatchEvent(event);
    }
    Object.defineProperty(proto, 'open', {
        get(){
            return this.hasAttribute('open');
        },
        set(value){
            value ? this.open() : this.close();
        }
    })

    document.addEventListener('submit',e=>{
        if (e.target.getAttribute('method') !== 'dialog') return;
        e.preventDefault();
        activeDialog.close(e.submitter.value);
    },true)

    const css =
    'dialog{'+
        'display:block;'+
        'position:absolute;'+
        'left:0;'+
        'right:0;'+
        'width:fit-content;'+
        'height:fit-content;'+
        'margin:auto;'+
        'border-width:initial;'+
        'border-style:solid;'+
        'border-color:initial;'+
        'border-image:initial;'+
        'padding:1em;'+
        'background:white;'+
        'background:Canvas;'+
        'color:black;'+
        'color:CanvasText;'+
    '}'+
    'dialog:not([open]){'+
        'display:none;'+
    '}'+
    '.dialog-polyfill-as-modal{'+
        'position:fixed;'+
        'top:0;'+
        'bottom:0;'+
        'max-width:calc((100% - 6px) - 2em);'+
        'max-height:calc((100% - 6px) - 2em);'+
        'overflow:auto;'+
    '}'+
    'dialog + .backdrop{'+
        'position:fixed;'+
        'top:0;'+
        'right:0;'+
        'bottom:0;'+
        'left:0;'+
        'background:#0002;'+
    '}';
    document.head.insertAdjacentHTML('afterbegin','<style>'+css+'</style>');

    function preventBlurListener(e){
        if (!e.relatedTarget) return;
        if (!activeDialog.contains(e.relatedTarget)) {
            setTimeout(()=>{
                e.target.focus();
            })
        }
    }
    function escListener(e){
        if (e.key === "Escape") {
            const event = new Event('cancel',{bubbles:true,cancelable:true})
            activeDialog.dispatchEvent(event);
            if (!event.defaultPrevented) {
                activeDialog.close();
            }
        }
    }

}

/* End dialog-polyfill.js */
 

/* filter-search.js */
if (!customElements.get('filter-search')) {
    class FilterSearch extends HTMLElement {
        constructor() {
            super();
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

        getDataset() {
            if(!this.Dataset) this.Dataset = this.datasetToObject(this.dataset);
            return this.Dataset;
        }

        datasetToObject(dataset) {
            return JSON.parse(JSON.stringify(dataset), (key, value) => {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            });
        }

        initialized() {
            let groups = this.querySelectorAll(".group"),
                config = this.getDataset();
            this.querySelector(".search").addEventListener("keyup" , function(event){
                let filterValue = event.target.value.toUpperCase();
                groups.forEach(group => {
                    let items = group.querySelectorAll('.item a'),
                        show = config.showEmpty;
                    items.forEach(item => {
                        if (item.textContent.toUpperCase().indexOf(filterValue) > -1) {
                            item.parentElement.style.display = "";
                            show = true;
                        } else {
                            item.parentElement.style.display = "none";
                        }
                    })
                    if(show){
                        group.style.display = "";
                    }else{
                        group.style.display = "none";
                    }
                });
            });
        }
    }
    customElements.define("filter-search", FilterSearch);
}
/* End filter-search.js */
 

/* image-comparison.js */
if (!customElements.get('image-comparison')) {
  class ImageComparison extends HTMLElement {
    clicked = 0;
    img;
    slider;
    width;
    height;
    constructor() {
      super();
      var self = this;
      document.addEventListener("DOMContentLoaded", function (event) {
        if(!self.classList.contains('ajax')) self.initialized();
      });
      document.addEventListener("ImageComparisonUpdated", function (event) {
        self.initialized();
      });
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
      var self = this;
      this.img = this.querySelector('.img-comp-overlay');
      /* Get the width and height of the img element */
      this.width = this.img.offsetWidth;
      this.height = this.img.offsetHeight;
      /* Set the width of the img element to 50%: */
      this.img.style.width = (this.width / 2) + "px";
      /* Create slider: */
      this.slider = document.createElement("DIV");
      this.slider.setAttribute("class", "img-comp-slider");
      /* Insert slider */
      this.img.parentElement.insertBefore(this.slider, this.img);
      /* Position the slider in the middle: */
      this.slider.style.top = (this.height / 2) - (this.slider.offsetHeight / 2) + "px";
      this.slider.style.left = (this.width / 2) - (this.slider.offsetWidth / 2) + "px";
      /* Execute a function when the mouse button is pressed: */
      this.slider.addEventListener("mousedown", function(e){
        self.slideReady(e);
      });
      /* And another function when the mouse button is released: */
      this.addEventListener("mouseup", function(e){
        self.slideFinish();
      });
      /* Or touched (for touch screens: */
      this.slider.addEventListener("touchstart", function(e){
        self.slideReady(e);
      });
       /* And released (for touch screens: */
      this.addEventListener("touchend", function(e){
        self.slideFinish();
      });
    }

    slideReady(e) {
      e.preventDefault();
      var self = this;
      /* The slider is now clicked and ready to move: */
      this.clicked = 1;
      /* Execute a function when the slider is moved: */
      this.addEventListener("mousemove", function(e){
          self.slideMove(e);
      });
      this.addEventListener("touchmove", function(e){
          self.slideMove(e);
      });
    }
    slideFinish() {
      /* The slider is no longer clicked: */
      this.clicked = 0;
    }
    slideMove(e) {
      var pos;
      /* If the slider is no longer clicked, exit this function: */
      if (this.clicked == 0) return false;
      /* Get the cursor's x position: */
      pos = this.getCursorPos(e);
      /* Prevent the slider from being positioned outside the image: */
      if (pos < 0) pos = 0;
      if (pos > this.width) pos = this.width;
      /* Execute a function that will resize the overlay image according to the cursor: */
      this.slide(pos);
    }
    getCursorPos(e) {
      var a, x = 0;
      e = (e.changedTouches) ? e.changedTouches[0] : e;
      /* Get the x positions of the image: */
      a = this.img.getBoundingClientRect();
      /* Calculate the cursor's x coordinate, relative to the image: */
      x = e.pageX - a.left;
      /* Consider any page scrolling: */
      x = x - window.pageXOffset;
      return x;
    }
    slide(x) {
      /* Resize the image: */
      this.img.style.width = x + "px";
      /* Position the slider: */
      this.slider.style.left = this.img.offsetWidth - (this.slider.offsetWidth / 2) + "px";
    }  
  }
  
  customElements.define("image-comparison", ImageComparison);
}
/* End image-comparison.js */
 

/* lookbook-pin.js */
if (!customElements.get("lookbook-pin")) {
    class LookbookPin extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.pin();
            this.pinPopup();
        }
        pin() {
            var self = this;
            this.querySelectorAll('.pin_tt_js').forEach(element => {
                element.addEventListener('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    var pinType = element.closest('.pin__type'),
                      dblclick;
                    dblclick = (pinType.classList.contains('pin__opened')) ? true : false;
                    self.pinInfoHide();
                    if (dblclick) return;
                    pinType.classList.add('pin__opened');
                    self.querySelectorAll('.pin__slider').forEach(pin => {
                      pin.classList.remove('pin_slider_opened');
                    });
                    if (pinType.classList.contains('has_calc_pos')) return;
                    var pinLazy = pinType.querySelector('.pin_lazy_js'),
                        pinPopup = pinType.querySelector('.pin__popup');
                    if (!pinLazy) { pinLazy = pinPopup; }
                    if (pinLazy.classList.contains('pin__popup--left')) {
                        var widthPopup = pinPopup.clientWidth;
                        if (pinType.offsetLeft < widthPopup) {
                            var mrRight = widthPopup - pinType.offsetLeft + 10;
                            pinPopup.style.setProperty('margin-right', `-${mrRight}px'`);
                        }
                    } else if (pinLazy.classList.contains('pin__popup--right')) {
                        var widthPopup = pinPopup.clientWidth,
                            posRight = window.innerWidth - pinType.offsetLeft - pinType.clientWidth;
                        if (posRight < widthPopup) {
                            var mrLeft = widthPopup - posRight + 10;
                            pinPopup.style.setProperty('margin-left', `-${mrLeft}px'`);
                        }
                    }
                })
            });
            document.body.addEventListener('click', function (e) {
                var target = e.target;
                if (target.closest('.pin__type') || target.closest('.mfp-wrap')) return;
                self.pinInfoHide();
            });
        }
        pinInfoHide() {
          this.querySelectorAll('.pin__type.pin__opened').forEach(pin => {
            pin.classList.remove('pin__opened');
          });
          this.querySelectorAll('.pin__slider.pin_slider_opened').forEach(pin => {
            pin.classList.remove('pin_slider_opened');
          });     
        }
        pinPopup() {
            var self = this;
            this.querySelectorAll('[data-opennt]').forEach(element => {
                element.addEventListener('click', function(e){
                    e.preventDefault();
                    element.classList.add("current_clicked");
                    var dataset = element.dataset,
                        id = dataset.opennt,
                        color = dataset.color,
                        position = dataset.pos,
                        ani = dataset.ani || 'has_ntcanvas',
                        remove = dataset.remove,
                        focus = dataset.focus,
                        YOffset = window.pageYOffset;

                        var popup = self.querySelector(id);
                        if(!popup) return;
                        var classes =  `${ani} ${color} ${ani}_${position}`,
                            dialogModal = document.createElement('dialog-modal');
                        dialogModal.innerHTML = `<dialog data-autoplay modal-mode="mega" data-destroy="true" class="modal-look-product">${popup.outerHTML}</dialog>`;
                        document.body.appendChild(dialogModal);
                        document.body.addEventListener('ajax:addToCart',function(e) {
                            dialogModal.destroy();
                        }, {once : true});
                        dialogModal.addEventListener('open', (e) => {
                        }, { once: true });
                        dialogModal.addEventListener('close',function(e) {
                            element.classList.remove('current_clicked');
                            document.documentElement.classList.remove('ani');
                        });
                })
            });
        }
    }
    customElements.define("lookbook-pin", LookbookPin);
    customElements.define("lookbook-carousel", class extends LookbookPin { });
}
/* End lookbook-pin.js */
 

/* magic-accordion.js */
if (!customElements.get('magic-accordion')) {
    class MagicAccordion extends HTMLElement {
        constructor() {
            super();
            var self = this;
            this.defaults = {
                accordion: true,
                mouseType: false,
                leveltop: true,
                speed: 300,
                closedSign: 'collapse',
                openedSign: 'expand',
                openedActive: false,
            };
            this.settings = {};
            document.addEventListener("MagicAccordion", function (event) {
                self.initialized();
            });
        }
        connectedCallback() {
            if (!this.classList.contains('ajax')){
                if (!localStorage.getItem("touchstart") && window.matchMedia('(max-width: 768px)').matches && window.matchMedia("(pointer: coarse)").matches) {
                    let self = this;
                    document.body.addEventListener("touchstart", (event) => {
                        self.initialized();
                        localStorage.setItem("touchstart", true);
                    }, {once : true});
                } else {
                    this.initialized();
                }
            }
        }
        getDataset() {
            if(!this.Dataset) this.Dataset = this.datasetToObject(this.dataset);
            return this.Dataset;
        }
        datasetToObject(dataset) {
            return JSON.parse(JSON.stringify(dataset), (key, value) => {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            });
        }
        extend(object1, object2) {
            let obj = Object.assign({}, object1);
            return Object.assign(obj, object2);
        }
        addEventListener(events, selector, fn) {
            events = events.split(",").map((e) => e.trim());
            this.querySelectorAll(selector).forEach(element => {
                events.forEach(event => {
                    element.addEventListener(event, fn.bind(element));
                })
            });
        }
        getSibling(element) {
            let siblings = [];
            for (let sibling of element.parentNode.children) {
                if (sibling !== element) siblings.push(sibling);
            }
            return siblings;
        }
        parents(selector, element) {
            if ((element instanceof NodeList)) {
                var parents = Array.from(element).map((item) => item.closest(selector))
                    .filter((el, index, array) => {
                        /* remove null value */
                        return el ? array.indexOf(el) === index : false;
                    });
                return parents;
            } else {
                var closest = element.closest(selector);
                return closest ? [closest] : [];
            }
        }
        slideUp(target, duration = 500) {
            target.style.transitionProperty = 'height, margin, padding';
            target.style.transitionDuration = duration + 'ms';
            target.style.boxSizing = 'border-box';
            target.style.height = target.offsetHeight + 'px';
            target.offsetHeight;
            target.style.overflow = 'hidden';
            target.style.height = 0;
            target.style.paddingTop = 0;
            target.style.paddingBottom = 0;
            target.style.marginTop = 0;
            target.style.marginBottom = 0;
            window.setTimeout(() => {
                target.style.display = 'none';
                target.style.removeProperty('height');
                target.style.removeProperty('padding-top');
                target.style.removeProperty('padding-bottom');
                target.style.removeProperty('margin-top');
                target.style.removeProperty('margin-bottom');
                target.style.removeProperty('overflow');
                target.style.removeProperty('transition-duration');
                target.style.removeProperty('transition-property');
                target.classList.remove('down');
            }, duration);
        }
        slideDown(target, duration = 500) {
            target.style.removeProperty('display');
            let display = window.getComputedStyle(target).display;

            if (display === 'none')
                display = 'block';
            target.style.display = display;
            let height = target.offsetHeight;
            target.style.overflow = 'hidden';
            target.style.height = 0;
            target.style.paddingTop = 0;
            target.style.paddingBottom = 0;
            target.style.marginTop = 0;
            target.style.marginBottom = 0;
            target.offsetHeight;
            target.style.boxSizing = 'border-box';
            target.style.transitionProperty = "height, margin, padding";
            target.style.transitionDuration = duration + 'ms';
            target.style.height = height + 'px';
            target.style.removeProperty('padding-top');
            target.style.removeProperty('padding-bottom');
            target.style.removeProperty('margin-top');
            target.style.removeProperty('margin-bottom');
            window.setTimeout(() => {
                target.style.removeProperty('height');
                target.style.removeProperty('overflow');
                target.style.removeProperty('transition-duration');
                target.style.removeProperty('transition-property');
                target.classList.add('down');
            }, duration);
        }
        slideToggle(target, duration = 500) {
            if (window.getComputedStyle(target).display === 'none') {
                return slideDown(target, duration);
            } else {
                return slideUp(target, duration);
            }
        }
        initialized() {
            var self = this,
                options = this.getDataset() || {};
            this.settings = this.extend(this.defaults, options);
            options = this.settings;
            if (this.classList.contains('init')) return;
            this.classList.add('init');
            if (!options.leveltop) {
                self.addEventListener('click', 'li.level0.hasChild a.level-top', function (e) {
                    e.preventDefault();
                    self.getSibling(this).filter(element => element.matches('.arrow')).forEach(element => {
                        element.click();
                    })
                });
            }
            self.querySelectorAll("li").forEach(element => {
                let ul = element.querySelectorAll('ul');
                if (ul.length) {
                    ul.forEach(el => {
                        // el.style.display = 'none';
                    });
                    let a = element.querySelector('a');
                    if (a) a.insertAdjacentHTML("afterend", `<span class="arrow ${options.closedSign}">${options.closedSign}</p>`);
                }
            });
            if (options.openedActive) {
                self.openedAllActive();
            }
            if (options.mouseType) {
                self.addEventListener('mouseenter', 'li a', function (e) {
                    self.menuAction(this);
                });
            } else {
                self.addEventListener('click', 'li .arrow', function (e) {
                    self.menuAction(this);
                });
            }
        }

        menuAction(item) {
            var self = this,
                options = this.settings,
                parent = item.closest('li'),
                parentUl = parent.querySelectorAll('ul');
            if (parentUl.length) {
                if (options.accordion) {
                    var parentFirst = parent.querySelector("ul"),
                        parents = self.parents('ul', parent),
                        visible = Array.from(self.querySelectorAll("ul")).filter(element => element.classList.contains('down'));
                    visible.forEach(function (element, visibleIndex) {
                        if (element == parentFirst) return;
                        var close = true;
                        parents.some(function (el, parentIndex) {
                            if (parents[parentIndex] == visible[visibleIndex]) {
                                close = false;
                                return false
                            }
                            return true;
                        });
                        if (close) {
                            self.slideUp(element, options.speed);
                            self.clossedActive(element);
                        }
                    });
                }
                if (parentFirst.classList.contains('down')) {
                    self.slideUp(parentFirst, options.speed);
                    self.clossedActive(parentFirst);
                } else {
                    self.slideDown(parentFirst, options.speed);
                    self.openedActive(parentFirst);
                }
            }
        }
        clossedActive(element) {
            var options = this.settings,
                arrow = element.closest("li").querySelector("a").nextElementSibling;
            arrow.classList.add(options.closedSign);
            arrow.classList.remove(options.openedSign);
            arrow.textContent = options.closedSign;
        }
        openedActive(element) {
            var options = this.settings,
                arrow = element.closest("li").querySelector("a").nextElementSibling;
            arrow.classList.add(options.openedSign);
            arrow.classList.remove(options.closedSign);
            arrow.textContent = options.openedSign;
        }
        openedAllActive() {
            var options = this.settings;
            this.querySelectorAll("li.active").forEach(element => {
                self.parents('ul', element).forEach(ul => {
                    self.slideDown(ul, options.speed);
                    self.openedActive(ul);
                });
                self.slideDown(element.querySelector('ul'), options.speed);
                self.openedActive(element);
            });
        }
    }

    customElements.define("magic-accordion", MagicAccordion);
}
/* End magic-accordion.js */
 

/* minicart-addons.js */
if (!customElements.get("minicart-addons")) {
    customElements.define("minicart-addons", class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.load()
        }

        load() {
            let self = this,
                sideCart = this.closest('#js_cart_popup');
            sideCart.addEventListener('click', function(e){
                let target = e.target;
                if(target.matches('#js_cart_popup') && this.classList.contains('addons-open')){
                    this.querySelector('.alo_addon.open .btn-cancel').click();
                }
            });
            self.querySelectorAll('.mini_cart_addon_btn').forEach(element => {
                element.addEventListener('click', function(e){
                    let addon = sideCart.querySelector(`#addon_${element.dataset.open}`);
                    sideCart.classList.add('addons-open');
                    addon.classList.add('open');
                    for (let sibling of addon.parentNode.children) {
                        if (sibling !== addon) sibling.classList.remove('open');
                    }
                    if(localStorage.getItem('storedDiscount')){
                        sideCart.querySelector('[name="discount"]').value = localStorage.getItem('storedDiscount');
                    }
                })

            })
            self.querySelectorAll('.btn-cancel').forEach(element => {
                element.addEventListener('click', function(e){
                    sideCart.classList.remove('addons-open');
                    let addonOpen = sideCart.querySelector('.alo_addon.open');
                    if(addonOpen) addonOpen.classList.remove('open');
                });
            });
            self.addEventListener("click", function (e) {
                if(e.target.matches(".alo_cart-addons")){
                  let cancel = self.querySelector('.alo_addon.open .btn-cancel');
                  if(cancel) cancel.click();
                }
            });
            self.querySelectorAll('[data-action]').forEach(element => {
                element.addEventListener('click', function(e){
                    let addon = this.closest('.alo_addon'),
                      form = document.createElement('form');
                    form.appendChild(addon.cloneNode(true));
                    var bodyX = new FormData(form),
                      bodyX = new URLSearchParams(bodyX),
                      bodyX = Object.fromEntries(bodyX),
                      body  = JSON.stringify(bodyX);
                    switch(element.dataset.action) {
                        case 'note':
                        fetch(`${window.routes.cart_update_url}`, {...fetchConfig(), ...{body}});
                        break;
                        case 'discount':
                        localStorage.setItem('storedDiscount', bodyX.discount);
                        var url = window.Shopify.routes.root + `discount/${bodyX.discount}`;
                        fetch(`${url}`);
                        break;
                        default:
                        fetch(`${window.routes.cart_update_url}`, {...fetchConfig(), ...{body}});
                    }
                    addon.querySelector('.btn-cancel').click();
                });
            });
            document.body.addEventListener('ajax:addToCart', function(){
                sideCart.classList.remove('addons-open');
            });
        }
    });
}
/* End minicart-addons.js */
 

/* mini-storage.js */
if (!customElements.get("mini-compare")) {
    class MiniStorage extends HTMLElement {
        constructor() {
            super();
            this.namespace = this.tagName.toLowerCase().replace('mini', 'shop');
            this.storageName =  window?.theme?.customer ? `${this.namespace}-customer-'${window.theme.customer.id}` : `${this.namespace}-guest`;
        }
        connectedCallback() {
            this.load()
        }
        load() {
            let self = this,
                counter = self.querySelector('.header__counter');
            if(counter) counter.innerText = self.getItems().length;
            document.addEventListener(self.namespace, function(){
                if(counter) counter.innerText = self.getItems().length;
            });
            if(self.hasAttribute('data-modal')){
                self.addEventListener('click', function(event){
                    if(self.classList.contains('open')) return;
                    self.classList.add('open');
                    let shopElement = document.createElement(self.namespace);
                    if(shopElement){
                        let dialogModal = shopElement.dialogModal();
                        dialogModal.addEventListener('close',function(e) {
                            self.classList.remove('open');
                        })
                    }
                })             
            }
        }
        getHandle() {
            return this.dataset.handle;
        }
        getItems() {
            let storage = localStorage.getItem(this.storageName);
            return storage ? JSON.parse(storage) : [];
        }
    }
    customElements.define("mini-compare", MiniStorage);
    customElements.define("mini-wishlist", class extends MiniStorage { });
}
/* End mini-storage.js */
 

/* order-notification.js */
if (!customElements.get('order-notification')) {
    customElements.define("order-notification", class extends HTMLElement {

        constructor() {
            super();
        }

        connectedCallback() {
            this.init();
        }
        getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        init() {
            if(this.dataset.matchMedia && !window.matchMedia(this.dataset.matchMedia).matches) return;
            let self = this;
            this.config = JSON.parse(self.querySelector('.data-json-popup').textContent) || {};
            if(this.config.length) return;
            this.config.classDown = self.config.classDown[this.config.classUp];
            this.image = self.querySelector('.image');
            this.productUrl = self.querySelectorAll('.product-url');
            this.productName = self.querySelector('.product-name');
            this.saleLocation = self.querySelector('.sale-location');
            this.saleTime = self.querySelector('.sale-time');
            this.startTime = this.config.startTime * this.config.startTimeUnit;
            this.stayTime = this.config.stayTime * this.config.stayTimeUnit;
            this.startPostion = 0;

            this.loadSalesPopup();

            this.querySelectorAll('.close-x').forEach(element => {
                element.addEventListener('click', function(event) {
                    event.preventDefault();
                    self.hideSalesPopUp();
                    clearTimeout(self.stayTimeout);
                    clearTimeout(self.startTimeout);
                });                
            });
          
        }

        loadSalesPopup () {
            let self = this;
            this.renderProduct(this.startPostion);
            this.showSalesPopUp();
            ++this.startPostion;
            if (this.startPostion > this.config.limit - 1 || this.startPostion > this.config.productUrls.length - 1) { this.startPostion = 0 }
            this.stayTimeout = setTimeout(function () {
                self.unloadSalesPopup();
            }, this.stayTime);
        }

        unloadSalesPopup () {
            let self = this;
            this.hideSalesPopUp();
            this.startTimeout = setTimeout(function () {
                self.loadSalesPopup();
            }, this.startTime);
        };
      
        showSalesPopUp() {
            this.classList.remove('hide', this.config.classDown);
            this.classList.add(this.config.classUp);
        }

        hideSalesPopUp() {
            this.classList.remove(this.config.classUp);
            this.classList.add(this.config.classDown);
        };
      
        renderProduct(index){
            let self = this,
                img = this.config.productImages[index],
                img_src = img.replace(".jpg?v=", "_80x.jpg?v=").replace(".png?v=", "_70x.png?v=").replace(".gif?v=", "_70x.gif?v="),
                img_srcset = img.replace(".jpg?v=", "_130x.jpg?v=").replace(".png?v=", "_130x.png?v=").replace(".gif?v=", "_130x.gif?v=");
            this.image.setAttribute('src', img_src);
            this.image.setAttribute('srcset', img_src + ' 1x,' + img_srcset + ' 2x');
            this.productName.innerHTML = this.config.productTitles[index];
            this.productName.setAttribute("data-pid", this.config.productIds[index]);
            this.productUrl.forEach(link => {
                link.setAttribute('href', self.config.productUrls[index]);
            });
            this.saleLocation.innerHTML = this.config.saleLocations[self.getRandomInt(0, this.config.saleLocations.length - 1)];
            this.saleTime.innerHTML = this.config.saleTimes[self.getRandomInt(0, this.config.saleTimes.length - 1)];
        }
      
    })
}
/* End order-notification.js */
 

/* products-recently.js */
if (!customElements.get("products-recently")) {
    customElements.define("products-recently", class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.load()
        }

        getDataset() {
            if(!this.Dataset) this.Dataset = this.datasetToObject(this.dataset);
            return this.Dataset;
        }

        datasetToObject(dataset) {
            return JSON.parse(JSON.stringify(dataset), (key, value) => {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            });
        }

        getScreen() {
            let screen = [];
            screen['1'] = 'space-between';
            screen['361'] = 'mobile';
            screen['481'] = 'portrait';
            screen['576'] = 'landscape';
            screen['768'] = 'tablet';
            screen['992'] = 'notebook';
            screen['1200'] = 'laptop';
            screen['1480'] = 'desktop';
            screen['1920'] = 'widescreen';
            screen['1921'] = 'visible';

            return screen;
        }
      
        load() {
            let self = this,
                products        = this.querySelector('grid-slider'),
                config          = this.datasetToObject(products.dataset),
                storage         = localStorage.getItem('product-recently'),
                items           = storage ? JSON.parse(storage) : [],
                limit           = config.limit || 10,
                currentHandle   = '',
                productsHtml    = '',
                exist           = false, 
                num             = 0,
                product         = document.querySelector('#product-single');
            if(product){
                let dataJson = product.querySelector('.data-json-product'),
                jsonProduct = dataJson ? JSON.parse(dataJson.innerHTML) : product.dataset.jsonProduct;
                currentHandle = jsonProduct?.handle ? jsonProduct.handle : '';
            }
            Object.entries(items).forEach(function(entry){
                if(num == limit) return false;
                let handle = entry[1];
                if(handle == currentHandle){
                    exist = true;
                    return;
                };
                productsHtml += '<div class="swiper-slide lazyload" data-include="' + Shopify.routes.root + 'products/' + handle + '/?view=pr_lazy_load"></div>';
                num++;
            });
            if(productsHtml){
                let ctrlHtml = '',
                    skeleton = '',
                    navigation = config.navigation,
                    pagination = config.pagination,
                    breakpoints = config.breakpoints;
                self.getScreen().forEach((device, screen)=>{
                    if(breakpoints[screen]?.slidesPerView) skeleton += ` data-${device}="${breakpoints[screen].slidesPerView}"`;
                });
                if(navigation){
                    if(typeof navigation !== 'object') navigation = (0, eval)('(' + navigation + ')');
                    ctrlHtml += '<div class="' + navigation.nextEl.replace(/^\./, "") + '"></div><div class="' + navigation.prevEl.replace(/^\./, "") + '"></div>';
                }
                if(pagination){
                    if(typeof pagination !== 'object') pagination = (0, eval)('(' + pagination + ')');
                    ctrlHtml += '<div class="' + pagination.el.replace(/^\./, "") + '"></div>';
                }
                products.innerHTML = `<div class="swiper iSwiper" ${skeleton} ><div class="swiper-wrapper">${productsHtml}</div>${ctrlHtml}</div>`;
                products.classList.add('grid-slider');
                products.querySelectorAll(':scope .swiper-wrapper > *').forEach( elemnt => {
                    elemnt.classList.add('swiper-slide');
                })
                document.dispatchEvent(new Event('GridSliderUpdated'));
                self.style.display = 'block';
            }
            if(!currentHandle || exist) return;
            if(items.length > limit + 1){
                items.pop();
            }
            items.unshift(currentHandle);
            localStorage.setItem('product-recently', JSON.stringify(items));
        }
    });
}
/* End products-recently.js */
 

/* product-item.js */
if (!customElements.get("product-item")) {
    customElements.define("product-item", class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.load()
        }

        load() {
            let self = this,
                dataJson = self.querySelector('.data-json-product'),
                jsonProduct = dataJson ? JSON.parse(dataJson.innerHTML) : self.dataset.jsonProduct || {}; 
        }
    });
}
/* End product-item.js */
 

/* product-single.js */
if (!customElements.get("product-single")) {
    customElements.define("product-single", class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.load()
        }

        load() {
            let self = this,
                dataJson = self.querySelector('.data-json-product'),
                jsonProduct = dataJson ? JSON.parse(dataJson.innerHTML) : self.dataset.jsonProduct || {}; 
        }

    });
}
/* End product-single.js */
 

/* product-tab.js */
if (!customElements.get("product-tab")) {
    class ProductTab extends HTMLElement {
        constructor() {
            super();
            this.settings = {
                tabSelector: ".item",
                control: '[data-control]',
                products: 'grid-slider'
            };
        }
        connectedCallback() {
            this.load();
        }
        getSibling(element) {
            let siblings = [];
            for (let sibling of element.parentNode.children) {
                if (sibling !== element) siblings.push(sibling);
            }
            return siblings;
        }
        load() {
            var self = this,
                control = this.querySelector(self.settings.control),
                products = this.querySelector(self.settings.products),
                tabActive = control.querySelector('.item.active'),
                type = tabActive.dataset.collection,
                jsTxt = control.querySelector('.js_sr_txt');
            tabActive.classList.add('loaded');
            products.querySelector('.swiper').dataset.collection = type;
            if (jsTxt) {
                jsTxt.innerHTML = control.querySelector('.active').innerHTML;
                jsTxt.addEventListener('click', (e) => {
                    control.classList.toggle('active');
                })
            }
            control.querySelectorAll('.item').forEach(element => {
                var type = element.dataset.collection;
                element.addEventListener('click', async (e) => {
                    if (element.classList.contains('active')) return;
                    element.classList.add('active');
                    self.getSibling(element).forEach(el => {
                        el.classList.remove('active');
                    });
                    if (element.classList.contains('loaded')) {
                        var productCollection = products.querySelector('.swiper[data-collection="' + type + '"]');
                        self.getSibling(productCollection).forEach(el => {
                            el.classList.add('hidden');
                            el.classList.remove('active');
                        });
                        productCollection.classList.remove('hidden');
                        productCollection.classList.add('active');
                    } else {
                        element.classList.add("loading", "loaded");
                        await self.loadProducts(type);
                        element.classList.remove('loading');
                    }
                });
            });
        }
        async loadProducts(type) {
            var self = this,
                products = this.querySelector(self.settings.products),
                limit = products.dataset.limit,
                grid_classes = products.dataset.grid,
                first_col_50 = "false",
                slider = "false";
            if (!products) return;
            if (limit == undefined) limit = 10;
            if (grid_classes == undefined) grid_classes = '';
            if (products.dataset.slider != undefined) {
                slider = "true";
            }
            if (products.dataset.first50 != undefined) {
                first_col_50 = "true";
            }
            var url = Shopify.routes.root + 'collections/' + type,
                params = {
                    view: 'sorting',
                    count_limit: limit,
                    grid_classes: encodeURIComponent(grid_classes),
                    first_col_50: first_col_50,
                    slider: slider
                },
                viewAll = this.querySelectorAll('.bn_button.viewall a') || [];
            self.classList.add('loadding');
            params = Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&');
            await fetch(`${url}?${params}`)
                .then((response) => response.text())
                .then((responseText) => {
                    var ctrlHtml = '',
                        navigation = products.dataset.navigation,
                        pagination = products.dataset.pagination;
                    viewAll.forEach(element => {
                        element.href = url
                    });
                    // self.style.cssText = `display: block; height: ${ self.offsetHeight}px;`;
                    Object.assign(self.style, { display: "block", height: `${self.offsetHeight}px` });
                    if (navigation?.nextEl) {
                        if (typeof navigation !== 'object') navigation = (0, eval)('(' + navigation + ')');
                        ctrlHtml += '<div class="' + navigation.nextEl.replace(/^\./, "") + '"></div><div class="' + navigation.prevEl.replace(/^\./, "") + '"></div>';
                    }
                    if (pagination?.el) {
                        if (typeof pagination !== 'object') pagination = (0, eval)('(' + pagination + ')');
                        ctrlHtml += '<div class="' + pagination.el.replace(/^\./, "") + '"></div>';
                    }
                    products.lastElementChild.insertAdjacentHTML('afterend', '<div class="swiper iSwiper" data-collection="' + type + '" ><div class="swiper-wrapper">' + responseText + '</div>' + ctrlHtml + '</div>');
                    var productCollection = products.querySelector('.swiper[data-collection="' + type + '"]'),
                        items = productCollection.querySelector('.swiper-wrapper'),
                        count = 0;
                    for (const item of items.children) {
                        count++;
                        if (count > limit) {
                            item.remove();
                        } else {
                            item.classList.add('swiper-slide', 'alo-item');
                            grid_classes.split(' ').forEach(classes => {
                                if (classes) item.classList.add(classes);
                            });
                        }
                    }
                    productCollection.classList.remove('hidden');
                    productCollection.classList.add('active');
                    productCollection.querySelectorAll('.lazyload').forEach(element => {
                        lazySizes.loader.unveil(element);
                    });
                    self.getSibling(productCollection).forEach(el => {
                        el.classList.add('hidden');
                        el.classList.remove('active');
                    });
                    document.dispatchEvent(new Event('GridSliderUpdated'));
                    setTimeout(function () {
                        self.classList.remove('loadding');
                        Object.assign(self.style, { display: "", height: "" });
                    }, 1000);

                });
        }
    }

    customElements.define("product-tab", ProductTab);
}
/* End product-tab.js */
 

/* quick-view.js */
if (!customElements.get('quick-view')) {
    customElements.define("quick-view", class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.init();
        }
        init() {
            var self = this;
            this.addEventListener('click', (e) => {
                e.preventDefault();
                if(self.classList.contains('loading')) return;
                self.classList.add('loading');
                document.dispatchEvent(new Event('MainProductLoadJs'));
                let dialogModal = document.createElement('dialog-modal');
                dialogModal.addEventListener('open', (e) => {
                    Shopify.PaymentButton.init();
                }, { once: true });
                fetch(`${self.getAttribute('href')}`)
                    .then((response) => response.text())
                    .then((responseText) => {
                        self.classList.remove('loading');
                        var product = new DOMParser().parseFromString(responseText, 'text/html').querySelector('#product-single');
                        dialogModal.innerHTML = `<dialog data-autoplay modal-mode="mega" data-destroy="true" class="modal-quickview"><dialog-content>${product.outerHTML}</dialog-content></dialog>`;
                        document.body.appendChild(dialogModal);
                        document.body.addEventListener('ajax:addToCart',function(e) {
                            dialogModal.destroy();
                        }, {once : true});
                    });
            });
        }
    })
}
/* End quick-view.js */
 

/* shop-storage.js */
if (!customElements.get("shop-compare")) {
    class ShopStorage extends HTMLElement {
        constructor() {
            super();
            this.namespace = this.tagName.toLowerCase();
            this.storageName =  window?.theme?.customer ? `${this.namespace}-customer-'${window.theme.customer.id}` : `${this.namespace}-guest`;
        }
        connectedCallback() {
            this.load()
        }

        load() {
            let self = this;
            if(this.getStatus()) self.classList.add("added");
            document.addEventListener(self.namespace, function(){
                self.setStatus();
            })
            self.addEventListener('click',  function (event) {
                event.preventDefault();
                if(self.classList.contains('open')) return;
                // self.classList.toggle('added');
                let handle = this.getHandle(),
                    items = this.getItems(),
                    status = items.includes(handle);
                if(status){
                    items = items.filter((item) => item !== handle);
                }else{
                    items.push(handle);
                }
                this.setItems(items);
                document.dispatchEvent(new CustomEvent(this.namespace, {
                    detail: {
                        handle: handle,
                        status: status
                    }
                  }
                ));
                if(!status && this.storageName.includes('compare')){
                    if(self.classList.add('open'));
                    let dialogModal = self.dialogModal();
                    dialogModal.addEventListener('close',function(e) {
                        self.classList.remove('open');
                    })
                }
            });
        }

        getHandle() {
            let handle = this.dataset.handle;
            if(!handle){
              let product = this.closest('.product-item');
              if(product){
                let dataJson = product.querySelector('.data-json-product'),
                jsonProduct = dataJson ? JSON.parse(dataJson.innerHTML) : {};
                handle = jsonProduct.handle;
              }
            }
            return handle;
        }

        getItems() {
            let storage = localStorage.getItem(this.storageName);
            return storage ? JSON.parse(storage) : [];
        }

        setItems(items) {
            localStorage.setItem(this.storageName, JSON.stringify(items));
        }

        getStatus() {
            let self = this,
                storage = localStorage.getItem(this.storageName),
                items = storage ? JSON.parse(storage) : [];
            return items.includes(self.getHandle());
        }

        setStatus() {
            let status = this.getStatus();
            (status) ? this.classList.add('added') : this.classList.remove('added');
        }
      
        dialogSide() {
            return this.dialogModal('sidebar');
        }
        dialogModal(type) {
            type = type || 'mega';
            let self = this,
                namespace = self.namespace,
                items = this.getItems(),
                query = [],
                dialogModal = document.createElement('dialog-modal');
            items.forEach(handle => {
              query.push(`handle:${handle}`);
            });
            query = query.join(' OR ');
            var params = {
                  q: query,
                  type: 'product',
                  'options[unavailable_products]': 'last',
                  view: namespace.replace('shop-', '')
              },
              queryString = Object.keys(params).map(key => {
                  return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
              }).join('&');
            fetch(`${Shopify.routes.root}search?${queryString}`)
            .then((response) => response.text())
            .then(responseText => {
                dialogModal.innerHTML = `<dialog data-autoplay modal-mode="${type}" data-destroy="true" class="${namespace}-modal">${responseText}</dialog>`;
                document.body.appendChild(dialogModal);
            }).catch(err => {
                console.log(err);
            });

            return dialogModal;
        }
      
    }
    customElements.define("shop-compare", ShopStorage);
    customElements.define("shop-wishlist", class extends ShopStorage { });
}
/* End shop-storage.js */
 

/* slider-gallery.js */
class SliderGallery extends HTMLElement {
  constructor() {
    super();
    var $this = this;
    document.addEventListener("DOMContentLoaded", function (event) {
      $this.initSlider();
    });
    document.addEventListener("SliderGalleryUpdate", function (event) {
      $this.initSlider();
    });
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

  initSlider() {
      if (this.classList.contains("init")) return;
      this.classList.add("init");
      this.galleryRender();
  }

  datasetToObject(dataset) {
    return JSON.parse(JSON.stringify(dataset), (key, value) => {
      if (value === "null") return null;
      if (value === "true") return true;
      if (value === "false") return false;
      if (!isNaN(value)) return Number(value);
      try {
        return JSON.parse(value);
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

  galleryRender() {
      var isRTL = document.body.classList.contains("rtl"),
        thumbnail = this.querySelector(".swiper.thumbnail"),
        options = this.datasetToObject(thumbnail.dataset);
      if (isRTL) {
        thumbnail.setAttribute("dir", "rtl");
      }
      if (!options.slidesPerView) return;
      if (thumbnail.classList.contains("swiper-initialized")) {
        return;
      }
      var options = this.datasetToObject(thumbnail.dataset);
      var thumbs = new Swiper(thumbnail, options);

      var gallery = this.querySelector(".swiper.gallery");
      var gallerySlide = new Swiper(gallery, {
        loop: true,
        spaceBetween: 10,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        thumbs: {
          swiper: thumbs,
        },
      });
  }
}

customElements.define("slider-gallery", SliderGallery);

/* End slider-gallery.js */
 

/* sticky-addtocart.js */
if (!customElements.get("sticky-addtocart")) {
    customElements.define("sticky-addtocart", class extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.load()
        }

        load() {
            let self = this,
                dataJson = self.querySelector('.data-json-product'),
                jsonProduct = dataJson ? JSON.parse(dataJson.innerHTML) : self.dataset.jsonProduct || {},
                variants = jsonProduct.variants,
                qtySticky = self.querySelector('[name="quantity"]'),
                mainProduct = document.querySelector('#product-single'),
                mainInput = mainProduct.querySelector('[name="id"]'),
                qtyMain = mainProduct.querySelector('[name="quantity"]'),
                mainAddtoCart   = mainProduct.querySelector('.add-to-cart');
            if (!mainAddtoCart) return;
            let scrollHeight = mainAddtoCart.offsetTop;
            window.addEventListener("scroll", (event) => {
                let scrollY = window.scrollY,
                  documentHeight = Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.offsetHeight,
                    document.body.clientHeight,
                    document.documentElement.clientHeight
                ),
                bottom = (scrollY + window.innerHeight == documentHeight);
                if (scrollY > scrollHeight && !bottom) {
                    document.body.classList.add('sticky-addtocart-show');
                    self.classList.add("sticky_atc_shown");
                } else {
                    document.body.classList.remove('sticky-addtocart-show');
                    self.classList.remove("sticky_atc_shown");
                }
            });

            if(jsonProduct.variants){
                self.querySelectorAll('.popup_variant').forEach(element => {
                    element.addEventListener('click', function(){
                        let wrapVariant = element.closest('.wrap_variant');
                        if(wrapVariant) wrapVariant.classList.toggle('active');
                    });
                });
                var optionsItem = self.querySelectorAll('.cms-option-item'),
                    optionsItemMain = mainProduct.querySelectorAll('product-options .cms-option-item'),
                    selectItem  = self.querySelector('[name="id"]'),
                    selectSticky = selectItem.closest('.select-sticky');
                document.addEventListener('click', function(e){
                    var target = e.target,
                        selectSticky = selectItem.closest('.select-sticky');
                    if(target.matches('sticky-addtocart [name="id"]') && selectSticky){
                        (selectSticky.classList.contains('open')) ?  selectSticky.classList.remove('open') : selectSticky.classList.add('open');
                    }
                });
                selectItem.addEventListener('change', function () {
                    let variantId = selectItem.value,
                        selectSticky = selectItem.closest('.select-sticky');
                    if(selectSticky) selectSticky.classList.remove('open');
                    jsonProduct.variants.forEach(function(variant){
                        if(variant && variant.id == variantId){
                            var options = variant.options;
                            variant.options.forEach((val, idx)=>{
                                let optionSticky = optionsItem[idx].querySelector('[value="' + val + '"]'),
                                    optionMain = optionsItemMain[idx].querySelector('[value="' + val + '"]');
                                if(optionSticky) optionSticky.click();
                                if(optionMain) optionMain.click();
                            });
                        }
                    });
                });
                mainInput.addEventListener('input', function () {
                    let selectVal = selectItem.value,
                        idVal = mainInput.value;
                    if(selectVal != idVal){
                        selectItem.value = idVal;
                    }
                });
            }
            qtySticky.addEventListener('change', function() {
                qtyMain.value = qtySticky.value;
            })
            qtyMain.addEventListener('change', function() {
                qtySticky.value = qtyMain.value;
            })
            self.querySelector('.sticky_atc_js').addEventListener('click', function (e) {
                var buttonCart =  this;
                buttonCart.classList.add('loading');
                qtyMain.value = qtySticky.value;
                /* This will pass file upload or custom field */
                mainAddtoCart.click();
                setTimeout(function(){
                    buttonCart.classList.remove('loading');
                }, 500)  
            });
        }

    });
}
/* End sticky-addtocart.js */
 

/* tab-info.js */
if (!customElements.get("tab-info")) {
    class TabInfo extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.load();
        }
        getSibling(element) {
            let siblings = [];
            for (let sibling of element.parentNode.children) {
                if (sibling !== element) siblings.push(sibling);
            }
            return siblings;
        }
        load() {
            let self = this,
            tabNav = this.querySelector('.tab-nav');
            if(tabNav){
                tabNav.querySelectorAll('.tab-title').forEach(tab => {
                    tab.addEventListener('click', function(event) {
                        event.preventDefault();
                        let tabId = this.getAttribute('href'),
                            tabActive = this.closest('.tab'),
                            contentActive = self.querySelector(tabId);
                        tabActive.classList.add('active');
                        self.getSibling(tabActive).forEach(element => {
                            element.classList.remove("active");
                        });
                        contentActive.classList.add('active');
                        self.getSibling(contentActive).forEach(element => {
                            element.classList.remove("active");
                        });
                    })
                })
            }
        }
    }

    customElements.define("tab-info", TabInfo);
    customElements.define("product-information", class extends TabInfo { });
}
/* End tab-info.js */
 

/* translate-xy.js */
if (!customElements.get("translate-xy")) {
    customElements.define("translate-xy", class extends HTMLElement {
        constructor() {
            super();
            this.onMutation = this.onMutation.bind(this);
        }
        connectedCallback() {
            this.load();
            this.observer = new MutationObserver(this.onMutation);
            this.observer.observe(this, {
                childList: true,
                subtree: true
            });
        }
        disconnectedCallback() {
            this.observer.disconnect();
        }
        load() {
            let self = this,
                translatexy       = JSON.parse(self.dataset.translatexy) || {},
                translatexySort   = Object.keys(translatexy).sort().reverse().reduce((r, k) => (r[k] = translatexy[k], r), {});
            Object.entries(translatexySort).forEach(entry => {
                var originalStr  = entry[0],
                    translateStr = entry[1];
                var regex     = new RegExp(originalStr, 'g');
                var elements = self.getElementsByTagName('*');
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                
                    for (var j = 0; j < element.childNodes.length; j++) {
                        var node = element.childNodes[j];
                
                        if (node.nodeType === 3) {
                            var text = node.nodeValue;
                            var replacedText = text.replace(regex,translateStr);
                
                            if (replacedText !== text) {
                                element.replaceChild(document.createTextNode(replacedText), node);
                            }
                        }
                    }
                }
            });
        }
        onMutation(mutations) {
            this.load();
        }
    })
}
/* End translate-xy.js */
 

/* trigger-event.js */
if (!customElements.get("trigger-click")) {
    class TriggerEvent extends HTMLElement {
        constructor() {
            super();
            this.namespace = this.tagName.toLowerCase().replace('trigger-', '');
        }
        connectedCallback() {
            this.load()
        }

        load() {
            let self = this;
            this.addEventListener(this.namespace, function(event){
                document.querySelectorAll(self.dataset.target).forEach(element => {
                    /* cancelable support event.preventDefault */
                    element.dispatchEvent(new Event(self.namespace, {bubbles: true, cancelable: true}));
                })
            });
        }
    }
    customElements.define("trigger-click", TriggerEvent);
    customElements.define("trigger-something", class extends TriggerEvent { });
}
/* End trigger-event.js */
 

/* XHTMLElement.js */
if  (!customElements.get('x-htmlelement'))  {
    class XHTMLElement  extends HTMLElement {
        constructor() {
            super();
        }

        uniqid(length)  {
            length  = length  ||  10;
            var result  = "",
                characters  = "abcdefghijklmnopqrstuvwxyz0123456789",
                charactersLength  = characters.length;
            for (var  i = 0;  i < length; i++)  {
                result  +=  characters.charAt(Math.floor(Math.random()  * charactersLength));
            }
            return  result;
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
                        return (0, eval)('(' + value + ')');
                    } catch (e) {
                        return value;
                    }
                }
            });
        }

    }

    customElements.define("x-htmlelement",  XHTMLElement);
}
/* End XHTMLElement.js */
 

