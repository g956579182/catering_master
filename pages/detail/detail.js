// pages/aa/aa.js
var app = getApp();
var Zan = require('../../dist/index');
Page(Object.assign({}, Zan.Quantity, {

  /**
   * 页面的初始数据
   */
  data: {
    screenType: '',
    screenpic: '',
    prodetails:{},
    guigemsg:[],
    evaluations: [],
    imgDomain: app.globalData.url2,
    style:'style01',
    actionSheetHidden: true,
    page:1,
    nomore:false
  },
  selcets: function () {
    this.setData({
      screenType: 1
    })
  },
  hideshade: function () {
    this.setData({
      screenType: ''

    })
  },
  actionSheetTap: function (event) {
    var prodetails = this.data.prodetails;
    if (prodetails.spec.length == 0) {
      this.setData({ spec: prodetails });
    }

    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  actionSheetbindchange: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  selectSpec: function (event) {
    var index = event.currentTarget.dataset.index;
    var goods = this.data.prodetails;
    var spec = goods.spec[index];
    this.setData({ spec: spec, sindex: index });
    this.setData({ gsid: spec.id });
  },
 pluspic:function(){
   this.setData({
     screenpic: 1
   })
 },
 hideshadebg: function () {
   this.setData({
     screenpic: ''
   })
 },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id;
    if(id!=undefined&&id!=''){
      wx.setStorageSync('id', id);
    }
    if (options.mid != undefined && options.mid != '') {
      wx.setStorageSync('inviter', options.mid);
      
    }
    var shopinfo = wx.getStorageSync('shopinfo');
    if (shopinfo == undefined || shopinfo == '') {
      app.login('/pages/detail/detail?id='+id);
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
    this.getStyle();
    this.getCartCount();
    this.getprodetails();
    this.getevaluation();
  },
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
    this.getevaluation();
  },

  connectshop:function(){
    wx.makePhoneCall({
      phoneNumber: '17857013741' 
    })
  },
  getprodetails:function(){
    let _this = this;
    let openid = wx.getStorageSync('openid');
    let shopid = wx.getStorageSync('shopid');
    let id = wx.getStorageSync('id');
    wx.request({
      url: app.globalData.url + '/cy/goods/detail',
      method: 'post',
      data: {
        'openid': openid,
        'shopid': shopid,
        'id':id,
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          _this.setData({ prodetails: res.data.results.detail })
        }
      }
    })
  },
  getevaluation:function(){
    var nomore = this.data.nomore;
    if(nomore){
      return;
    }
    let _this = this;
    let openid = wx.getStorageSync('openid');
    let shopid = wx.getStorageSync('shopid');
    let subsid = wx.getStorageSync('subsid');
    var page = this.data.page;
    let id = wx.getStorageSync('id');
    var evaluations = this.data.evaluations;
    wx.request({
      url: app.globalData.url + '/cy/comment/list',
      method: 'post',
      data: {
        'openid': openid,
        'shopid': shopid,
        'id': id,
        page:page
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          var data = res.data.results.data;
          var dlen = data.length;
          for(var i=0;i<dlen;i++){
            evaluations.push(data[i]);
          }
          if (page >= res.data.results.last_page){
            nomore = true;
          }
          _this.setData({ evaluations: evaluations,page:page+1,nomore:nomore })
        }
      }
    })
  },
  handleZanQuantityChange(e) {
    var componentId = e.componentId;
    var quantity = e.quantity;
    var openid = wx.getStorageSync('openid');
    var shopid = wx.getStorageSync('shopid');
    if (!isNaN(parseInt(componentId))) {
      var that = this;
      var prodetails = this.data.prodetails;
      prodetails.quantity = quantity;
      that.setData({ prodetails: prodetails});
      wx.request({
        url: app.globalData.url + '/cy/cart/add',
        method: 'post',
        data: {
          shopid: shopid,
          openid: openid,
          gid: prodetails.id,
          gsid: 0,
          count: quantity
        },
        success: function (res) {
          if (res.data.errorCode == 0) {
            that.getCartCount();
          } else {
            wx.showToast({
              title: res.data.errorStr,
            })
          }
        }
      })
    } else {
      var specIndex = 0;
      var goods = this.data.prodetails;
      var specs = goods.spec;
      var spec = this.data.spec;
      var slen = specs.length;
      for (var i = 0; i < slen; i++) {
        if (specs[i].id == spec.id) {
          specIndex = i;
        }
      }
      specs[specIndex].quantity = quantity;
      this.setData({ spec: specs[specIndex] });
      prodetails.spec = specs;
      this.setData({ prodetails: goods });
    }
  },
  cart: function (event) {
    var spec = this.data.spec;
    if (spec != undefined && spec.quantity > 0) {
      var goods = this.data.prodetails;
      var shopid = wx.getStorageSync('shopid');
      var openid = wx.getStorageSync('openid');
      var gid = goods.id;
      var gsid = spec.id;
      var count = spec.quantity;
      var that = this;
      wx.request({
        url: app.globalData.url + '/cy/cart/add',
        method: 'post',
        data: {
          shopid: shopid,
          openid: openid,
          gid: gid,
          gsid: gsid,
          count: count
        },
        success: function (res) {
          if (res.data.errorCode == 0) {
            that.getCartCount();
          } else {
            wx.showToast({
              title: res.data.errorStr,
            })
          }
          that.setData({
            actionSheetHidden: !that.data.actionSheetHidden
          })
        }
      })
    }
  },
  buy: function (event) {
    var spec = this.data.spec;
    if (spec != undefined && spec.quantity > 0) {
      var goods = this.data.prodetails;
      var shopid = wx.getStorageSync('shopid');
      var openid = wx.getStorageSync('openid');
      var gid = goods.id;
      var gsid = spec.id;
      var count = spec.quantity;
      var that = this;
      wx.setStorageSync('items', [{ gid: gid, gsid: gsid, count: count }]);
      wx.navigateTo({
        url: '/pages/confirmOrder/confirmOrder',
      })
    }
  },
  //获取购物车数量
  getCartCount: function () {
    let openid = wx.getStorageSync('openid');
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    let subsid = wx.getStorageSync('subsid');
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/cart/count',
      method: 'post',
      data: {
        shopid: shopid,
        subsid: subsid,
        openid: openid
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          that.setData({ cartcount: res.data.results });
        } else {
          wx.showToast({
            title: res.data.errorStr,
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
    var id = wx.getStorageSync('id');
    return {
      title: shopname,
      path: url + '?id='+id+'&mid=' + icode,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
}))