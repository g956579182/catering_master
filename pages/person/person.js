// pages/person/person.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    actionSheetHidden: true,
    qrcode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.mid != undefined && options.mid != '') {
      wx.setStorageSync('inviter', options.mid);

    }
    var shopinfo = wx.getStorageSync('shopinfo');
    if (shopinfo == undefined || shopinfo == '') {
      app.login('/pages/person/person');
    }
    var icode = wx.getStorageSync('inviter');
    if (icode != undefined && icode != '' && icode != null) {
      app.bindInviter();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var openid = wx.getStorageSync('openid');
    if (openid == undefined || openid == '' || openid == null) {
      return;
    }
    var that = this;
    var openid = '';
    var shopid = wx.getStorageSync('shopid');
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        console.log(res);
        openid = res.data;
        wx.request({
          url: app.globalData.url + '/cy/member/center',
          method: 'post',
          data: {
            openid: openid,
            shopid: shopid
          },
          success: function (res) {
            if (res.data.errorCode == 0) {
              that.setData({ member: res.data.results })
            } else {
              wx.showToast(res.data.errorStr);
            }
          }
        })

        wx.request({
          url: app.globalData.url + '/cy/member/qrcode',
          method: 'post',
          data: {
            openid: openid,
            shopid: shopid
          },
          success: function (res) {
            if (res.data.errorCode == 0) {
              that.setData({ qrcode: app.globalData.url + res.data.results })
            } else {
              wx.showToast(res.data.errorStr);
            }
          }
        })

      },
    })
    this.getStyle();
  },
  /**
     * 获取主题
     */
  getStyle: function () {
    var openid = wx.getStorageSync('openid');
    var shopid = wx.getStorageSync('shopid');
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/index/style',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          that.setData({ style: res.data.results })
        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  actionSheetTap: function () {
    wx.previewImage({urls:[this.data.qrcode]})
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  actionSheetbindchange: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  handleZanQuantityChange(e) {
    var componentId = e.componentId;
    var quantity = e.quantity;

    this.setData({
      [`${componentId}.quantity`]: quantity
    });
  },
  scan: function () {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res)
      }
    })
  },
  //领券
  callCoupon: function () {
    var openid = wx.getStorageSync('openid');
    var shopid = wx.getStorageSync('shopid');
    wx.request({
      url: app.globalData.url + '/cy/coupon/list',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
      },
      success: function (res) {
        if (res.data.errorCode == 0 && res.data.results.length>0) {
          wx.addCard({
            cardList: res.data.results,
            success: function (res) {
              var calist = res.cardList;
              var clen = calist.length;
              var items = [];
              for (var i = 0; i < clen; i++) {
                if (calist[i].isSuccess === true) {
                  items.push({
                    cardid: calist[i].cardId,
                    code: calist[i].code
                  });
                }
              }
              // console.log(items);
              if (items.length > 0) {
                wx.request({
                  url: app.globalData.url + '/cy/coupon/add',
                  method: 'post',
                  data: {
                    shopid: shopid,
                    openid: openid,
                    items: items
                  },
                  success: function (res) {
                    // console.log(res);
                    if (res.data.errorCode == 0) {

                    } else {
                      wx.showToast({
                        title: res.data.errorStr,
                      })
                    }
                  }
                })
              } else {
                wx.showToast({
                  title: '啊哦，卡券被领光了~'
                })
              }
            },
            fail: function (res) {
              // console.log(res);
              if (res.errMsg != 'addCard:fail cancel'){
                wx.showToast({
                  title: res.errMsg
                })
              }
              
            }
          })
        }else{
          wx.showToast({
            title: '啊哦，卡券被领光了~'
          })
        }
      }
    })
  },
  onShareAppMessage: function (res) {
    var pages = getCurrentPages()    //获取加载的页面

    var currentPage = pages[pages.length - 1]    //获取当前页面的对象

    var url = currentPage.route    //当前页面url
    var shopinfo = wx.getStorageSync('shopinfo');
    var shopname = shopinfo.name
    var icode = wx.getStorageSync('icode');
    return {
      title: shopname,
      path: url + '?mid=' + icode,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})