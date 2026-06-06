/**
 * Module to add a shipping rates calculator to cart page.
 *
 * Copyright (c) 2011-2016 Caroline Schnapp (11heavens.com)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

// Adding utility function to Countries object defined in countries.js.
// Some countries use 'province' while others use 'state'.
if (typeof Countries === 'object') {
  Countries.updateProvinceLabel = function(country, provinceLabelElement) {
    if (typeof country === 'string' && Countries[country] && Countries[country].provinces) {
      if (typeof provinceLabelElement !== 'object') {
        provinceLabelElement = document.getElementById('address_province_label');
        
      }
      if (provinceLabelElement === null) return;
      provinceLabelElement.innerHTML = Countries[country].label;
      var provinceContainer = provinceLabelElement.parentElement;
      var provinceSelect = provinceContainer.querySelector('select');
      var selectBox = provinceContainer.querySelector('.custom-style-select-box-inner');
      if(selectBox) selectBox.innerHTML = Countries[country].provinces[0];
    }
  };
}

// Adding Shopify.Cart.ShippingCalculator object.
if (typeof Shopify.Cart === 'undefined') {
  Shopify.Cart = {}
}
// Creating a module to encapsulate this.
Shopify.Cart.ShippingCalculator = (function() {  
  var _config = {
    submitButton: 'Calculate shipping', 
    submitButtonDisabled: 'Calculating...',
    templateId: 'shipping-calculator-response-template',
    wrapperId: 'wrapper-response',
    customerIsLoggedIn: false,
    moneyFormat: '${{amount}}'
  },
  shippingCalculator = document.body.querySelector('shipping-calculator');  
  var _render = function(response) {
    var template = shippingCalculator.querySelector('#' + _config.templateId),
      wrapper = shippingCalculator.querySelector('#' + _config.wrapperId),
      address = address || response.address,
      rates = rates || response.rates,
      success = success || response.success;
    if (template && wrapper) {
      var myTemplate = template.textContent.trim();
      var compiled = eval('`' + myTemplate + '`');
      wrapper.innerHTML = `${wrapper.innerHTML} ${compiled}`;
      if (typeof Currency !== 'undefined' && typeof Currency.convertAll === 'function') {
        var newCurrency = '';
        if (document.querySelector('[name=currencies]')) {
          newCurrency = document.querySelector('[name=currencies]').value;
        }
        else if (document.querySelector('#currencies span.selected')) {
          newCurrency = document.querySelector('#currencies span.selected').getAttribute('data-currency');
        }
        if (newCurrency !== '') {
          Currency.convertAll(shopCurrency, newCurrency, '#wrapper-response span.money, #estimated-shipping span.money');
        }
      }
    }
  };  
  var _enableButtons = function() {
    var rates = shippingCalculator.querySelector('.get-rates');
    if(rates){
      rates.removeAttribute('disabled');
      rates.classList.remove('disabled');
      rates.value = _config.submitButton;
    }
  };
  var _disableButtons = function() {
    var rates = shippingCalculator.querySelector('.get-rates');
    if(rates){
      rates.value = _config.submitButtonDisabled;
      rates.setAttribute('disabled','disabled');
      rates.classList.add('disabled');
    }
  };
  var _getCartShippingRatesForDestination = function(shippingAddress) {
      fetch('/cart/prepare_shipping_rates', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({'shipping_address': shippingAddress}),
      }).then((response) => response.json())
        .then(response => {
            _pollForCartShippingRatesForDestination(shippingAddress)
      }).catch(err => {
          console.log(err);
          _onError               
      });
  };
  var _pollForCartShippingRatesForDestination = function(shippingAddress) {
    var poller = function() {
      fetch('/cart/async_shipping_rates').then((response) => {
        if (response.status !== 200) {
            setTimeout(poller, 500);
        }
        return response.json();
        }).then(response => {
            _onCartShippingRatesUpdate(response.shipping_rates, shippingAddress)
        }).catch(err => {
            console.log(err);
            _onError               
        });

    }
    return poller();
  };
  var _fullMessagesFromErrors = function(errors) {
    var fullMessages = [];
    Array.from(errors).forEach(function(messages, attribute) {
      Array.from(messages).forEach(function(message, index) {
        fullMessages.push(attribute + ' ' + message);
      });
    });
    return fullMessages;
  };
  var _onError = function(XMLHttpRequest, textStatus) {
    let estimatedShipping = shippingCalculator.querySelector('#estimated-shipping');
    if(estimatedShipping){
        estimatedShipping.style.display = 'none'
        estimatedShipping.querySelector('em').innerHTML = '';
    }
    // Re-enable calculate shipping buttons.
    _enableButtons();
    // Formatting error message.
    var feedback = '';
    var data = eval('(' + XMLHttpRequest.responseText + ')');
    if (!!data.message) {
      feedback = data.message + '(' + data.status  + '): ' + data.description;
    } 
    else {
      feedback = 'Error : ' + _fullMessagesFromErrors(data).join('; ') + '.';
    }    
    if (feedback === 'Error : country is not supported.') feedback = 'We do not ship to this destination.';
    // Update calculator.
    _render( { rates: [], errorFeedback: feedback, success: false } );
    shippingCalculator.querySelector('#' + _config.wrapperId).style.display = 'block';
  };  
  var _onCartShippingRatesUpdate = function(rates, shipping_address) {
    // Re-enable calculate shipping buttons.
    _enableButtons();
    // Formatting shipping address.
    var readable_address = '';
    if (shipping_address.zip) readable_address += shipping_address.zip + ', ';
    if (shipping_address.province) readable_address += shipping_address.province + ', ';
    readable_address += shipping_address.country;
    // Show estimated shipping.
    estimatedShipping = shippingCalculator.querySelector('#estimated-shipping em');
    if (estimatedShipping && rates.length) {
      if (rates[0].price == '0.00') {
          estimatedShippin.innerHTML = 'FREE';
      }
      else {
          estimatedShippin.innerHTML = _formatRate(rates[0].price);
      }
      for (var i=0; i<rates.length; i++) {
        rates[i].price = _formatRate(rates[i].price);
      }
    }
    // Show rates and feedback.
    _render( { rates: rates, address: readable_address, success:true } );
    // Revealing response.
    shippingCalculator.querySelectorAll('#' + _config.wrapperId + ', #estimated-shipping').forEach(element =>{
        element.style.display = 'none';
    })
  };
  var _formatRate = function(cents) {
    if (typeof Shopify.formatMoney === 'function') {
      return Shopify.formatMoney(cents, _config.moneyFormat);
    }    
    if (typeof cents == 'string') { cents = cents.replace('.',''); }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = _config.moneyFormat;
    function defaultOption(opt, def) {
       return (typeof opt == 'undefined' ? def : opt);
    }
    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ',');
      decimal   = defaultOption(decimal, '.');
      if (isNaN(number) || number == null) { return 0; }
      number = (number/100.0).toFixed(precision);
      var parts   = number.split('.'),
          dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
          cents   = parts[1] ? (decimal + parts[1]) : '';
      return dollars + cents;
    }
    switch(formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }
    return formatString.replace(placeholderRegex, value);
  };
  _init = function() {
    // Initialize observer on shipping address.
    new Shopify.CountryProvinceSelector('address_country', 'address_province', { hideElement: 'address_province_container' } );
    // Updating province label.
    var 
    countriesSelect = shippingCalculator.querySelector('#address_country');
    var addressProvinceLabelEl = shippingCalculator.querySelector('#address_province_label');
    if (typeof Countries !== 'undefined') {
      Countries.updateProvinceLabel(countriesSelect.value,addressProvinceLabelEl);
      countriesSelect.addEventListener('change', function(event) {
        Countries.updateProvinceLabel(countriesSelect.value,addressProvinceLabelEl);
      });
    }
    // When either of the calculator buttons is clicked, get rates.
    shippingCalculator.querySelector('.get-rates').addEventListener('click', function(event) {
      // Disabling all buttons.
      _disableButtons();
      // Hiding response.
      let wrapper= shippingCalculator.querySelector('#' + _config.wrapperId);
      if(wrapper){
          wrapper.style.display = 'none';
          wrapper.innerHTML = '';
      }
      // Reading shipping address for submission.
      var shippingAddress = {};
      shippingAddress.zip = shippingCalculator.querySelector('#address_zip').value || '';
      shippingAddress.country = shippingCalculator.querySelector('#address_country').value || '';
      shippingAddress.province = shippingCalculator.querySelector('#address_province').value || '';
      _getCartShippingRatesForDestination(shippingAddress);
    });
    // We don't wait for customer to click if we know his/her address.
    if (_config.customerIsLoggedIn) {
      shippingCalculator.querySelector('.get-rates').click();
    }
  };
  return {
    show: function(params) {
      // Configuration
      params = params || {};
      // Merging with defaults.
      Object.assign(_config, params);
      // Action
      (function() {
        _init();
      })();
    },    
    getConfig: function() {
      return _config;
    },
    formatRate: function(cents) {
      return _formatRate(cents);
    }
  }  
})();