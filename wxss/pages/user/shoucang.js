// pages/user/shoucang.js

var app = getApp();
var common = require("../../utils/common.js");

Page ({
  data: {
    page        : 1,
    productData : [],
  },

  onLoad: function(options) {
    this.loadProductData();
  },

  onShow: function() {
    // 页面显示
    this.loadProductData();
  },

  removeFavorites: function(e) {
    var that = this;
    var ccId = e.currentTarget.dataset.favId;

    wx.showModal({
      title   : '提示',
      content : '您确认移除吗',
      success : function(res) {
        res.confirm && wx.request({
          url   : app.d.hostUrl + 'user/collection_qu',
          method: 'post',
          data  : {
            id: ccId,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            // init data
            var data = res.data;
            console.log(data);
            // todo
            if (data.status == 1){
              that.data.productData.length =0;
              that.loadProductData();
            }
          },
        });

      }
    });
  },

  loadProductData: function() {
    var that = this;
    console.log(this.data);

    wx.request({
      url   : app.d.hostUrl + 'user/collection',
      method: 'post',
      data  : {
        id        : app.d.userId,
        pageindex : that.data.page,
        pagesize  : 100,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },

      success: function (res) {
        console.log(res);

        // init data
        var data = res.data.sc_list;

        that.setData({
          productData : data
        });

        //endInitData
      },
    });
  }
});