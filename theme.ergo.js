/*
This is the erg-simple theme config for ergo cms. See online for more options
*/

module.exports = {
	name: "Ergo Portfolio Theme",
	url: "https://github.com/ergo-cms/theme-ergo-portfolio",
	asset_paths: ['styles.css','favicon.ico','js','images','flaticon', 'slick'],
	default_fields: {
		author_url: '/#content',
		tags_url: '/tags.html',
		categories_url: '/categories.html',
		feed_url: '/rss.xml',

		// gracefully accept paginate plugin support
		auto_paginate: function(list, params, list_name) { 
			if (!!this.paginate) 
				return this.paginate.call(this, list, params, list_name);
			else
				return list; // do nothing, if paginate not available
		},

		// gracefully support thumbnail plugin for srcset & thumb filters
		safe_srcset: function(image_name, params, data_name) {
			if (!!this.srcset)
				return this.srcset.call(this, image_name, params, data_name);
			return '';
		},
		safe_thumb: function(image_name, params, data_name) {
			if (!!this.thumb)
				return this.thumb.call(this, image_name, params, data_name);
			return image_name;
		},

/*
from: http://css3.bradshawenterprises.com/cfimg/;

For "n" images You must define:
a=presentation time for one image
b=duration for cross fading
Total animation-duration is of course t=(a+b)*n

animation-delay = t/n or = a+b

Percentage for keyframes:

    0%
    a/t*100%
    (a+b)/t*100% = 1/n*100%
    100%-(b/t*100%)
    100%

 this: a=3000 b=500 n=3
 ∴ t = 3500*3 = 10500
 */
 		// css animation funcs
		slider_style_block: function(list, params) {
			var n = list.length;
			var selector = params.css_selector;
			if (!selector) throw new Error("Missing css_selector param for slider animation")
			var a = parseInt(params.showtime || this.slider_showtime) || 5000;
			var b = parseInt(params.fadetime || this.slider_fadetime) || 800;
			var t = (a+b)*n;
			var ad = a+b; // ms
			var animName = "_"+_hashCode.call(selector);
			var str = [];
			// part 1. the keyframes
			str.push("@keyframes "+animName+" { ");
			str.push("0% { opacity:1; }")
			str.push(_pct(a/t) + " { opacity:1; }")
			str.push(_pct(1/n) + " { opacity:0; }")
			str.push(_pct(1-(b/t)) + " { opacity:0; }")
			str.push("100% { opacity:1; }")
			str.push("}\n")

			// part 2. the selector root
			str.push(selector + " { animation-duration: " + t + "ms; animation-name: " + animName + "; }");

			// part 3. the delays
			for (var i=0; i<n; i++) {
				str.push(selector + ":nth-of-type(" + (i+1) + ") { animation-delay: "+ parseInt((n-(i+1))*ad) +"ms; }");
			}
			// done
			return str.join('\n')
		},

		reverse: function(list) {
			return list.slice(0,list.length).reverse();
		},

		image: function() {
			// an image fallback function. gets the first image from the 'images' list
			var ar = this.split(this.images)
			if (ar && ar.length)
				return ar[0];
			return '';
		},

		images: function() {
			// fallback to image if images not defined
			if (typeof this.image == 'function')
				return 'noimages.jpg'; // don't get recursive!
			return this.image + ','+this.image+','+this.image;
		}
	}
};

function _round(n) {
	return parseInt(n*10000)/10000 // round to 4 dec places
}
function _pct(n) {
	return _round(n*100)+"%" // convert to 0-100 range
}
function _hashCode() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash >>>= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
};

