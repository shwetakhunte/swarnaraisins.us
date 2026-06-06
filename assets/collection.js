var CollectionReference = (function Alo(){
    "use strict";
    var Shopify   = window.Shopify || {},
        Alothemes = window.Alothemes || {},
        theme     = window.theme || {},
        jsvendor  = document.querySelector('#jsvendor'),
        mobileScreen = window.mobileScreen || 768;
    class Collection {
        constructor() {
            this.priceSlider();
            this.renderLayout();
        }
        priceSlider() {
            if(!jsvendor.dataset.nouislider) return;
            $script([jsvendor.dataset.nouislider], function () {
                document.body.on('contentUpdated filterUpdated', function(event){
                    var priceRange = document.querySelectorAll("price-range");
                    if(!priceRange.length) return;
                    var style = document.createElement('link');
                        style.rel  = 'stylesheet';
                        style.type = 'text/css';
                        style.href = jsvendor.dataset.nouisliderStyle;
                        style.media = 'all';
                        document.head.appendChild(style);
                    priceRange.forEach(function (element) {
                        if(element.classList.contains('price-slider-init')){
                            return;
                        }
                        element.classList.add('price-slider-init');
                        var $min = element.querySelector('[name="filter.v.price.gte"]'),
                            $max = element.querySelector('[name="filter.v.price.lte"]'),
                            min = parseInt($min.getAttribute('min')),
                            max = parseInt($max.getAttribute('max')),
                            minStart = ($min.value !== '') ? parseInt($min.value) : min,
                            maxStart = ($max.value !== '') ? parseInt($max.value) : max,
                            step = parseFloat($max.getAttribute('step')),
                            divSlider = document.createElement('div');
                        divSlider.setAttribute('id', 'price-slider');
                        element.parentNode.insertBefore(divSlider, element);
                        var priceSlider = element.parentNode.querySelector('#price-slider'),
                            direction = document.body.classList.contains('rtl') ? 'rtl' : 'ltr';
                        noUiSlider.create(priceSlider, {
                            start: [minStart, maxStart],
                            step: isNaN(step) ? 1 : step,
                            connect: true,
                            direction: direction,
                            range: {
                              'min': min,
                              'max': max
                            }
                        });
                        priceSlider.noUiSlider.on('change', function (values, handle) {
                            if (handle) {
                                $max.value = parseFloat(values[handle]).toFixed();
                                $max.dispatchEvent(new Event('input', { bubbles: true }));
                            }else {
                                $min.value = parseFloat(values[handle]).toFixed();
                                $min.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        });
                        $min.addEventListener('input', function (e) {
                            priceSlider.noUiSlider.set([this.value, null]);
                        });
                        $max.addEventListener('input', function (e) {
                            priceSlider.noUiSlider.set([null, this.value]);
                        });
                    });
                });
                document.body.dispatchEvent(new Event('contentUpdated', {bubbles: true}));
                document.querySelectorAll('#FacetFiltersForm, #FacetFiltersFormMobile, #FacetFiltersPillsForm, #CollectionFiltersForm').forEach((facetFilters) => {
                    let observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                            /* bubbles: true will help document.on work */
                            document.body.dispatchEvent(new Event('filterUpdated', {bubbles: true}));
                        })
                    });
                    observer.observe(facetFilters, {childList: true, subtree: true});
                });
            });
        }
        renderLayout() {
            let mainContentGrid = document.body.querySelector('.main-content-grid'),
            productGrid = mainContentGrid.querySelector('#ProductGridContainer'),
            buttonView = mainContentGrid.querySelectorAll('.js_cat_view'),
            layout = new URLSearchParams(window.location.search).get('layout') || Cookies.get('category_product_layout'),
            classList = "grid-2-style grid-3-style grid-4-style grid-5-style grid-style list-style";
            function changeView() {
                classList.split(' ').forEach(classes => {
                     productGrid.classList.remove(classes);
                });
                Cookies.set('category_product_layout', layout);
                let classLayout = layout.split(' ');
                classLayout.forEach(classes => {
                    productGrid.classList.add(classes);
                });
                if(classLayout.includes('list-style') || classLayout.includes('list')){
                    productGrid.classList.add('list-style');
                    productGrid.classList.remove('grid-style');
                }else{
                    productGrid.classList.add('grid-style');
                    productGrid.classList.remove('list-style');
                }
                buttonView.forEach(element => {
                    if (element.classList.contains(layout.replace('style', 'button'))) {
                        element.classList.add('active');
                    }else{
                        element.classList.remove('active');
                    }                
                });
            }
            if (layout) {
                changeView()
            }
            mainContentGrid.onEvent('click', '.js_cat_view', function(event) {
                event.preventDefault();
                let _self = this,
                    col = _self.dataset.col,
                    control = _self.closest('.control-button');
    
                control.querySelectorAll('a').forEach(element => {
                    element.classList.remove('active');
                });
                _self.classList.add('active');
    
                if (col == 2) {
                    layout = 'grid-2-style';
                } else if (col == 3) {
                    layout = 'grid-3-style';
                } else if (col == 4) {
                    layout = 'grid-4-style';
                } else if (col == 5) {
                    layout = 'grid-5-style';  
                } else {
                    layout = _self.classList.contains('list-button') ? 'list-style' : 'grid-style';
                }
              
                changeView();
    
                mainContentGrid.onEvent('click', '.filter-title', function (e) {
                    this.classList.toggle('active');
                    mainContentGrid.querySelectorAll('.js_filter.sidebar-top').forEach(element => {
                        element.slideToggle();
                        element.classList('active');
                    });
                });
        
                document.body.onEvent('click', '.top-sidebar.style2 .layer-filter .name', function (event) {
                    let layer = this.closest('.layer-navigation');
                    if(layer){
                        layer.classList.toggle('active');
                        layer.getSiblings().forEach(element => {
                            element.classList.remove('active');
                        });
                    }
                });
        
                document.body.onEvent('click', function (event) {
                    let target = event.target,
                        parentTarget = target.parentElement;
                    if (!target.matches('.top-sidebar.style2 .layer-navigation') && !parentTarget.matches('.top-sidebar.style2 .layer-navigation')) {
                        document.body('.top-sidebar.style2 .layer-navigation').forEach(element => {
                            element.classList.remove('active');
                        });
                    }
                });
            });
        }
        
    }
    new Collection();
}());