var app = getApp();
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapwx;

Page ({
  data: {
    address       : '',
    focus         : [],

    autoplay      : true,
    indicatorDots : true,
    interval      : 5000,
    duration      : 1000,
    distance      : 0,
    productData   : [],
    proCat        : [],
    page          : 2,
    brand         : [],
    message       : '',

    time          : 0,
    order_msg     : '',

    marquee       : 0,    //每次移动X坐标
    windowWidth   : 0,    //小程序宽度
    maxScroll     : 0     //文本移动至最左侧宽度及文本宽度
  },

  onLoad: function (options) {
    var that = this;

    qqmapwx = new QQMapWX({
      key: 'KSSBZ-LL66X-7LV4Z-77M4Z-USSIS-H6FXT'
    });

    var latitude = options.latitude;
    var longitude = options.longitude;
    var address = options.address;

    if (!latitude || !longitude) {
      wx.getLocation({
        type: 'gcj02',

        success: function(res) {
          // console.log(res);

          latitude = res.latitude;
          longitude = res.longitude;

          that.setDistance(latitude, longitude);
          that.setAddress(latitude, longitude, address);
        },

        fail: function() {
        },

        complete: function() {
        }
      });
    } else {
      that.setDistance(latitude, longitude);
      that.setAddress(latitude, longitude, address);
    }

    wx.request({
      url   : app.d.apiUrl + 'Index/index',
      method: 'post',
      data  : {},
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },

      success: function (res) {
      //  console.log(res)
        var focus = res.data.focus;
        var procat = res.data.procat;
        var prolist = res.data.prolist;
        var brand = res.data.brand;
        var message = res.data.messages.join(' ');

        that.setData({
          focus       : focus,
          proCat      : procat,
          productData : prolist,
          brand       : brand,
          message     : message
        });
      },

      fail:function(e){
        wx.showToast({
          title   : '网络异常！',
          duration: 2000
        });
      },
    })

    var w = wx.getSystemInfoSync().windowWidth;

    that.setData({
      marquee: w
    });

    that.data.maxScroll = that.data.message.length * 15 + 4;
    that.data.windowWidth = w;
    that.scrolltxt();
  },

  onShareAppMessage: function() {
    return {
      title : '送菜娃商城',
      path  : '/pages/index/index',

      success: function(res) {
      },

      fail: function(res) {
      }
    }
  },

  doSearch: function() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },

  doAddressSearch: function() {
    wx.navigateTo({
      url: '/pages/addr_search/addr_search',
    })
  },

  // 跳转商品列表页
  listdetail: function (e) {
    console.log(e.currentTarget.dataset.title)

    wx.navigateTo({
      url: '/pages/listdetail/listdetail?title='+e.currentTarget.dataset.title,

      success: function(res) {
      },

      fail: function() {
      },

      complete: function() {
      }
    })
  },

  // 点击加载更多
  getMore: function (e) {
    var that = this;
    var page = that.data.page;

    wx.request({
      url   : app.d.apiUrl + 'Index/getlist',
      method: 'post',
      data  : {
        page: page
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },

      success: function(res) {
        var prolist = res.data.prolist;

        if (prolist=='') {
          wx.showToast({
            title   : '没有更多数据！',
            duration: 2000
          });

          return false;
        }

        that.setData({
          page        : page+1,
          productData : that.data.productData.concat(prolist)
        });
      },

      fail: function(e) {
        wx.showToast({
          title   : '网络异常！',
          duration: 2000
        });
      }
    })
  },

  changeAutoplay: function(e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },

  changeIndicatorDots: function(e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },

  durationChange: function(e) {
    this.setData({
      duration: e.detail.value
    })
  },

  intervalChange: function(e) {
    this.setData({
      interval: e.detail.value
    })
  },

  setDistance: function(latitude, longitude) {
    var that = this;

    // 杨陵区政府 {lat: 34.27221, lng: 108.08455}
    qqmapwx.calculateDistance({
      from  : {
        latitude  : latitude,
        longitude : longitude
      },
      to    : [{
        latitude  : 34.27221,
        longitude : 108.08455
      }],

      success: function(res) {
        //console.log(res);

        that.setData({
          distance  : res.result.elements[0].distance
        });
      },

      fail: function(res) {
        console.log(res);
      },

      complete: function(res) {
       // console.log(res);
      }
    });
  },

  setAddress: function(latitude, longitude, address) {
    var that = this;

    qqmapwx.reverseGeocoder({
      location: {
        latitude  : latitude,
        longitude : longitude
      },

      success: function(res) {
        //console.log(res);

        app.globalData.province = res.result.address_component.province;
        app.globalData.city = res.result.address_component.city;

        if (!address) {
          address = res.result.address_reference.landmark_l2.title
        }

        that.setData({address: address});
      },

      fail: function(res) {
        console.log(res);
      },

      complete: function(res) {
        //console.log(res);
      }
    });
  },

  scrolltxt: function(){
    var t = this;
    var d = t.data;

    var interval = setInterval(function () {
      var next = d.marquee-1; //每次移动距离
      if( next<0 && Math.abs(next)>d.maxScroll ){
        next = d.windowWidth;
        clearInterval(interval);
        t.scrolltxt();
      }
      t.setData({
        marquee: next
      });
    }, 80);
  }
});
