// pages/cart/cart.js

var app = getApp();

Page ({
  data: {
    page          : 1,
    total         : 0,
    carts         : [],
    selectedAllStatus: false

  },

  bindMinus: function(e) {
    var that = this;

    var index = parseInt(e.currentTarget.dataset.index);
    var num = that.data.carts[index].num;

    // 如果只有1件了，就不允许再减了
    if (num > 1) {
      num --;
    } else {
      return;
    }

    var cart_id = e.currentTarget.dataset.cartid;

    wx.request({
      url: app.d.apiUrl + 'Shopping/up_cart',
      method:'post',
      data: {
        user_id : app.d.userId,
        num     : num,
        cart_id : cart_id
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },

      success: function(res) {
        var status = res.data.status;
        var msg = res.data.msg;

        if (status==1) {
          // 只有大于一件的时候，才能normal状态，否则disable状态
          var minusStatus = num <= 1 ? 'disabled' : 'normal';
          // 购物车数据
          var carts = that.data.carts;
          carts[index].num = num;
          carts[index].minus = minusStatus;

          that.sum();
        }else{
          console.log(res);

          wx.showToast({
            title   : msg,
            duration: 2000
          });
        }
      },

      fail: function() {
        // fail
        wx.showToast({
          title   : '网络异常！',
          duration: 2000
        });
      }
    });
  },

  bindManual: function (e) {
    var that = this;

    var index = parseInt(e.currentTarget.dataset.index);
   // var num = that.data.carts[index].num;
    var num = e.detail.value;

    if (num < 1)
    {
      num = 1;
    }

    var cart_id = e.currentTarget.dataset.cartid;

    wx.request({
      url: app.d.apiUrl + 'Shopping/up_cart',
      method: 'post',
      data: {
        user_id: app.d.userId,
        num: num,
        cart_id: cart_id
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },

      success: function (res) {
        var status = res.data.status;
        var msg = res.data.msg;

        if (status == 1) {
          // 只有大于一件的时候，才能normal状态，否则disable状态
          var minusStatus = num <= 1 ? 'disabled' : 'normal';
          // 购物车数据
          var carts = that.data.carts;
          carts[index].num = num;
          carts[index].minus = minusStatus;

          that.sum();
        } else {
          console.log(res);

          wx.showToast({
            title: msg,
            duration: 2000
          });
        }
      },

      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },

  bindPlus: function(e) {
    var that = this;

    var index = parseInt(e.currentTarget.dataset.index);
    var num = that.data.carts[index].num;

    if (num < 1) {
      num = 1;
    }

    // 自增
    num ++;
    var cart_id = e.currentTarget.dataset.cartid;

    wx.request({
      url     : app.d.apiUrl + 'Shopping/up_cart',
      method  : 'post',
      data    : {
        user_id : app.d.userId,
        num     : num,
        cart_id : cart_id
      },
      header  : {
        'Content-Type': 'application/x-www-form-urlencoded'
      },

      success: function (res) {
        var status = res.data.status;
        var msg = res.data.msg;

        if (status==1) {
          // 只有大于一件的时候，才能normal状态，否则disable状态
          var minusStatus = num <= 1 ? 'disabled' : 'normal';
          // 购物车数据
          var carts = that.data.carts;
          carts[index].num = num;
          carts[index].minus = minusStatus;

          that.sum();
        }else{
          console.log(res);

          wx.showToast({
            title   : msg,
            duration: 2000
          });
        }
      },

      fail: function() {
        // fail
        wx.showToast({
          title   : '网络异常！',
          duration: 2000
        });
      }
    });
  },

  bindCheckbox: function(e) {
    // 绑定点击事件，将checkbox样式改变为选中与非选中
    // 拿到下标值，以在carts作遍历指示用
    var index = parseInt(e.currentTarget.dataset.index);
    // 原始的icon状态
    var selected = this.data.carts[index].selected;
    var carts = this.data.carts;
    // 对勾选状态取反
    carts[index].selected = !selected;

    // 写回经点击修改后的数组
    this.setData({
      carts: carts
    });

    this.sum()
  },

  bindSelectAll: function() {
   // 环境中目前已选状态
   var selectedAllStatus = this.data.selectedAllStatus;
   // 取反操作
   selectedAllStatus = !selectedAllStatus;
   // 购物车数据，关键是处理selected值
   var carts = this.data.carts;

   // 遍历
   for (var i = 0; i < carts.length; i++) {
     carts[i].selected = selectedAllStatus;
   }

   this.setData({
     selectedAllStatus: selectedAllStatus,
     carts            : carts
   });

   this.sum()
 },

  bindCheckout: function() {
    // 初始化toastStr字符串
    var toastStr = '';

    // 遍历取出已勾选的cid
    for (var i = 0; i < this.data.carts.length; i++) {
     if (this.data.carts[i].selected) {
       toastStr += this.data.carts[i].id;
       toastStr += ',';
     }
    }

    if (toastStr=='') {
     wx.showToast({
       title    : '请选择要结算的商品！',
       duration : 2000
     });

     return false;
    }

    // 存回data
    wx.navigateTo({
     url: '/pages/order/pay?cartId=' + toastStr,
    })
  },

  bindToastChange: function() {
    this.setData({
      toastHidden: true
    });
  },

  sum: function() {
    var carts = this.data.carts;
    // 计算总金额
    var total = 0;

    for (var i = 0; i < carts.length; i++) {
      if (carts[i].selected) {
        var singlesum = ((100 * carts[i].price ).toFixed() * carts[i].num) /100;
        total +=  singlesum ;
      }
    }

    total = total.toFixed(2);

    // 写回经点击修改后的数组
    this.setData({
      carts: carts,
      total: '¥ ' + total
    });
  },

  onLoad: function(options) {
    this.loadProductData();
    this.sum();
  },

  onShow: function() {
    this.loadProductData();
    this.sum();
  },

  removeShopCard: function(e) {
    var that = this;
    var cardId = e.currentTarget.dataset.cartid;

    wx.showModal({
      title: '提示',
      content: '您确认移除吗',

      success: function(res) {
        res.confirm && wx.request({
          url: app.d.apiUrl + 'Shopping/delete',
          method:'post',
          data: {
            cart_id: cardId,
          },
          header: {
            'Content-Type':  'application/x-www-form-urlencoded'
          },

          success: function (res) {
            // init data
            var data = res.data;

            if(data.status == 1){
              // that.data.productData.length =0;
              that.loadProductData();
            }else{
              wx.showToast({
                title: '操作失败！',
                duration: 2000
              });
            }
          },
        });
      },

      fail: function() {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },

  // 数据案例
  loadProductData: function() {
    var that = this;

    wx.request({
      url: app.d.apiUrl + 'Shopping/index',
      method:'post',
      data: {
        user_id: app.d.userId
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var carts = res.data.cart;

        for (var i=0;i<carts.length;i++) {
          if (carts[i].num > 1) {
            carts[i].minus = 'normal';
          } else {
            carts[i].minus = 'disabled';
          }
        }

        console.log(carts);

        that.setData({
          carts:carts,
        });
      },
    });
  },
})