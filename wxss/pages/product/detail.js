// index.js
// 获取应用实例

var app = getApp();

// 引入这个插件，使html内容自动转换成wxml内容
var WxParse = require('../../wxParse/wxParse.js');
let animationShowHeight = 300;
Page({
  firstIndex: -1,
  data: {
    bannerApp: true,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0, //tab切换
    productId: 0,
    itemData: {},
    bannerItem: [],
    buynum: 1,
    // 产品图片轮播
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    // 属性选择
    firstIndex: -1,
    // 准备数据
    // 数据结构：以一组一组来进行设定
    commodityAttr: [],
    attrValueList: [],
    isCollect: 0,

    animationDataSh: "",
    showModalStatusSh: false,
    imageHeight: 0,
    imageWidth: 0,

    //分享海报
    canvasHidden: true, //设置画板的显示与隐藏，画板不隐藏会影响页面正常显示
    avatarUrl: '', //用户头像
    nickName: '', //用户昵称
    wxappName: app.globalData.wxappName, //小程序名称
    shareImgPath: '',
    screenWidth: '', //设备屏幕宽度
    description: app.globalData.description, //奖品描述
    FilePath: '', //头像路径
    hidden: true,
    prurl:'/images/code.jpg'
  },

  imageLoad: function(e) {
    this.setData({
      imageHeight: e.detail.height,
      imageWidth: e.detail.width
    });
  },

  showModal: function() {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationDataSh: animation.export(),
      showModalStatusSh: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationDataSh: animation.export()
      })
    }.bind(this), 200)
  },
  hideModal: function() {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation;
    animation.translateY(animationShowHeight).step()
    this.setData({
      animationDataSh: animation.export(),
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationDataSh: animation.export(),
        showModalStatusSh: false
      })
    }.bind(this), 200)
  },

  onShow: function() {
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        animationShowHeight = res.windowHeight;
      }
    })
  },

  // 弹窗
  setModalStatus: function(e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })

    this.animation = animation
    animation.translateY(300).step();

    this.setData({
      animationData: animation.export()
    })

    if (e.currentTarget.dataset.status == 1) {
      this.setData({
        showModalStatus: true
      });
    }

    setTimeout(function() {
      animation.translateY(0).step()

      this.setData({
        animationData: animation
      })

      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)
  },

  // 弹窗
  setModalShare: function(e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })

    this.animation = animation
    animation.translateY(300).step();

    this.setData({
      animationData: animation.export()
    })

    //if (e.currentTarget.dataset.status == 1) {
    this.setData({
      showModalStatus: true
    });
    //}

    setTimeout(function() {
      animation.translateY(0).step()

      this.setData({
        animationData: animation
      })

      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)
  },

  // 加减
  changeNum: function(e) {
    var that = this;

    if (e.target.dataset.alphaBeta == 0) {
      if (this.data.buynum <= 1) {
        buynum: 1
      }
      else {
        this.setData({
          buynum: this.data.buynum - 1
        })
      };
    } else {
      this.setData({
        buynum: this.data.buynum + 1
      })
    };
  },

  // 传值
  onLoad: function(option) {
    // this.initNavHeight();
    var that = this;

    that.setData({
      productId: option.productId,
    });

    that.loadProductDetail();
  },

  // 商品详情数据获取
  loadProductDetail: function() {
    var that = this;

    wx.request({
      url: app.d.apiUrl + 'Product/index',
      method: 'post',
      data: {
        uid: app.d.userId,
        pro_id: that.data.productId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },

      success: function(res) {
        // init data
        var status = res.data.status;

        if (status == 1) {
          var pro = res.data.pro;
          var content = pro.content;

          WxParse.wxParse('content', 'html', content, that, 3);

          that.setData({
            itemData: pro,
            bannerItem: pro.img_arr,
            isCollect: pro.collect,
            commodityAttr: res.data.commodityAttr,
            attrValueList: res.data.attrValueList,
          });
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000,
          });
        }
      },

      error: function(e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
        });
      },
    });
  },

  // 属性选择
  onShow: function() {
    this.setData({
      includeGroup: this.data.commodityAttr
    });

    this.distachAttrValue(this.data.commodityAttr);
    // 只有一个属性组合的时候默认选中
    // console.log(this.data.attrValueList);

    if (this.data.commodityAttr.length == 1) {
      for (var i = 0; i < this.data.commodityAttr[0].attrValueList.length; i++) {
        this.data.attrValueList[i].selectedValue = this.data.commodityAttr[0].attrValueList[i].attrValue;
      }

      this.setData({
        attrValueList: this.data.attrValueList
      });
    }
  },

  // 获取数据
  distachAttrValue: function(commodityAttr) {
    /**
      将后台返回的数据组合成类似
      {
        attrKey:'型号',
        attrValueList:['1','2','3']
      }
      */

    // 把数据对象的数据（视图使用），写到局部内
    var attrValueList = this.data.attrValueList;

    // 遍历获取的数据
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        var attrIndex = this.getAttrIndex(commodityAttr[i].attrValueList[j].attrKey, attrValueList);

        // console.log('属性索引', attrIndex);
        // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置
        if (attrIndex >= 0) {
          // 如果属性值数组中没有该值，push新值；否则不处理
          if (!this.isValueExist(commodityAttr[i].attrValueList[j].attrValue, attrValueList[attrIndex].attrValues)) {
            attrValueList[attrIndex].attrValues.push(commodityAttr[i].attrValueList[j].attrValue);
          }
        } else {
          attrValueList.push({
            attrKey: commodityAttr[i].attrValueList[j].attrKey,
            attrValues: [commodityAttr[i].attrValueList[j].attrValue]
          });
        }
      }
    }

    // console.log('result', attrValueList)
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].attrValueStatus) {
          attrValueList[i].attrValueStatus[j] = true;
        } else {
          attrValueList[i].attrValueStatus = [];
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
    }

    this.setData({
      attrValueList: attrValueList
    });
  },

  getAttrIndex: function(attrName, attrValueList) {
    // 判断数组中的attrKey是否有该属性值
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrName == attrValueList[i].attrKey) {
        break;
      }
    }

    return i < attrValueList.length ? i : -1;
  },

  isValueExist: function(value, valueArr) {
    // 判断是否已有属性值
    for (var i = 0; i < valueArr.length; i++) {
      if (valueArr[i] == value) {
        break;
      }
    }

    return i < valueArr.length;
  },

  // 选择属性值事件
  selectAttrValue: function(e) {
    /*
      点选属性值，联动判断其他属性值是否可选
      {
        attrKey:'型号',
        attrValueList:['1','2','3'],
        selectedValue:'1',
        attrValueStatus:[true,true,true]
      }
      console.log(e.currentTarget.dataset);
    */
    var attrValueList = this.data.attrValueList;
    var index = e.currentTarget.dataset.index; // 属性索引
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;

    if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
      if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
        // 取消选中
        this.disSelectValue(attrValueList, index, key, value);
      } else {
        // 选中
        this.selectValue(attrValueList, index, key, value);
      }
    }
  },

  // 选中
  selectValue: function(attrValueList, index, key, value, unselectStatus) {
    // console.log('firstIndex', this.data.firstIndex);
    var includeGroup = [];

    if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选
      var commodityAttr = this.data.commodityAttr;
      // 其他选中的属性值全都置空
      // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus);

      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].selectedValue = '';
        }
      }
    } else {
      var commodityAttr = this.data.includeGroup;
    }

    // console.log('选中', commodityAttr, index, key, value);
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
          includeGroup.push(commodityAttr[i]);
        }
      }
    }

    attrValueList[index].selectedValue = value;

    // 判断属性是否可选
    // for (var i = 0; i < attrValueList.length; i++) {
    //   for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
    //     attrValueList[i].attrValueStatus[j] = false;
    //   }
    // }
    // for (var k = 0; k < attrValueList.length; k++) {
    //   for (var i = 0; i < includeGroup.length; i++) {
    //     for (var j = 0; j < includeGroup[i].attrValueList.length; j++) {
    //       if (attrValueList[k].attrKey == includeGroup[i].attrValueList[j].attrKey) {
    //         for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
    //           if (attrValueList[k].attrValues[m] == includeGroup[i].attrValueList[j].attrValue) {
    //             attrValueList[k].attrValueStatus[m] = true;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
    // console.log('结果', attrValueList);

    this.setData({
      attrValueList: attrValueList,
      includeGroup: includeGroup
    });

    var count = 0;

    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
    }

    if (count < 2) { // 第一次选中，同属性的值都可选
      this.setData({
        firstIndex: index
      });
    } else {
      this.setData({
        firstIndex: -1
      });
    }
  },

  // 取消选中
  disSelectValue: function(attrValueList, index, key, value) {
    var commodityAttr = this.data.commodityAttr;
    attrValueList[index].selectedValue = '';

    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = true;
      }
    }
    this.setData({
      includeGroup: commodityAttr,
      attrValueList: attrValueList
    });

    for (var i = 0; i < attrValueList.length; i++) {
      if (attrValueList[i].selectedValue) {
        this.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, true);
      }
    }
  },

  initProductData: function(data) {
    data["LunBoProductImageUrl"] = [];

    var imgs = data.LunBoProductImage.split(';');
    for (let url of imgs) {
      url && data["LunBoProductImageUrl"].push(app.d.hostImg + url);
    }

    data.Price = data.Price / 100;
    data.VedioImagePath = app.d.hostVideo + '/' + data.VedioImagePath;
    data.videoPath = app.d.hostVideo + '/' + data.videoPath;
  },

  // 添加到收藏
  addFavorites: function(e) {
    var that = this;

    console.log(that.data.itemData);

    wx.request({
      url: app.d.apiUrl + 'Product/col',
      method: 'post',
      data: {
        uid: app.d.userId,
        pid: that.data.productId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },

      success: function(res) {
        // init data
        var data = res.data;

        if (data.status == 1 && that.data.isCollect != 1) {
          wx.showToast({
            title: '收藏成功！',
            duration: 1500
          });

          that.setData({
            isCollect: 1
          });
        } else if (data.status == 1 && that.data.isCollect == 1) {
          wx.showToast({
            title: '取消收藏！',
            duration: 1500
          });


          that.setData({
            isCollect: 0
          });
        } else {
          wx.showToast({
            title: data.err,
            duration: 2000
          });
        }
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
  onShareAppMessage: function(res) {
    return {
      title: '送菜娃商城，好货来袭，抓紧抢购啦', // 转发后 所显示的title
      path: '/pages/index/index', // 相对的路径

      success: function(res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  },
  // // 分享到好友朋友圈
  // shareFun: function (e) {
  //   var that = this;
  //   onShareAppMessage(that)
  //   return {
  //     title: '送菜娃商城', // 转发后 所显示的title
  //     path: '/pages/index/index', // 相对的路径
  //     success: (res) => {    // 成功后要做的事情
  //       console.log(res.shareTickets[0])
  //       // console.log

  //       wx.getShareInfo({
  //         shareTicket: res.shareTickets[0],
  //         success: (res) => {
  //           that.setData({
  //             isShow: true
  //           })
  //           console.log(that.setData.isShow)
  //         },
  //         fail: function (res) { console.log(res) },
  //         complete: function (res) { console.log(res) }
  //       })
  //     },
  //     fail: function (res) {
  //       // 分享失败
  //       console.log(res)
  //     }
  //   }

  // },


  // 添加到购物车
  addShopCart: function(e) {
    var that = this;

    console.log(that);

    wx.request({
      url: app.d.apiUrl + 'Shopping/add',
      method: 'post',
      data: {
        uid: app.d.userId,
        pid: that.data.productId,
        num: that.data.buynum,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },

      success: function(res) {
        // init data
        var data = res.data;

        if (data.status == 1) {
          var ptype = e.currentTarget.dataset.type;

          if (ptype == 'buynow') {
            wx.redirectTo({
              url: '/pages/order/pay?cartId=' + data.cart_id
            });
            return;
          } else {
            wx.showToast({
              title: '加入购物车成功',
              icon: 'success',
              duration: 2000
            });
          }
        } else {
          wx.showToast({
            title: data.err,
            duration: 2000
          });
        }
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

  // 滑动切换tab
  bindChange: function(e) {
    var that = this;

    that.setData({
      currentTab: e.detail.current
    });
  },

  // 获取系统信息
  initNavHeight: function() {
    var that = this;

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },

  bannerClosed: function() {
    this.setData({
      bannerApp: false,
    })
  },

  // 点击tab切换
  swichNav: function(e) {
    var that = this;

    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },

  powerDrawer: function(e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  util: function(currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 100, //动画时长
      timingFunction: "linear", //线性
      delay: 0 //0则不延迟
    });

    // 第2步：这个动画实例赋给当前的动画实例
    this.animation = animation;

    // 第3步：执行第一组动画：Y轴偏移240px后(盒子高度是240px)，停
    animation.translateY(240).step();

    // 第4步：导出动画对象赋给数据对象储存
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画
    setTimeout(function() {
      // 执行第二组动画：Y轴不偏移，停
      animation.translateY(0).step()
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
      this.setData({
        animationData: animation
      })

      //关闭抽屉
      if (currentStatu == "close") {
        this.setData({
          showModalStatusSh: false
        });
      }
    }.bind(this), 200)

    // 显示抽屉
    if (currentStatu == "open") {
      this.setData({
        showModalStatusSh: true
      });
    }
  },
  
  drawImage:function() {
    //绘制canvas图片
    var that = this
    const ctx = wx.createCanvasContext('myCanvas')
    var bgPath = '/images/share.png'
    var portraitPath = that.data.portrait_temp
    var hostNickname = app.globalData.userInfo.nickName

    var qrPath = that.data.qrcode_temp
    var windowWidth = that.data.windowWidth
    that.setData({
      scale: 1.6
    })
    //绘制背景图片
    ctx.drawImage(bgPath, 0, 0, windowWidth, that.data.scale * windowWidth)

    //绘制头像
    ctx.save()
    ctx.beginPath()
    ctx.arc(windowWidth / 2, 0.32 * windowWidth, 0.15 * windowWidth, 0, 2 * Math.PI)
    ctx.clip()
    ctx.drawImage(portraitPath, 0.7 * windowWidth / 2, 0.17 * windowWidth, 0.3 * windowWidth, 0.3 * windowWidth)
    ctx.restore()
    //绘制第一段文本
    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(0.037 * windowWidth)
    ctx.setTextAlign('center')
    ctx.fillText(hostNickname + ' 正在参加疯狂红包活动', windowWidth / 2, 0.52 * windowWidth)
    //绘制第二段文本
    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(0.037 * windowWidth)
    ctx.setTextAlign('center')
    ctx.fillText('邀请你一起来领券抢红包啦~', windowWidth / 2, 0.57 * windowWidth)
    //绘制二维码
    ctx.drawImage(qrPath, 0.64 * windowWidth / 2, 0.75 * windowWidth, 0.36 * windowWidth, 0.36 * windowWidth)
    //绘制第三段文本
    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(0.037 * windowWidth)
    ctx.setTextAlign('center')
    ctx.fillText('长按二维码领红包', windowWidth / 2, 1.36 * windowWidth)
    ctx.draw();
    canvasToImage();
  },

  canvasToImage:function() {
    var that = this
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: that.data.windowWidth,
      height: that.data.windowWidth * that.data.scale,
      destWidth: that.data.windowWidth * 4,
      destHeight: that.data.windowWidth * 4 * that.data.scale,
      canvasId: 'myCanvas',
      success: function (res) {
        console.log('朋友圈分享图生成成功:' + res.tempFilePath)
        wx.previewImage({
          current: res.tempFilePath, // 当前显示图片的http链接
          urls: [res.tempFilePath] // 需要预览的图片http链接列表
        })
      },
      fail: function (err) {
        console.log('失败')
        console.log(err)
      }
    })
  },

  startDraw: function () {
    const ctx = wx.createCanvasContext('myCanvas');

    let windowWidth = wx.getSystemInfoSync().windowWidth;
    let windowHeight = wx.getSystemInfoSync().windowHeight;
    let _this = this;
    this.setData({
      scale: 1.6
    });

    ctx.setFillStyle('#333');
    ctx.fillRect(0, 0, windowWidth, 100);
    ctx.setFontSize(20);
    ctx.setFillStyle('#fff');
    ctx.fillText('开始绘制图片', 30, 50);
    ctx.setFillStyle('#FFF');
    ctx.fillRect(0, 70, windowWidth, 600);

    ctx.setFillStyle('#666');
    ctx.setFontSize(19);
    ctx.fillText('我是标题', 100, 140);

    ctx.setFontSize(20);
    ctx.fillText('微信小程序文本部分', 20, 170);

    ctx.draw()

    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: windowWidth,
      height: windowHeight,
      destWidth: windowWidth,
      destHeight: windowHeight,
      canvasId: 'myCanvas',
      success: function (res1) {
        console.log('朋友圈分享图生成成功:' + res1.tempFilePath);
      }
    });
  },

  onSaveImg: function () {
    const ctx = wx.createCanvasContext('myCanvas');         //看回wxml里的canvas标签，这个的myCanvas要和标签里的canvas-id一致  

    ctx.clearRect(0, 0, 644, 966);
   // ctx.drawImage("/images/xlb.png", 0, 0, 646, 966);
  // ctx.drawImage("/images/code.jpg", 0, -60, 646, 966);
    //ctx.drawImage("/imgages/" + this.data.tipsImgId + ".png", 79, 291 - 60, 492, 244);
    ctx.drawImage("/images/code.jpg", 90, 780 - 60, 135, 135);
    ctx.setFillStyle("#02446e");
    ctx.setFontSize(26);
    ctx.fillText("送菜娃" + this.data.testName + this.data.testId, 100, 610 - 60);
    ctx.setTextAlign("center");
    ctx.fillText("文字", 435, 790 - 60);

    ctx.setTextAlign("left");
    ctx.setFillStyle("green");
    ctx.setFontSize(18);
    ctx.fillText("文字", 330, 825 - 60);
    ctx.setFontSize(22);

    ctx.drawImage("/images/cart.jpg", 0, 936 - 60, 646, 30);
    var self = this;

    ctx.draw(true, setTimeout(function () {     //为什么要延迟100毫秒？大家测试一下  
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 646,
        height: 966,
        destWidth: 646,
        destHeight: 966,
        canvasId: 'myCanvas',
        success: function (res) {
          self.data.savedImgUrl = res.tempFilePath;
          self.saveImageToPhoto();
        }
      })
    }, 100))
  },  

  //保存图片到相册  
  saveImageToPhoto: function () {
    if (this.data.savedImgUrl != "") {
      wx.saveImageToPhotosAlbum({
        filePath: this.data.savedImgUrl,
        success: function () {
          wx.showModal({
            title: '保存图片成功',
            content: '',
            showCancel: false
          });
        },
        fail: function (res) {
          console.log(res);
          if (res.errMsg == "saveImageToPhotosAlbum:fail cancel") {
            wx.showModal({
              title: '保存图片失败',
              content: '您已取消保存图片到相册！',
              showCancel: false
            });
          } else {
            wx.showModal({
              title: '提示',
              content: '保存图片失败，您可以点击确定设置获取相册权限后再尝试保存！',
              complete: function (res) {
                console.log(res);
                if (res.confirm) {
                  wx.openSetting({})      //打开小程序设置页面，可以设置权限  
                } else {
                  wx.showModal({
                    title: '保存图片失败',
                    content: '您已取消保存图片到相册！',
                    showCancel: false
                  });
                }
              }
            });
          }
        }
      })
    }
  },  

});