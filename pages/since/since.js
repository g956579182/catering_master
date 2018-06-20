// pages/since/since.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgDomain: app.globalData.url2,
    actionSheetHidden: true,
    paytype: 2,
    date: '选择日期',
    time: '选择时间',
    nocards: true,
    cindex: -1,
    text: '未使用',
    mdiscount: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.setData({oid:0});
    this.getShopInfo();
    this.goodslist();
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
   * 获取店铺信息
   */
  getShopInfo:function(){
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var that = this;
    wx.request({
      url: app.globalData.url +'/cy/index/shop',
      method:'post',
      data:{
        shopid:shopid,
        subsid:subsid,
        openid:openid
      },
      success:function(res){
        if(res.data.errorCode==0){
          that.setData({shop:res.data.results})
        }else{
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  //查看位置
  lookLocation: function () {
    let coordinate = this.data.shop.coordinate;
    let arr = coordinate.split(',');
    wx.openLocation({
      latitude: parseInt(arr[0]),
      longitude: parseInt(arr[1]),
      scale: 28
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
   * 商品列表
   */
  goodslist: function () {
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var items = wx.getStorageSync('items');
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/order/show',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        subsid: subsid,
        items: items
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          var glist = res.data.results.goods;
          that.setData({ glist: glist});
          that.orderprice();
        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  /**
   * 订单总额
   */
  orderprice: function () {
    var glist = this.data.glist;
    var len = glist.length;
    var gtotal = 0;
    for (var i = 0; i < len; i++) {
      gtotal += glist[i].info.price * glist[i].count;
    }
    this.setData({ gtotal: gtotal });
    this.mcardDiscount();
  },
  setRemarks: function (event) {
    this.setData({ remarks: event.detail.value });
  },
  setCarrier: function (event) {
    this.setData({ carrier: event.detail.value });
  },
  setCarrytime: function (event) {
    this.setData({ carrytime: event.detail.value });
  },
  create: function () {
    var oid = this.data.oid;
    var that = this;
    if(oid == undefined || oid==0){
      var ext = wx.getExtConfigSync();
      var shopid = ext.shopid;
      var openid = wx.getStorageSync('openid');
      var subsid = wx.getStorageSync('subsid');
      var items = wx.getStorageSync('items');
      var cindex = this.data.cindex;
      var cards = this.data.cards;
      var code = '';
      if (cards[cindex] != undefined) {
        code = cards[cindex].code;
      }
      var carrier = this.data.carrier;
      var carrytime = this.data.date+' '+this.data.time;
      if (carrier==undefined ||carrier == '') {
        wx.showToast({ title: '请输入提货人号码' });
        return false;
      }
      if (carrytime == undefined || carrytime == '') {
        wx.showToast({
          title: '请输入取货时间',
        })
        return false;
      }
      var dtype = 0;
      var remarks = this.data.remarks;
      wx.request({
        url: app.globalData.url + '/cy/order/create',
        method: 'post',
        data: {
          shopid: shopid,
          subsid: subsid,
          openid: openid,
          items: items,
          dtype: dtype,
          carrier: carrier,
          carrytime: carrytime,
          remarks: remarks,
          code:code
        },
        success: function (res) {
          if (res.data.errorCode == 0) {
            var oid = res.data.results;
            that.setData({oid:oid});
            that.setData({
              actionSheetHidden: !that.data.actionSheetHidden
            })
          } else {
            wx.showToast({
              title: res.data.errorStr,
            })
          }
        }
      })
    }else{
      that.setData({
        actionSheetHidden: !that.data.actionSheetHidden
      })
    }
    
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
   * 支付
   */
  pay: function () {
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var paytype = this.data.paytype;
    if (paytype != 1 && paytype != 2) {
      wx.showToast({
        title: '请选择支付方式',
      })
      return false;
    }
    var ototal = this.data.ototal;
    var balance = this.data.member.balance;
    if (paytype == 1 && parseFloat(ototal) > parseFloat(balance)) {
      wx.showToast({
        title: '余额不足',
      })
      return false;
    }
    var oid = this.data.oid;
    wx.request({
      url: app.globalData.url + '/cy/order/pay',
      method: 'post',
      data: {
        shopid: shopid,
        subsid: subsid,
        openid: openid,
        id: oid,
        paytype: paytype
      },
      success: function (res) {
        if (res.data.errorCode == 0 && paytype ==2) {
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
              title: results.return_msg,
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
  bindDateChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },
  //获取卡券列表
  getCards: function () {
    var that = this;
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    wx.request({
      url: app.globalData.url + '/cy/coupon/ocard',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        fee: that.data.gtotal
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          var clen = res.data.results.length;
          if (clen > 0) {
            that.setData({ nocards: false, cards: res.data.results });
            wx.setStorageSync('cards', res.data.results);
            that.showDiscount();
          }else{
            that.setData({ cards: [] });
          }
        }
      }
    })
  },
  //打开卡券列表
  cardList: function () {
    // var that = this;
    // wx.openCard({
    //   cardList: that.data.cards,
    //   success:function(res){
    //     console.log(res);
    //   }
    // })
    wx.navigateTo({
      url: '/pages/cards/cards',
    })
  },
  //显示优惠
  showDiscount: function () {
    var cindex = parseInt(this.data.cindex);
    var cards = this.data.cards;
    var text = '未使用';
    if (isNaN(cindex) || cindex < 0 || cindex >= cards.length) {
      // return;
    } else {
      var card = cards[cindex];
      var ototal = this.data.gtotal;

      if (card.type == 'CASH') {
        text = '-' + card.reduce;
        ototal = (ototal - card.reduce).toFixed(2);
      } else if (card.type == 'DISCOUNT') {
        text = card.discount + '折';
        ototal = (ototal * card.discount / 10).toFixed(2);
      }
      this.setData({ gtotal: ototal })
    }
    this.setData({ text: text });
  },
  //会员卡折扣
  mcardDiscount: function () {
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/coupon/omcard',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid
      },
      success: function (res) {
        if (res.data.errorCode == 0 && res.data.results != null) {
          that.setData({ mdiscount: res.data.results.discount });
          var ototal = that.data.gtotal;
          var mtext = res.data.results.discount + '折';
          ototal = (ototal * res.data.results.discount / 10).toFixed(2);
          that.setData({ gtotal: ototal, mtext: mtext })
        }
        that.getCards();
      }
    })
  }
})