/*
* @Author: Alex Dong
* @Date:   2022-06-07 18:34:09
* @Last Modified by:   Alex Dong
* @Last Modified time: 2024-09-16 18:35:15
*/
/* Custom code js for your theme here */

/* Example custom before change option variant: */
/*
document.body.addEventListener('beforeVariantUpdated', function (event) {
    console.log('beforeVariantUpdated');
});
/*

/* Example custom after change option variant: */
/*
document.body.addEventListener('afterVariantUpdated', function (event) {
    var variant = event.detail;
    console.log(variant);
    console.log('Variant id: ' + variant.id);
    console.log('Variant Price: ' + variant.price);
    console.log('Variant Sku: ' + variant.sku);
});
*/

/* Example custom after ajax add to cart : */
/*
document.body.addEventListener('ajax:addToCart', function (event) {
    var data = event.detail;
    console.log(data.form);
    console.log(data.response);
    /* yampiClick(); /*
});
*/