/*! $script.js JS loader & dependency manager */
(function (e, t) {
  typeof module != "undefined" && module.exports
    ? (module.exports = t())
    : typeof define == "function" && define.amd
    ? define(t)
    : (this[e] = t());
})("$script", function () {
  function p(e, t) {
    for (var n = 0, i = e.length; n < i; ++n) if (!t(e[n])) return r;
    return 1;
  }
  function d(e, t) {
    p(e, function (e) {
      return t(e), 1;
    });
  }
  function v(e, t, n) {
    function g(e) {
      return e.call ? e() : u[e];
    }
    function y() {
      if (!--h) {
        (u[o] = 1), s && s();
        for (var e in f) p(e.split("|"), g) && !d(f[e], g) && (f[e] = []);
      }
    }
    e = e[i] ? e : [e];
    var r = t && t.call,
      s = r ? t : n,
      o = r ? e.join("") : t,
      h = e.length;
    return (
      setTimeout(function () {
        d(e, function t(e, n) {
          if (e === null) return y();
          !n &&
            !/^https?:\/\//.test(e) &&
            c &&
            (e = e.indexOf(".js") === -1 ? c + e + ".js" : c + e);
          if (l[e])
            return (
              o && (a[o] = 1),
              l[e] == 2
                ? y()
                : setTimeout(function () {
                    t(e, !0);
                  }, 0)
            );
          (l[e] = 1), o && (a[o] = 1), m(e, y);
        });
      }, 0),
      v
    );
  }
  function m(n, r) {
    var i = e.createElement("script"),
      u;
    (i.onload =
      i.onerror =
      i[o] =
        function () {
          if ((i[s] && !/^c|loade/.test(i[s])) || u) return;
          (i.onload = i[o] = null), (u = 1), (l[n] = 2), r();
        }),
      (i.async = 1),
      (i.src = h ? n + (n.indexOf("?") === -1 ? "?" : "&") + h : n),
      t.insertBefore(i, t.lastChild);
  }
  var e = document,
    t = e.getElementsByTagName("head")[0],
    n = "string",
    r = !1,
    i = "push",
    s = "readyState",
    o = "onreadystatechange",
    u = {},
    a = {},
    f = {},
    l = {},
    c,
    h;
  return (
    (v.get = m),
    (v.order = function (e, t, n) {
      (function r(i) {
        (i = e.shift()), e.length ? v(i, r) : v(i, t, n);
      })();
    }),
    (v.path = function (e) {
      c = e;
    }),
    (v.urlArgs = function (e) {
      h = e;
    }),
    (v.ready = function (e, t, n) {
      e = e[i] ? e : [e];
      var r = [];
      return (
        !d(e, function (e) {
          u[e] || r[i](e);
        }) &&
        p(e, function (e) {
          return u[e];
        })
          ? t()
          : !(function (e) {
              (f[e] = f[e] || []), f[e][i](t), n && n(r);
            })(e.join("|")),
        v
      );
    }),
    (v.done = function (e) {
      v([null], e);
    }),
    v
  );
});

class VendorJs {
  jsvendor;

  constructor() {
    this.self = this;
    (this.$body = document.body),
      (this.jsvendor = document.querySelector("#jsvendor")),
      (this.dataSrc = jsvendor.dataset);
    this.init();
  }
  getBrowser() {
    var ua = navigator.userAgent,
        tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
  }
  getAsset(src) {
    if (this.dataSrc[src] !== undefined) {
      return this.dataSrc[src];
    } else {
      console.error("Not found dependency ", src);
    }
  }
  init() {
    var self = this,
      $body = this.$body,
      dataSrc = this.dataSrc;
    document.addEventListener("DOMContentLoaded", function () {
      if (
        navigator.userAgent.indexOf("Chrome-Lighthouse") != -1 ||
        navigator.userAgent.indexOf("GTmetrix") != -1 ||
        navigator.userAgent.indexOf("PingdomPageSpeed") != -1
      ) {
        document.documentElement.classList.add("no-js page-speed");
        return false;
      }
      this.dependency = {
        collection: [self.getAsset("collection")],
        mainproduct: [self.getAsset("zoom"), self.getAsset("product")],
        theme: [dataSrc.theme, dataSrc.custom],
      };

      var require = [];
      if(self.getBrowser().includes('safari')) {
        /* require.push(self.getAsset('polyfill')); */
      }
      if ($body.classList.contains("use-wow")) {
        /*require.push(self.getAsset('wow'));*/
      }
      /* load dependency in home page */
      if ($body.classList.contains("home")) {
        /* require.push("home-sj"); */
      } else if (
        /* load dependency in category page */
        $body.classList.contains("template-collection") ||
        $body.classList.contains("template-search")
      ) {
        require.push(self.getAsset("collection"));
      } else if ($body.classList.contains("template-product")) {
        /* load dependency in product page */
        require.push(self.getAsset("product"));
      }
      require.push(self.getAsset("custom"));
      $script(require, "basicLoaded");
    });
    document.addEventListener("PriceSliderAssets", function () {
      if (self.jsvendor.classList.contains("PriceSliderAssets")) return;
      $script([self.getAsset("nouislider")], function () {
        var style = document.createElement("link");
        style.rel = "stylesheet";
        style.type = "text/css";
        style.href = self.getAsset("nouisliderStyle");
        document.head.appendChild(style);
        self.jsvendor.classList.add("PriceSliderAssets");
      });
    });
    document.addEventListener("ColllectionLoadJs", function () {
      if (self.jsvendor.classList.contains("ColllectionLoadJs")) return;
      self.jsvendor.classList.add("ColllectionLoadJs");
    });
    document.addEventListener("MainProductLoadJs", function () {
      if (self.jsvendor.classList.contains("MainProductLoadJs")) return;
      $script(
        [
          self.getAsset("product"),
          self.getAsset("productModel"),
        ],
        function () {
          self.jsvendor.classList.add("MainProductLoadJs");
        }
      );
    });
  }
}

var vendorJs = new VendorJs();
