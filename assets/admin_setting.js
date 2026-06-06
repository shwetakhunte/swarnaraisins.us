var shopifySelector = '#shopify-section-';

document.addEventListener('shopify:section:load', function(event){
    var sectionId       = event.detail.sectionId,
        $shopifySection = document.querySelector(shopifySelector + sectionId);
    document.dispatchEvent(new Event('GridSliderUpdated'));
});

document.addEventListener('shopify:section:unload', function(event){
    var sectionId       = event.detail.sectionId,
        $shopifySection = document.querySelector(shopifySelector + sectionId);
    document.dispatchEvent(new Event('GridSliderUpdated'));
});

document.addEventListener('shopify:section:select', function(event) {
  var sectionId       = event.detail.sectionId,
      $shopifySection = document.querySelector(shopifySelector + sectionId);
  if ($shopifySection.classList.contains('sc-menu-mobile')) {
      document.body.classList.add('open_show', 'open_menu');
      var mobileMenu = document.querySelector('#mobile_menu');
      if(mobileMenu) mobileMenu.classList.add('active');
  }else if($shopifySection.classList.contains('sc-categories-mobile')){
      document.body.classList.add('open_show', 'open_menu');
      var mobileMenu = document.querySelector('#mobile_menu');
      if(mobileMenu) mobileMenu.classList.remove('active');
  }else if(typeof aloShopify !== 'undefined') {
      if($shopifySection.classList.contains('promotion-product-popup')){
          aloShopify.PromotionPopup(10);
      }else if($shopifySection.classList.contains('newsletter-popup')){
          aloShopify.NewsletterPopup(10);
      }
  }
});

document.addEventListener('shopify:section:deselect', function(event) {
  var sectionId  = event.detail.sectionId,
      $shopifySection = document.querySelector(shopifySelector + sectionId);
  if ($shopifySection.classList.contains('sc-menu-mobile') || $shopifySection.classList.contains('sc-categories-mobile')  ) {
      document.body.classList.remove('open_show', 'open_menu');
  }
});

document.addEventListener('shopify:block:select', function(event){
  var sectionId = event.detail.sectionId,
      blockId   = event.detail.blockId,
      $shopifySection = document.querySelector(shopifySelector + sectionId);

  if ($shopifySection.classList.contains('slideshow')) {
      var $laberBlock = document.querySelector('#laber_' + blockId),
          slide       = '',
          slideIndex  = -1;
      if(!$laberBlock) $laberBlock = document.querySelector('#b_' + blockId);
      if($laberBlock){
          slide = $laberBlock.closest(".swiper-slide");
          if(slide) slideIndex = slide.getAttribute('data-swiper-slide-index');
          var iSwiper = $shopifySection.querySelector('.swiper');
          if(iSwiper){
            var swiper = iSwiper.swiper;
            if(swiper) swiper.slideTo(parseInt(slideIndex));
          }
      }
  }
  if (sectionId == "vertical_menu" ) {
    var lazy_vertical_menu = document.querySelector('.lazy_vertical_menu'),
        html_vertical_menu = document.querySelector('#html_vertical_menu'),
        vertical_menu      = document.querySelector('.vertical_menu');
    if(lazy_vertical_menu && html_vertical_menu) html_vertical_menu.innerHTML = html_vertical_menu.innerHTML;
    if(vertical_menu) vertical_menu.classList.add('open_sub');
    
    if ($shopifySection.classList.contains('sp_header_mid')) {
        var blockJs = document.querySelector('#bkjs_'+blockId),
            item    = blockJs ? document.querySelector('.verticalmenu-item-has-children#item_' + blockJs.dataset.id) : document.querySelector('.verticalmenu-item-has-children#item_' + blockId);
        document.querySelectorAll('.sp_header_mid .verticalmenu-item').forEach((menu) => {
            menu.classList.remove('menu_item_hover');
        });
        item.classList.add('menu_item_hover');
    }
  }else if ($shopifySection.classList.contains('header_megamenu')) {   
        var blockJs = document.querySelector('#bkjs_'+blockId);
        var item = blockJs ? document.querySelector('.has-children#item_' + blockJs.dataset.id) : document.querySelector('.has-children#item_' + blockId);
        document.querySelectorAll('.header_megamenu .menu-item').forEach((menu) => {
            menu.classList.remove('menu_item_hover');
        });
        item.classList.add('menu_item_hover');
  }
});

document.addEventListener('shopify:block:deselect', function(event){
  var sectionId = event.detail.sectionId, 
      blockId   = event.detail.blockId,
      $shopifySection = document.querySelector(shopifySelector + sectionId);

  if (sectionId == "vertical_menu" ) {
    var vertical_menu = document.querySelector('.vertical_menu');
    if(vertical_menu) vertical_menu.classList.remove('open_sub');
    document.querySelectorAll('.sp_header_mid .verticalmenu-item').forEach((menu) => {
        menu.classList.remove('menu_item_hover');
    });
  }else if ($shopifySection.classList.contains('header_megamenu')) {
    document.querySelectorAll('.header_megamenu .menu-item').forEach((menu) => {
        menu.classList.remove('menu_item_hover');
    });
  }
});
