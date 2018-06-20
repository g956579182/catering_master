// pages/myOrder/all/myOrder.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status:'',
    imgDomain: app.globalData.url2,
    olist:[],
    page:1,
    nomore:false,
    actionSheetHidden:true,
    paytype:2,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var status = options.status;
    if(status!=undefined){
      this.setData({status:status});
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
    this.orderlist();
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
    var shopid = wx.getStorageSync('shopid');
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
   * 显示订单
   */
  orderlist:function(){
    if(!this.data.nomore){
      var shopid = wx.getStorageSync('shopid');
      var openid = wx.getStorageSync('openid');
      var subsid = wx.getStorageSync('subsid');
      var that = this;
      var status = this.data.status;
      var page = this.data.page;
      wx.request({
        url: app.globalData.url + '/cy/order/list',
        method: 'post',
        data: {
          shopid: shopid,
          openid: openid,
          status: status
        },
        success: function (res) {
          if (res.data.errorCode == 0) {
            var olist = that.data.olist;
            var data = res.data.results.data;
            var len = data.length;
            for (var i = 0; i < len; i++) {
              olist.push(data[i]);
            }
            that.setData({ olist: olist });
            if(page>=res.data.results.last_page){
              that.setData({nomore:true});
            }
            that.setData({page:page+1});
          } else {
            wx.showToast({
              title: res.data.errorCode,
            })
          }
        }
      })
    }
    
  },
  /**
   * 订单状态列表
   */
  statuslist:function(event){
    var status = event.currentTarget.dataset.status;
    this.setData({status:status});
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    this.setData({olist:[]});
    var that = this;
    var page = 1;
    wx.request({
      url: app.globalData.url + '/cy/order/list',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        status: status
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          var olist = that.data.olist;
          var data = res.data.results.data;
          var len = data.length;
          for (var i = 0; i < len; i++) {
            olist.push(data[i]);
          }
          that.setData({ olist: olist });
          if (page >= res.data.results.last_page) {
            that.setData({ nomore: true });
          }
          that.setData({ page: page + 1 });
        } else {
          wx.showToast({
            title: res.data.errorCode,
          })
        }
      }
    })
  },
  /**
   * 下拉加载
   */
  onReachBottom: function () {
    wx.showNavigationBarLoading();
    this.orderlist();
    wx.hideNavigationBarLoading();
  },
  /**
   * 查看订单
   */
  view:function(event){
    var id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/orderDetails/orderDetails?id='+id,
    })
  },
  /**
   * 准备支付
   */
  topay:function(event){
    var oid = event.currentTarget.dataset.id;
    var index = event.currentTarget.dataset.index;
    var olist = this.data.olist;
    var order = olist[index];
    this.setData({oid:oid,order:order});
    this.setData({ actionSheetHidden:false})
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
        subsid:order.subsid,
        id: oid,
        paytype: paytype
      },
      success: function (res) {
        if (res.data.errorCode == 0 && paytype==2) {
          var results = res.data.results;
          if (results.return_code == 'SUCCESS' && results.result_code == 'SUCCESS') {
            wx.requestPayment({
              timeStamp: results.timeStamp,
              nonceStr: results.nonceStr,
              package: results.package,
              signType: results.signType,
              paySign: results.paySign,
              success: function (res) {
                wx.redirectTo({
                  url: '/pages/myOrder/all/myOrder?status=1',
                })
              }
            })
          } else {
            wx.showToast({
              title: results.err_code_des,
            })
          }
        } else if (res.data.errorCode == 0 && paytype == 1){
          wx.redirectTo({
            url: '/pages/myOrder/all/myOrder?status=1',
          })
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
  del:function(event){
    var oid = event.currentTarget.dataset.id;
    var index = event.currentTarget.dataset.index;
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
            url: app.globalData.url +'/cy/order/delete',
            method:'post',
            data:{
              shopid:shopid,
              openid:openid,
              id:oid
            },
            success:function(res){
              if(res.data.errorCode==0){
                var olist = that.data.olist;
                olist.splice(index,1);
                that.setData({olist,olist});
              }else{
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
  refund:function(event){
    var oid = event.currentTarget.dataset.id;
    var index = event.currentTarget.dataset.index;
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
                var olist = that.data.olist;
                olist[index].status = -1;
                that.setData({ olist, olist });
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
  finish:function(event){
    var oid = event.currentTarget.dataset.id;
    var index = event.currentTarget.dataset.index;
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
                var olist = that.data.olist;
                olist[index].status = 3;
                that.setData({ olist, olist });
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
  evalua:function(event){
    var oid = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/evaluation/evaluation?id='+oid,
    })
  }
})