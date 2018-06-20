// pages/orderDetails/orderDetails.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:0,
    imgDomain: app.globalData.url2,
    detail:{},
    actionSheetHidden: true,
    paytype: 2,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    var id = options.id;
    this.setData({id:id});

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
    this.orderDetail();
    this.memberInfo();
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
   * 会员详情
   */
  memberInfo: function () {
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/member/center',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          that.setData({ member: res.data.results });
        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  /**
   * 订单详情
   */
  orderDetail:function(){
    var id = this.data.id;
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var that = this;
    wx.request({
      url: app.globalData.url+'/cy/order/detail',
      method:'post',
      data:{
        shopid:shopid,
        openid:openid,
        id:id
      },
      success:function(res){
        if(res.data.errorCode==0){
          that.setData({detail:res.data.results});
          that.shopInfo(shopid, res.data.results.subsid,openid);
        }else{
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  /**
   * 商户信息
   */
  shopInfo:function(shopid,subsid,openid){
    var that = this;
    wx.request({
      url: app.globalData.url+'/cy/index/shop',
      method:'post',
      data:{
        shopid:shopid,
        subsid:subsid,
        openid:openid
      },
      success:function(res){
        if(res.data.errorCode==0){
          that.setData({shop:res.data.results});
        }else{
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  //拨打电话
  calling: function () {
    let phoneNumber = this.data.shop.contact;
    wx.makePhoneCall({
      phoneNumber: phoneNumber,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  /**
   * 准备支付
   */
  topay: function (event) {
    var oid = this.data.detail.id;
    var order = this.data.detail;
    this.setData({ oid: oid, order: order });
    this.setData({ actionSheetHidden: false })
  },
  /**
   * 支付
   */
  pay: function () {
    var oid = this.data.oid;
    var order = this.data.order;
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var paytype = this.data.paytype;
    if (paytype != 1 && paytype != 2) {
      wx.showToast({
        title: '请选择支付方式',
      })
      return false;
    }
    var ototal = order.price;
    var balance = this.data.member.balance;
    if (paytype == 1 && parseFloat(ototal) > parseFloat(balance)) {
      wx.showToast({
        title: '余额不足',
      })
      return false;
    }
    wx.request({
      url: app.globalData.url + '/cy/order/pay',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        subsid: order.subsid,
        id: oid,
        paytype: paytype
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          var results = res.data.results;
          if (results.return_code == 'SUCCESS' && results.result_code == 'SUCCESS') {
            wx.requestPayment({
              timeStamp: results.timeStamp,
              nonceStr: results.nonceStr,
              package: results.package,
              signType: results.signType,
              paySign: results.paySign,
              success: function (res) {
                wx.navigateTo({
                  url: '/pages/myOrder/all/myOrder?status=1',
                })
              }
            })
          } else {
            wx.showToast({
              title: results.err_code_des,
            })
          }
        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  actionSheetTap: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  actionSheetbindchange: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  /**
   * 修改支付方式
   */
  changepay: function (event) {
    var paytype = event.currentTarget.dataset.paytype;
    this.setData({ paytype: paytype });
  },
  /**
   * 取消订单
   */
  del: function () {
    var order = this.data.detail;
    var oid = order.id;
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定取消该订单吗？',
      success: function (sm) {
        if (sm.confirm) {
          wx.request({
            url: app.globalData.url + '/cy/order/delete',
            method: 'post',
            data: {
              shopid: shopid,
              openid: openid,
              id: oid
            },
            success: function (res) {
              if (res.data.errorCode == 0) {
                wx.navigateTo({
                  url: '/pages/myOrder/all/myOrder',
                })
              } else {
                wx.showToast({
                  title: res.data.errorStr,
                })
              }
            }
          })
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  refund: function (event) {
    var order = this.data.detail;
    var oid = order.id;
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要进行退款吗？',
      success: function (sm) {
        if (sm.confirm) {
          wx.request({
            url: app.globalData.url + '/cy/order/refund',
            method: 'post',
            data: {
              shopid: shopid,
              openid: openid,
              id: oid
            },
            success: function (res) {
              if (res.data.errorCode == 0) {
                order.status = -1;
                that.setData({ detail, order });
              } else {
                wx.showToast({
                  title: res.data.errorStr,
                })
              }
            }
          })
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  finish: function (event) {
    var order = this.data.detail;
    var oid = order.id;
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定完成该订单吗？',
      success: function (sm) {
        if (sm.confirm) {
          wx.request({
            url: app.globalData.url + '/cy/order/finish',
            method: 'post',
            data: {
              shopid: shopid,
              openid: openid,
              id: oid
            },
            success: function (res) {
              if (res.data.errorCode == 0) {
                order.status = 3;
                that.setData({ detail, order });
              } else {
                wx.showToast({
                  title: res.data.errorStr,
                })
              }
            }
          })
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})