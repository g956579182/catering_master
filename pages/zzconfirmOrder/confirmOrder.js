// pages/confirmOrder/confirmOrder.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:{},
    imgDomain: app.globalData.url2,
    remarks:'',
    actionSheetHidden: true,
    paytype:2,
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
    this.setData({ oid: 0 });
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
   * 商品列表
   */
  goodslist:function(){
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var items = wx.getStorageSync('items');
    var did = this.data.did;
    var that = this;
    wx.request({
      url: app.globalData.url+'/cy/order/show',
      method:'post',
      data:{
        shopid: shopid,
        openid: openid,
        subsid: subsid,
        items:items,
        did:did
      },
      success:function(res){
        if(res.data.errorCode==0){
          var glist = res.data.results.goods;
          var expressprice = res.data.results.expressprice;
          that.setData({glist:glist,expressprice:expressprice});
          that.orderprice();
        }else{
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  /**
   * 会员详情
   */
  memberInfo:function(){
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var that = this;
    wx.request({
      url: app.globalData.url+'/cy/member/center',
      method:'post',
      data:{
        shopid:shopid,
        openid:openid
      },
      success:function(res){
        if(res.data.errorCode==0){
          that.setData({member:res.data.results});
        }else{
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
  orderprice:function(){
    var glist = this.data.glist;
    var expressprice = this.data.expressprice;
    var len = glist.length;
    var gtotal = 0;
    for(var i=0;i<len;i++){
      gtotal += glist[i].info.price * glist[i].count;
    }
    var ototal = gtotal + expressprice;
    this.setData({ ototal: ototal,gtotal:gtotal});
    this.mcardDiscount()
  },
  setRemarks:function(event){
    this.setData({remarks:event.detail.value});
  },
  create:function(){
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var items = wx.getStorageSync('items');
    var oid = this.data.oid;
    var did = this.data.did;
    var cindex = this.data.cindex;
    var cards = this.data.cards;
    var code = '';
    if (cards[cindex] != undefined) {
      code = cards[cindex].code;
    }
    if(oid==undefined||oid == 0){
      var that = this;
      var dtype = 1;
      var remarks = this.data.remarks;
      wx.request({
        url: app.globalData.url + '/cy/order/create',
        method: 'post',
        data: {
          shopid: shopid,
          subsid: subsid,
          openid: openid,
          items: items,
          did:did,
          code:code
        },
        success: function (res) {
          if (res.data.errorCode == 0) {
            var oid = res.data.results;
            that.setData({ oid: oid });
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
  changepay:function(event){
    var paytype = event.currentTarget.dataset.paytype;
    this.setData({paytype:paytype});
  },
  /**
   * 支付
   */
  pay:function(){
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var paytype = this.data.paytype;
    if(paytype!=1&&paytype!=2){
      wx.showToast({
        title: '请选择支付方式',
      })
      return false;
    }
    var ototal = this.data.ototal;
    var balance = this.data.member.balance;
    if (paytype == 1 && parseFloat(ototal) > parseFloat(balance)){
      wx.showToast({
        title: '余额不足',
      })
      return false;
    }
    var oid = this.data.oid;
    var did = this.data.did;
    wx.request({
      url: app.globalData.url+'/cy/order/pay',
      method:'post',
      data:{
        shopid:shopid,
        subsid:subsid,
        openid:openid,
        id:oid,
        paytype:paytype,
        did:did
      },
      success:function(res){
        if(res.data.errorCode==0 && paytype==2){
          var results = res.data.results;
          if (results.return_code=='SUCCESS'&&results.result_code=='SUCCESS'){
            wx.requestPayment({
              timeStamp: results.timeStamp,
              nonceStr: results.nonceStr,
              package: results.package,
              signType: results.signType,
              paySign: results.paySign,
              success:function(res){
                wx.redirectTo({
                  url: '/pages/myOrder/all/myOrder?status=2',
                })
              }
            })
          }else{
            wx.showToast({
              title: results.err_code_des,
            })
          }
        } else if (res.data.errorCode == 0 && paytype == 1) {
          wx.redirectTo({
            url: '/pages/myOrder/all/myOrder?status=1',
          })
        }else{
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
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
        fee: that.data.ototal
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          var clen = res.data.results.length;
          if (clen > 0) {
            that.setData({ nocards: false, cards: res.data.results });
            wx.setStorageSync('cards', res.data.results);
            that.showDiscount();
          } else {
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
      var ototal = this.data.ototal;

      if (card.type == 'CASH') {
        text = '-' + card.reduce;
        ototal = (ototal - card.reduce).toFixed(2);
      } else if (card.type == 'DISCOUNT') {
        text = card.discount + '折';
        ototal = (ototal * card.discount / 10).toFixed(2);
      }
      this.setData({ ototal: ototal })
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
          var ototal = that.data.ototal;
          var mtext = res.data.results.discount + '折';
          ototal = (ototal * res.data.results.discount / 10).toFixed(2);
          that.setData({ ototal: ototal, mtext: mtext })
        }
        that.getCards();
      }
    })
  }
})