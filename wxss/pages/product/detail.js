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

  // //先制作一个canvas标签，再保存成图片
  // onSaveImg: function() {
  //   const ctx = wx.createCanvasContext('myCanvas'); //看回wxml里的canvas标签，这个的myCanvas要和标签里的canvas-id一致

  //   ctx.clearRect(0, 0, 644, 966);
  //   ctx.drawImage("/images/share.png", 0, 0, 646, 966);
  //   ctx.drawImage("/images/kefu.png", 0, -60, 646, 966);
  //   ctx.drawImage("/images/search.png" + this.data.tipsImgId + ".png", 79, 291 - 60, 492, 244);
  //   ctx.drawImage("/images/map.png", 90, 780 - 60, 135, 135);
  //   ctx.setFillStyle("#02446e");
  //   ctx.setFontSize(26);
  //   ctx.fillText("送菜娃商城" + this.data.testName + this.data.testId, 100, 610 - 60);
  //   ctx.setTextAlign("center");
  //   ctx.fillText("杨凌好帮手网络科技有限公司", 435, 790 - 60);

  //   ctx.setTextAlign("left");
  //   ctx.setFillStyle("black");
  //   ctx.setFontSize(18);
  //   ctx.fillText("我等你", 330, 825 - 60);
  //   ctx.setFontSize(22);

  //   ctx.drawImage("../../img/test4.png", 0, 936 - 60, 646, 30);
  //   var self = this;

  //   ctx.draw(true, setTimeout(function() { //为什么要延迟100毫秒？大家测试一下
  //     wx.canvasToTempFilePath({
  //       x: 0,
  //       y: 0,
  //       width: 646,
  //       height: 966,
  //       destWidth: 646,
  //       destHeight: 966,
  //       canvasId: 'myCanvas',
  //       success: function(res) {
  //         self.data.savedImgUrl = res.tempFilePath;
  //         self.saveImageToPhoto();
  //       }
  //     })
  //   }, 100))
  // },
  // saveImageToPhoto: function() {
  //   if (this.data.savedImgUrl != "") {
  //     wx.saveImageToPhotosAlbum({
  //       filePath: this.data.savedImgUrl,
  //       success: function() {
  //         wx.showModal({
  //           title: '保存图片成功',
  //           content: '寻人启事已经保存到相册，您可以手动分享到朋友圈！',
  //           showCancel: false
  //         });
  //       },
  //       fail: function(res) {
  //         console.log(res);
  //         if (res.errMsg == "saveImageToPhotosAlbum:fail cancel") {
  //           wx.showModal({
  //             title: '保存图片失败',
  //             content: '您已取消保存图片到相册！',
  //             showCancel: false
  //           });
  //         } else {
  //           wx.showModal({
  //             title: '提示',
  //             content: '保存图片失败，您可以点击确定设置获取相册权限后再尝试保存！',
  //             complete: function(res) {
  //               console.log(res);
  //               if (res.confirm) {
  //                 wx.openSetting({}) //打开小程序设置页面，可以设置权限
  //               } else {
  //                 wx.showModal({
  //                   title: '保存图片失败',
  //                   content: '您已取消保存图片到相册！',
  //                   showCancel: false
  //                 });
  //               }
  //             }
  //           });
  //         }
  //       }
  //     })
  //   }
  // },

  /**
   * 绘制分享的图片
   * @param goodsPicPath 商品图片的本地链接
   * @param qrCodePath 二维码的本地链接
   */
  drawSharePic: function(goodsPicPath, qrCodePath) {
    wx.showLoading({
      title: '正在生成图片...',
      mask: true,
    });
    //y方向的偏移量，因为是从上往下绘制的，所以y一直向下偏移，不断增大。
    let yOffset = 20;
    const goodsTitle = this.data.orderDetail.paltProduct.name1;
    let goodsTitleArray = [];
    //为了防止标题过长，分割字符串,每行18个
    for (let i = 0; i < goodsTitle.length / 18; i++) {
      if (i > 2) {
        break;
      }
      goodsTitleArray.push(goodsTitle.substr(i * 18, 18));
    }
    const price = this.data.orderDetail.price;
    const marketPrice = this.data.orderDetail.marketPrice;
    const title1 = '您的好友邀请您一起分享精品好货';
    const title2 = '立即打开看看吧';
    const codeText = '长按识别小程序码查看详情';
    const imgWidth = 780;
    const imgHeight = 1600;

    const canvasCtx = wx.createCanvasContext('shareCanvas');
    //绘制背景
    canvasCtx.setFillStyle('white');
    canvasCtx.fillRect(0, 0, 390, 800);
    //绘制分享的标题文字
    canvasCtx.setFontSize(24);
    canvasCtx.setFillStyle('#333333');
    canvasCtx.setTextAlign('center');
    canvasCtx.fillText(title1, 195, 40);
    //绘制分享的第二行标题文字
    canvasCtx.fillText(title2, 195, 70);
    //绘制商品图片
    canvasCtx.drawImage(goodPicPath, 0, 90, 390, 390);
    //绘制商品标题
    yOffset = 490;
    goodsTitleArray.forEach(function(value) {
      canvasCtx.setFontSize(20);
      canvasCtx.setFillStyle('#333333');
      canvasCtx.setTextAlign('left');
      canvasCtx.fillText(value, 20, yOffset);
      yOffset += 25;
    });
    //绘制价格
    yOffset += 8;
    canvasCtx.setFontSize(20);
    canvasCtx.setFillStyle('#f9555c');
    canvasCtx.setTextAlign('left');
    canvasCtx.fillText('￥', 20, yOffset);
    canvasCtx.setFontSize(30);
    canvasCtx.setFillStyle('#f9555c');
    canvasCtx.setTextAlign('left');
    canvasCtx.fillText(price, 40, yOffset);
    //绘制原价
    const xOffset = (price.length / 2 + 1) * 24 + 50;
    canvasCtx.setFontSize(20);
    canvasCtx.setFillStyle('#999999');
    canvasCtx.setTextAlign('left');
    canvasCtx.fillText('原价:￥' + marketPrice, xOffset, yOffset);
    //绘制原价的删除线
    canvasCtx.setLineWidth(1);
    canvasCtx.moveTo(xOffset, yOffset - 6);
    canvasCtx.lineTo(xOffset + (3 + marketPrice.toString().length / 2) * 20, yOffset - 6);
    canvasCtx.setStrokeStyle('#999999');
    canvasCtx.stroke();
    //绘制最底部文字
    canvasCtx.setFontSize(18);
    canvasCtx.setFillStyle('#333333');
    canvasCtx.setTextAlign('center');
    canvasCtx.fillText(codeText, 195, 780);
    //绘制二维码
    canvasCtx.drawImage(qrCodePath, 95, 550, 200, 200);
    canvasCtx.draw();
    //绘制之后加一个延时去生成图片，如果直接生成可能没有绘制完成，导出图片会有问题。
    setTimeout(function() {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 390,
        height: 800,
        destWidth: 390,
        destHeight: 800,
        canvasId: 'shareCanvas',
        success: function(res) {
          that.setData({
            shareImage: res.tempFilePath,
            showSharePic: true
          })
          wx.hideLoading();
        },
        fail: function(res) {
          console.log(res)
          wx.hideLoading();
        }
      })
    }, 2000);
  },

  onLoad: function(options) {
    var that = this;
    var userInfo, nickName, avatarUrl;
    //获取用户信息，头像，昵称之类的数据
    wx.getUserInfo({
        success: function(res) {
          console.log(res);
          userInfo = res.userInfo;
          nickName = userInfo.nickName;
          avatarUrl = userInfo.avatarUrl;
          that.setData({
            avatarUrl: res.userInfo.avatarUrl,
            nickName: res.userInfo.nickName,
          })
          wx.downloadFile({
            url: res.userInfo.avatarUrl
          })
        }
      }),
      //获取用户设备信息，屏幕宽度
      wx.getSystemInfo({
        success: res => {
          that.setData({
              screenWidth: res.screenWidth
            }),
            console.log(that.data.screenWidth)
        }
      })
    saveImageToPhotosAlbum();
  },

  //定义的保存图片方法
  saveImageToPhotosAlbum: function () {
    wx.showLoading({
      title: '保存中...',
    })
    var that = this;
    //设置画板显示，才能开始绘图
    that.setData({
      canvasHidden: false
    })
    var unit = that.data.screenWidth / 375;
    var path1 = "../images/bg3.png";
    var avatarUrl = that.data.avatarUrl;
    console.log(avatarUrl + "头像");
    var path2 = "../images/award.png";
    var path3 = "../images/qrcode.png";
    var path4 = "../images/headborder.png";
    var path5 = "../images/border.png";
    var unlight = "../images/unlight.png";
    var nickName = that.data.nickName;
    console.log(nickName + "昵称")
    var context = wx.createCanvasContext('share');
    var description = that.data.description;
    var wxappName = "来「 " + that.data.wxappName + " 」试试运气";
    context.drawImage(path1, 0, 0, unit * 375, unit * 462.5)
    //   context.drawImage(path4, unit * 164, unit * 40, unit * 50, unit * 50)
    context.drawImage(path2, unit * 48, unit * 120, unit * 280, unit * 178)
    context.drawImage(path5, unit * 48, unit * 120, unit * 280, unit * 178)
    context.drawImage(unlight, unit * 82, unit * 145, unit * 22, unit * 32)
    context.drawImage(unlight, unit * 178, unit * 145, unit * 22, unit * 32)
    context.drawImage(unlight, unit * 274, unit * 145, unit * 22, unit * 32)
    context.drawImage(unlight, unit * 82, unit * 240, unit * 22, unit * 32)
    context.drawImage(unlight, unit * 178, unit * 240, unit * 22, unit * 32)
    context.drawImage(unlight, unit * 274, unit * 240, unit * 22, unit * 32)
    context.drawImage(path3, unit * 20, unit * 385, unit * 55, unit * 55)
    //   context.drawImage(path4, 48, 200, 280, 128)
    context.setFontSize(14)
    context.setFillStyle("#999")
    context.fillText("长按识别小程序", unit * 90, unit * 408)
    context.fillText(wxappName, unit * 90, unit * 428)
    //把画板内容绘制成图片，并回调 画板图片路径
    context.draw(false, function () {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: unit * 375,
        height: unit * 462.5,
        destWidth: unit * 375,
        destHeight: unit * 462.5,
        canvasId: 'share',
        success: function (res) {
          that.setData({
            shareImgPath: res.tempFilePath
          })
          if (!res.tempFilePath) {
            wx.showModal({
              title: '提示',
              content: '图片绘制中，请稍后重试',
              showCancel: false
            })
          }
          console.log(that.data.shareImgPath)
          //画板路径保存成功后，调用方法吧图片保存到用户相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            //保存成功失败之后，都要隐藏画板，否则影响界面显示。
            success: (res) => {
              console.log(res)
              wx.hideLoading()
              that.setData({
                canvasHidden: true
              })
            },
            fail: (err) => {
              console.log(err)
              wx.hideLoading()
              that.setData({
                canvasHidden: true
              })
            }
          })
        }
      })
    });
  }
});