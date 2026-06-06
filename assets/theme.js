if (typeof AloReference === 'undefined') {
  var Shopify   = window.Shopify || {},
      Alothemes = window.Alothemes || {},
      theme     = window.theme || {},
      mobileScreen = 767,
      fetchConfig = window.fetchConfig || function(type) {
          type = type || 'json';
          return {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
          };
      };
}

var AloReference = (function Alo($){
    if(document.documentElement.classList.contains('theme-init')) return;
    document.documentElement.classList.add('theme-init');

    Alothemes.xLoader = function (classes) {
        classes = classes || 'start loading';
        document.body.addEventListener('startLoading', function(e) {
            classes.split(' ').forEach(classx => {
              document.documentElement.classList.add(classx);
            })
        });
        document.body.addEventListener('endLoading', function(e) {
            document.documentElement.classList.add('end');
            setTimeout(function(){
              classes.split(' ').forEach(classx => {
                document.documentElement.classList.remove(classx);
              });
              document.documentElement.classList.remove('end');
            }, 1000)
        });
    }();

    Alothemes.contentMode = function() {
      let mobileMedia = window.matchMedia(`(max-width: ${mobileScreen}px)`),
            mediaSwitch = (function fn(event) {
                if (event.matches) {
                  document.documentElement.classList.remove('contentDesktopMode');
                  document.documentElement.classList.add('contentMobileMode');
                  document.body.dispatchEvent(new Event('contentMobileMode'));
                } else {
                  document.documentElement.classList.remove('contentMobileMode');
                  document.documentElement.classList.add('contentDesktopMode');
                  document.body.dispatchEvent(new Event('contentDesktopMode'));
                }
                return fn;
            })(mobileMedia); 
      mobileMedia.addEventListener('change', event => {
        mediaSwitch(event)
      });
    }()
    
    Alothemes.getProductLazy = function (handle, template, classes) {
        template = template || 'pr_lazy_load';
        return '<div data-lazy-product-load class="productLazyload swiper-slide lazyload" data-include="' + Shopify.routes.root + 'products/' + handle + '/?view=' + template + '"></div>'
    };

    Alothemes.Header = function () {
      document.addEventListener("DOMContentLoaded", function() { 
        let predictiveSearch = document.querySelectorAll('predictive-search');
          predictiveSearch.forEach((element) => {
            let search = element.querySelector('input[name="q"]');
            if(search){
              search.addEventListener("focus", (event) => {
                  let header = element.querySelector('.predictive-search--header');
                  if(header){
                      header.classList.add('focus');
                      document.documentElement.classList.add('open-search');
                  }
              });
              search.addEventListener("blur", (event) => {
                  let relatedTarget = event.relatedTarget;
                  if(relatedTarget && relatedTarget.closest('predictive-search')){
                    let searchSuggestions = relatedTarget.closest('predictive-search');
                    document.body.addEventListener('click', function(e) {
                        if(e.target.matches('predictive-search') || !e.target.closest('predictive-search')){
                            search.dispatchEvent(new Event('blur'), {bubbles: true});
                        }
                    });
                    return
                  }
                  let header = element.querySelector('.predictive-search--header');
                  if(header){
                      setTimeout(function () { 
                          header.classList.remove('focus');
                          document.documentElement.classList.remove('open-search');
                      }, 100);
                  }
              });
            }
        });
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
            let percent = (status/(documentHeight - window.innerHeight))*100;
            document.documentElement.style.setProperty("--scroll", `${percent.toFixed(2)}%`);
          });
      });
    }();

    Alothemes.Sidebar = function () {
      document.addEventListener("DOMContentLoaded", function() {    
        document.body.onEvent('click', '.js-mobile-sidebar', function (e) {
            this.classList.toggle('active');
            document.documentElement.classList.toggle('open_show');
            document.documentElement.classList.toggle('open_sidebar');
        });
      });
    }();

    Alothemes.mainContent = function () {    
      /* Social Share copy link */
      document.body.onEvent('click', '.button-copy', function (e) {
          var copyWarp = this.closest('.copy-clipboard-warp'),
              html = copyWarp.querySelector('.copy-clipboard');
          html.select();
          html.setSelectionRange(0, 99999);
          document.execCommand("copy");
          copyWarp.querySelector('.copied-tooltip').classList.toggle('hidden');
      });
    }();
  
    Alothemes.Footer = function () {
      document.addEventListener("DOMContentLoaded", function() {
        /* footer mobile */
        document.body.onEvent('click', '.widget-title', function () {
          if(document.documentElement.classList.contains('contentDesktopMode')) return;
          this.parentElement.querySelector(".widget_footer").slideToggle(300);
          this.parentElement.classList.toggle('active');
        });
        document.body.querySelectorAll(':scope .coppy-right .content').forEach(coppyright => {
          coppyright.html(coppyright.html().replace("yyyy", new Date().getFullYear()));
        })
      });
    }();

    Object.assign(Alothemes, {
        init: function () {
            Alothemes.dynamicTitlte()
            Alothemes.sidePopup();
            Alothemes.ajaxCart();
            Alothemes.miniCart();
            Alothemes.editCart();
            Alothemes.mainCart();  
        },
        getRandomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        dynamicTitlte: function() {
            if(!window?.dynamicTitlte?.msg1 || !window.dynamicTitlte.msg1) return;
            var titleTag = document.querySelector('title');
            if(titleTag){
              var titleText =   titleTag.innerText,
                  iTimer;
              document.addEventListener("visibilitychange", ()=>{
                if(document.visibilityState === "visible"){
                  titleTag.innerText = titleText;
                  clearInterval(iTimer);
                }else{
                  var first = true;
                  iTimer = setInterval(function() {
                      if(first){
                          titleTag.innerText = window.dynamicTitlte.msg1;
                      }else{
                          titleTag.innerText = window.dynamicTitlte.msg2;
                      }
                      first = !first;
                  }, 1500)                    
                }
              })
            }
        },
        sidePopup: function () {
            let firstTime = true, 
                timeout;
            document.body.onEvent("click", ".push_side", function (e) {
                e.preventDefault();
                let self = this,
                    opened = !this.classList.toggle('active'),
                    sideId = this.dataset.id,
                    sideContent = document.body.querySelector(sideId);
                if(sideContent) sideContent.classList.toggle('act_opened');
                document.documentElement.classList.toggle('pside_opened');
                sideContent.addEventListener('click', function(e){
                    let target = e.target;
                    if (target.matches('.close_popup_ajax') || target.closest('.close_popup_ajax')) {
                        self.click();
                    }
                });
                if(!firstTime) return;
                firstTime = false;
                clearTimeout(timeout);
                timeout = setTimeout(function(){
                    sideContent.classList.toggle('open-recommendations');
                }, 2000);
            });
        },
        addItemToCart: function (buttonCart, form) {
            const formData = (form instanceof HTMLFormElement) ? new FormData(form) : {};
            document.body.dispatchEvent(new CustomEvent('beforeAjax:addToCart', {detail: {'form': formData}}));
            fetch(Shopify.routes.root + 'cart/add.js', {
                method: "POST",
                headers: {
                    "Accept": "application/javascript",
                    "X-Requested-With" : 'XMLHttpRequest'
                },
                body: formData,
            }).then((response) => response.json())
              .then((response) => {
                let buttonText = buttonCart.querySelector('.text');
                if(!buttonText) buttonText = buttonCart.querySelector('span');
                let originalText = buttonText.innerHTML;
                if (response.status) {
                  /* Fail */
                  console.log(response);
                  if(response.hasOwnProperty('description')){
                    alert(response.description);
                  }
                  buttonCart.setAttribute('disabled', 'disabled')
                  buttonCart.setAttribute('data-button-status', 'sold-out');
                  buttonCart.classList.add('sold_out')
                  buttonCart.querySelector('.text').innerHTML = window.ajaxcart.soldOut;
                }else{
                  buttonCart.classList.remove('loading');
                  buttonCart.classList.add('added');
                  buttonCart.querySelector('.text').innerHTML = window.ajaxcart.added;
                  buttonCart.removeAttribute("disabled");
                  buttonCart.style.setProperty('pointer-events', 'auto');
                  document.body.dispatchEvent(new CustomEvent('ajax:addToCart', {detail: {
                      'form': formData,
                      'response': response
                  }}));
                  let ajaxcartAfter = window.ajaxcart.ajaxcartAfter;
                  if(ajaxcartAfter == 'reload'){
                      location.reload();
                      return;
                  } else if(ajaxcartAfter && ajaxcartAfter != 'sidebar_cart'){
                      document.location.href = Shopify.routes.root + ajaxcartAfter;
                      return;
                  }
                  setTimeout(function () {
                      if(!buttonCart.hasAttribute('disabled')){
                          buttonCart.classList.remove('added');
                          buttonText.innerHTML = originalText;
                      }
                  }, 1000);
                  if(ajaxcartAfter == 'sidebar_cart'){      
                      let minicart = document.querySelector('.minicart .push_side');
                      if (minicart && !minicart.classList.contains('active')){
                           minicart.click();
                      }
                  }
                }
            }).catch(err => {
                console.log(err);
            }).finally(function() {
                buttonCart.classList.remove('loading');
            });                
        },
        ajaxCart: function () {
          if(!window.ajaxcart.enabled) return;
          let self = this;
          document.body.onEvent('click', '.add-to-cart', function (e) {
              e.preventDefault();
              if(this.classList.contains('loading')) return;
              var buttonCart = this,
                  form = buttonCart.closest('form'),
                  product = buttonCart.closest('.product-item'),
                  drawer = {
                        sections: 'minicart'
                  };
              this.classList.add('loading');
              if(!form){
                  form = product.querySelector('form');
                  if(!form){
                      form = document.createElement('form');
                      form.insertAdjacentHTML("beforeend", '<input type="hidden" name="utf8" value="✓"><input type="hidden" name="form_type" value="product" tabindex="0">');
                  }
              }
              if(!form.id && !form.variant_id){
                  form.insertAdjacentHTML("beforeend", '<input name="id" type="hidden" value="' + buttonCart.dataset.pid + '">');
              }
              if(!form.querySelector('[name="quantity"]')){
                  let quantity = product.querySelector('[name="quantity"]');
                  if(quantity) form.insertAdjacentHTML("beforeend", '<input name="quantity" type="hidden" value="' + quantity.value + '">');
              }
              if(document.body.classList.contains('template-product')){
                  var singleProduct = form.closest('#product-single');
                  if( singleProduct ){
                      if(window.ajaxcart.disableAutoSelect){
                          var options = singleProduct.querySelectorAll('.cms-option-item'),
                              optionActive = singleProduct.querySelectorAll('.cms-option-item .active');
                          if(options.length && !optionActive.length){
                              alert(window.ajaxcart.selectOptions);
                              buttonCart.classList.remove('loading');
                              return;
                          }
                      }
                      Object.assign(drawer, {
                          sections: 'cart-notification-product,cart-notification-button,cart-icon-bubble,minicart',
                          sections_url: window.location.pathname
                      });
                  }              
              }
              Object.keys(drawer).map(key => {
                  form.insertAdjacentHTML("beforeend", '<input name="' + key +'" type="hidden" value="' + drawer[key] + '">');
              });
            
              self.addItemToCart(buttonCart, form);
          });
          document.body.onEvent('click', ".js-remove-item", function (event) {
              event.preventDefault();
              let self = this,
                  querystring = this.getAttribute('href').split("?").pop(),
                  params = new URLSearchParams(querystring),
                  item = self.closest('.product-item');
              params = Object.fromEntries(params);
              Object.assign(params, {sections: 'minicart'})
              document.body.dispatchEvent(new Event('startLoading'));
              item.classList.add('loading');
              fetch(Shopify.routes.root + 'cart/change.js', {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(params),
              }).then((response) => response.json())
                .then(response => {
                    document.body.dispatchEvent(new Event('endLoading'));
                    if (response.description || response.errors) {
                      /* Fail */
                      // console.log(response);
                      // alert(response.description);
                      window.location.reload(); 
                    }
                    if(document.body.classList.contains('template-cart')){
                        item.remove();
                    }
                    document.body.dispatchEvent(new CustomEvent('ajax:deleteCart', {detail:{
                        'productId': self.dataset.id,
                        'response': response
                    }}));
              }).catch(err => {
                    console.log(err);
                    window.location.reload();                    
              });
          });
          document.body.onEvent('change', 'quantity-input input[name="updates[]"]', function (event) {
              event.preventDefault();
              let self = this,
                productId = this.dataset.quantityVariantId;
              if( !productId ) return;
              productId = isNaN(productId) ? productId.replace(/\D/g, '') : productId;
              var quantity  = self.value,
                  updateQty = document.querySelector(`#updates_${productId}`),
                  item  = self.closest('.each-item');
              if(updateQty) updateQty.value = quantity;
              document.body.dispatchEvent(new Event('startLoading'));
              if(item) item.classList.add('loading');
              fetch(Shopify.routes.root + 'cart/change', {
                  method: "POST",
                  headers: {
                      'Content-Type': 'application/json',
                      "Accept": "application/javascript",
                  },
                  body: JSON.stringify({
                    id: `${productId}`,
                    quantity: `${quantity}`,
                    sections: ['minicart'],
                    sections_url: window.location.pathname
                  })
                }).then((response) => {
                  return response.text();
                }).then((response) => {
                    response = JSON.parse(response);
                    if (response.description || response.errors) {
                      /* Fail */
                      console.log(response);
                      alert(response.description);
                    }else{
                      document.body.dispatchEvent(new CustomEvent('drawer:Minicart', {detail:{response: response}}));
                    }
              }).catch(err => {
                    console.log(err);
              }).finally(function() {
                  document.body.dispatchEvent(new Event('endLoading'));
                  if(item) item.classList.remove('loading');
              });
          });
        },
        miniCart: function () {
          let self = this;
          document.body.addEventListener("drawer:Minicart", function (event) {
             var minicart = document.body.querySelector('#js_cart_popup'),
                  data = event.detail || {};
              if(data.hasOwnProperty('response') && data.response.sections){
                var sections = data.response.sections;
                if(sections.hasOwnProperty('minicart') && sections.minicart){
                      let cart = new DOMParser().parseFromString(sections.minicart, 'text/html').querySelector(`.shopify-section`),
                        mainContent = cart.querySelector('#MainContent');
                      if(mainContent) cart = mainContent;
                      if(minicart) minicart.innerHTML = cart.innerHTML;
                      var data = cart.querySelector('#json-data-cart');
                      data = JSON.parse(data.innerHTML);
                      document.querySelectorAll(".js-total-price, .info-total .total").forEach(element => {
                          element.innerHTML = Shopify.formatMoney(data.total_price, theme.moneyFormat);
                      });
                      document.querySelectorAll(".info-subtotal .subtotal").forEach(element => {
                          element.innerHTML = Shopify.formatMoney(data.items_subtotal_price, theme.moneyFormat);
                      });
                      document.querySelectorAll(".js-cart-count").forEach(element => {
                          element.innerHTML = data.item_count;
                      });
                      self.updateFreeShipping(data);
                      document.body.dispatchEvent(new Event('contentUpdated'));
                }
              }
          });
          document.body.on('update:miniCart ajax:addToCart ajax:updateCart ajax:deleteCart', function (event) {
              var data = event.detail || {};
              if(data.hasOwnProperty('response') && data.response.sections){
                var sections = data.response.sections;
                if(sections.hasOwnProperty('minicart') && sections.minicart){
                    document.body.dispatchEvent(new CustomEvent('drawer:Minicart', {detail:data}));
                }
              }else{
                fetch(Shopify.routes.root + 'cart?view=minicart')
                    .then((response) => response.text())
                    .then((responseText) => {
                        document.body.dispatchEvent(new CustomEvent('drawer:Minicart', {
                        detail: {response: {sections : {minicart : responseText}}}
                      }));
                    }).catch(function(error) {
                        window.location.reload();
                    });
              }
          });
          window.addEventListener('pageshow', function (event) {
              if (event.persisted) {
                  document.body.dispatchEvent(new Event('update:miniCart'));
              }
          }, false);

          document.body.onEvent('click', '.clear-cart', function (e) {
              e.preventDefault();
              fetch(Shopify.routes.root + 'cart/clear.js', {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(params),
              }).then((response) => response.json())
                .then(response => {
                    location.reload();
              });
          });

        },
        mainCart: function() {
          if (!document.body.classList.contains('template-cart')) return;
          /* Discount */
          var saveTotal = (function fn() {
              var discount = 0;
              document.querySelectorAll('.discounts__discount').forEach(element => {
                  if ("discount" in element.dataset) {
                       discount += parseFloat(element.dataset.discount);
                  }
              });
              document.querySelectorAll('.alo-discount').forEach(element => {
                  if ("totalSave" in element.dataset) {
                      var qty = element.closest('.quantity-item').querySelector('.quantity__input').value;
                      discount += parseFloat(qty)*parseFloat(element.dataset.totalSave);
                  }
              });
              if(discount){
                  document.querySelectorAll('.total-discount').forEach(element => {
                      element.style.display = 'block';
                      let totalSave =element.querySelector('.total-save');
                      if(totalSave) totalSave.innerHTML = Shopify.formatMoney(discount, theme.moneyFormat);
                  });
              }
              return fn;
          }());
          document.body.on('ajax:addToCart ajax:updateCart ajax:deleteCart drawer:Minicart', function (e) {
              let data = e.detail.response,
                  cartTotal = document.body.querySelectorAll('.cart-total'),
                  shoppingCart = document.body.querySelector('.shopping-cart-content'),
                  items = data.items,
                  subtotal = Shopify.formatMoney(data.items_subtotal_price, theme.moneyFormat),
                  total = Shopify.formatMoney(data.total_price, theme.moneyFormat);
              cartTotal.forEach(element => {
                  element.querySelectorAll('.subtotal').forEach(el => {
                      el.innerHTML = subtotal;
                  })
              });
              cartTotal.forEach(element => {
                  element.querySelectorAll('.total').forEach(el => {
                      el.innerHTML = total;
                  })
              });
              if(shoppingCart && items){
                  items.forEach(item => {
                      var id = item.id;
                      var price = Shopify.formatMoney(item.final_line_price, theme.moneyFormat);
                      var element = shoppingCart.querySelector('#item-id-' + id);
                      if (element) {
                        element.querySelectorAll('.total').forEach(el => {
                            el.innerHTML = price;
                        })
                      }
                  });                    
              }
              saveTotal();
          });
          if(localStorage.getItem('storedDiscount')){
              document.body.querySelectorAll('[name="discount"]').forEach(discount => {
                  discount.value = localStorage.getItem('storedDiscount');
              })
          }
          
          /* Add to cart on page cart */
          document.body.addEventListener("ajax:addToCart", (event) => {
              let shoppingCart = document.querySelector('.shoppingcart-content');
              if(shoppingCart){
                  let mainSection = shoppingCart.closest('[id^="shopify-section"]'),
                    sectionId = mainSection.getAttribute('id').replace('shopify-section-', '');
                  fetch(`${window.routes.cart_url}?section_id=${sectionId}`)
                  .then((response) => response.text())
                  .then((responseText) => {
                      var html = new DOMParser().parseFromString(responseText, 'text/html'),
                          source = html.getElementById(`shopify-section-${sectionId}`),
                          destination = document.getElementById(`shopify-section-${sectionId}`);
                      if (source && destination) destination.innerHTML = source.innerHTML;
                      saveTotal();
                  });
              }
          });
        },
        editCart: function () {
          document.body.onEvent('click', '#js_cart_popup .edit-cart, .js_select_options', function (event) {
              event.preventDefault();
              let self = this,
                  url  = this.getAttribute('href');
                  item = this.closest('.product-item'),
                  dialogModal = document.createElement('dialog-modal');
              this.classList.add('loading');
              item.classList.add('loading');
              url +=  url.includes('?') ? '&view=ajax-edit-cart': '?view=ajax-edit-cart';
              dialogModal.addEventListener('open', (e) => {
                  self.classList.remove('loading');
                  item.classList.remove('loading');
                  document.body.dispatchEvent(new Event('endLoading'));
                  document.documentElement.classList.add('open-edit-cart');
                  // Shopify.PaymentButton.init();
              },{once : true});
              dialogModal.addEventListener('close', (e) => {
                  document.documentElement.classList.remove('open-edit-cart');
              },{once : true});
              fetch(`${url}`)
              .then((response) => response.text())
              .then((responseText) => {
                let product = new DOMParser().parseFromString(responseText, 'text/html').querySelector('#product-quick-edit-cart');
                dialogModal.innerHTML = `<dialog data-autoplay modal-mode="mega" data-destroy="true" id="quick-editcart-modal" class="cms-popup-quickedit" >${product.outerHTML}</dialog>`;
                document.body.appendChild(dialogModal);
                let addCart = dialogModal.querySelector('.add-to-cart'),
                    productId = addCart.dataset.pid,
                    qty = item.querySelector('input[name="updates[]"]');
                  qty = (qty && qty.value) ? qty.value : qty = 1;
                  dialogModal.querySelector('input[name="quantity"]').value = qty;
                  dialogModal.querySelectorAll('.js_edit_cart_button').forEach(element => {
                      element.addEventListener('click', function(event){
                          element.classList.add('loading');
                          let action = self.matches('.edit-cart') ?  'change.js' : 'add.js';
                          fetch(`${Shopify.routes.root}cart/${action}`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({id: `${productId}`, quantity: 0}),
                          }).then((response) => response.json())
                            .then(response => {
                                addCart.dataset.pid = dialogModal.querySelector('[name="id"]').value;
                                addCart.click();
                                element.classList.remove('loading');
                                document.body.addEventListener("ajax:addToCart", (event) => {
                                    dialogModal.destroy();
                                })
                          }).catch(err => {
                                console.log(err);
                          });
                                             
                      })
                  })
            });
          });
        },
        updateFreeShipping: function(data) {
            document.querySelectorAll('.js-free-shipping').forEach(freeShipping => {
              var progressBar = freeShipping.querySelector('[data-js-progress]'),
                    massageTpl = freeShipping.querySelector('.message-tpl'),
                    massage = freeShipping.querySelector('[data-js-text]'),
                    spendHtml = massageTpl.querySelector('.spend_html').innerHTML,
                    freeHtml  = massageTpl.querySelector('.free_html').innerHTML,
                    shippingCheckout = document.querySelectorAll('.template-cart .shipping_at_checkout'),
                    shippingNote = document.querySelectorAll('.template-cart .cart__shipping_note'),
                    value = freeShipping.dataset.value,
                    total = data.total_price,
                    procent = Math.min(total / (value / 100), 100),
                    money = Math.max(value - total, 0),
                    spend = Shopify.formatMoney(money, theme.moneyFormat);
                    spendHtml = eval('`'+ spendHtml +'`');
                if (money > 0) {
                    massage.innerHTML = spendHtml;
                    shippingCheckout.forEach(element => {
                        element.classList.add('hidden');
                    });
                    shippingNote.forEach(element => {
                        element.classList.remove('hidden');
                    });
                } else {
                    massage.innerHTML = freeHtml;
                    shippingCheckout.forEach(element => {
                        element.classList.remove('hidden');
                    });
                    shippingNote.forEach(element => {
                        element.classList.add('hidden');
                    });
                }
                if(procent > 0){
                  freeShipping.classList.add('forward');
                }else{
                   freeShipping.classList.remove('forward');
                }
                if(procent == 100){
                  freeShipping.classList.add('congratulations');
                }else{
                   freeShipping.classList.remove('congratulations');
                }
                progressBar.style.width = `${procent}%`;                  
            });
        }
     });
    Alothemes.init();
    class Megamenu {
  
        constructor(){
            if (!localStorage.getItem("touchstart") && window.matchMedia('(max-width: 768px)').matches && window.matchMedia("(pointer: coarse)").matches) {
                document.body.addEventListener("touchstart", (event) => {
                    localStorage.setItem("touchstart", true);
                    this.sticky(document.body.querySelectorAll('.header-fixed, .header-top, .navigationMenu'));
                    this.verticalMenu();
                }, {once : true});
            } else {
                this.sticky(document.body.querySelectorAll('.header-fixed, .header-top, .navigationMenu'));
                this.verticalMenu();
            }
            this.mobileMenu();
        }
        sticky(sticky) {
            if(!sticky.length) return;
            var stickyTop = sticky[0].offsetTop,
                header = document.querySelector("header"),
                stickyHeight = sticky[0].offsetHeight,
                stickyPostion = stickyTop + stickyHeight;
            window.addEventListener("scroll", (event) => {
                let scrollY = window.scrollY;
                if(scrollY > stickyPostion){
                    sticky.forEach(element => {
                        element.classList.add('sticky', 'sticky-header')
                    })
                }else{
                    sticky.forEach(element => {
                        element.classList.remove('sticky', 'sticky-header')
                    })                             
                }
                header.style.setProperty('min-height', stickyHeight);
            });
        }              
        verticalMenu() {
            var state = false;
            document.body.onEvent('click',' .vertical_menu .title_vertical_menu.click',function(){
                 state = !state; /* toggle */
                 var layer = this.closest('.vertical_menu');
                 layer.classList.toggle('active');
                 document.documentElement.classList.toggle('open_show');
                if(state){
                    document.documentElement.classList.add('open_show');
                }else {
                    document.documentElement.classList.remove('open_show');
                }
            });
        }

        mobileMenu() {
           document.body.onEvent('click', '.js-mobile-menu', function (e) {
                this.classList.toggle('active');
                document.documentElement.classList.toggle('open_show');
                document.documentElement.classList.toggle('open_menu');
            });
            document.body.onEvent('click', '.header-menu-mobile .tablinks', function () {
                let tab = this,
                  id = this.dataset.electronic;
                tab.classList.add('active');
                for (let sibling of tab.parentNode.children) {
                    if (sibling !== tab) sibling.classList.remove('active')
                }
                var content = this.closest('.js-menu-mobile-content');
                if(content){
                    let contentActive = content.querySelector(`#${id}`);
                    if(contentActive){
                        contentActive.classList.add('active');
                        for (let sibling of contentActive.parentNode.children) {
                            if (sibling !== contentActive) sibling.classList.remove('active')
                        }
                    }
                }
            });
        }
    }
    new Megamenu();
}());
