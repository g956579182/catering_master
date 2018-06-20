// pages/goods/goods.js
var Zan = require('../../dist/index');
var app = getApp();
Page(Object.assign({}, Zan.Quantity, {

  /**
   * 页面的初始数据
   */
  data: {
    re_list: [],
    glist:[],
    cid:'',
    imgDomain: app.globalData.url2,
    keyword:'',
    cartcount:0,
    page:1,
    actionSheetHidden: true,
    simg:'',
    specs:[],
    gsid:0,
    hid:false,
    cid:0
    
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
      app.login('/pages/goods/goods');
    }
    var icode = wx.getStorageSync('inviter');
    if (icode != undefined && icode != '' && icode != null) {
      app.bindInviter();
    }
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var that = this;
    wx.request({
      url: app.globalData.url+'/cy/category/list',
      method:'post',
      data:{
        shopid:shopid,
        openid:openid,
        subsid:subsid
      },
      success:function(res){
        if(res.data.errorCode==0){
          that.setData({re_list:res.data.results})
          
        }else{
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    });
    
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
    if (app.globalData.cid) {
      this.setData({
        cid: app.globalData.cid
      })
    }
    this.setData({spec:{},goods:{}})
    this.getCartCount();
    this.getGoodsList();
    this.getStyle();
  },
  seedetails:function(){
    this.hideshade();
      wx.navigateTo({ url: '/pages/detail/detail' });
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
  //商品
  getGoodsList:function(){
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var cid = this.data.cid;
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/goods/list',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        subsid: subsid,
        cid:cid
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          that.setData({ glist: res.data.results.data })

        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    });
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

  handleZanQuantityChange(e) {
    var componentId = e.componentId;
    var quantity = e.quantity;
    if(!isNaN(parseInt(componentId))){
      var that = this;
      var glist = this.data.glist;
      glist[componentId].quantity = quantity;
      this.setData({
        glist: glist
      });
      var len = glist.length;
      var count = 0;
      for (var i = 0; i < len; i++) {
        count += glist[i]['quantity'];
      }
      var ext = wx.getExtConfigSync();
      var shopid = ext.shopid;
      var openid = wx.getStorageSync('openid');
      var subsid = wx.getStorageSync('subsid');
      wx.request({
        url: app.globalData.url + '/cy/cart/add',
        method: 'post',
        data: {
          shopid: shopid,
          openid: openid,
          subsid: subsid,
          gid: glist[componentId].id,
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
    }else{
      var specIndex = 0;
      var goods = this.data.goods;
      var specs = goods.specs;
      var spec = this.data.spec;
      var slen = specs.length;
      for(var i=0;i<slen;i++){
        if (specs[i].id == spec.id){
          specIndex = i;
        }
      }
      specs[specIndex].quantity = quantity;
      this.setData({ spec: specs[specIndex]});
      goods.specs = specs;
      this.setData({goods:goods});
    }
  },
  /**
   * 产品列表
   */
  goodslist:function(event){
    var that = this;
    var cid = event.currentTarget.dataset.id;
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var keyword = that.data.keyword;
    that.setData({cid:cid});
    wx.request({
      url: app.globalData.url+'/cy/goods/list',
      method:'post',
      data:{
        shopid:shopid,
        openid:openid,
        subsid:subsid,
        cid:cid,
        keyword:keyword
      },
      success:function(res){
        if(res.data.errorCode==0){
          that.setData({glist:res.data.results.data})
        }else{
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  /**
   * 搜索商品
   */
  bindconfirmEvent:function(event){
    var that = this;
    var cid = that.data.cid;
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var keyword = event.detail.value;
    that.setData({keyword:keyword});
    wx.request({
      url: app.globalData.url + '/cy/goods/list',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        subsid: subsid,
        cid: cid,
        keyword: keyword
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          that.setData({ glist: res.data.results.data })
        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hid) {
      return;
    }
    wx.showNavigationBarLoading();
    var that = this;
    var cid = that.data.cid;
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var keyword = that.data.keyword;
    that.setData({ page: that.data.page + 1 })
    wx.request({
      url: app.globalData.url + '/cy/goods/list',
      data: {
        shopid: shopid,
        openid:openid,
        subsid:subsid,
        cid: that.data.id,
        keyword:keyword,
        page: that.data.page
      },
      method: 'post',
      success: function (res) {
        if(res.data.errorCode==0){
          var glist = that.data.glist;
          var len = res.data.results.data.length;
          for (var i = 0; i < len; i++) {
            glist.push(res.data.results.data[i]);
          }
          that.setData({
            glist: glist
          });
          if (that.data.page >= res.data.results.last_page) {
            that.setData({
              nomore: true
            })
            that.setData({
              hid: true,
            });
          }
        }else{
          wx.showToast({
            title: res.data.errorStr,
          })
        }
        
        wx.hideNavigationBarLoading();
        
      }
    });
  },
  actionSheetTap: function (event) {
    var index = event.currentTarget.dataset.index;
    var goods = this.data.glist[index];
    this.setData({goods:goods});
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  actionSheetbindchange: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  selectSpec:function(event){
    var index = event.currentTarget.dataset.index;
    var goods = this.data.goods;
    var spec = goods.specs[index];
    this.setData({spec:spec});
    this.setData({gsid:spec.id});
  },
  cart:function(event){
    var spec = this.data.spec;
    if (spec != undefined && spec.quantity > 0){
      var goods = this.data.goods;
      var ext = wx.getExtConfigSync();
      var shopid = ext.shopid;
      var openid = wx.getStorageSync('openid');
      var subsid = wx.getStorageSync('subsid');
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
          subsid: subsid,
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
      var goods = this.data.goods;
      var ext = wx.getExtConfigSync();
      var shopid = ext.shopid;
      var openid = wx.getStorageSync('openid');
      var subsid = wx.getStorageSync('subsid');
      var gid = goods.id;
      var gsid = spec.id;
      var count = spec.quantity;
      var that = this;
      wx.setStorageSync('items', [{gid:gid,gsid:gsid,count:count}]);
      wx.navigateTo({
        url: '/pages/confirmOrder/confirmOrder',
      })
    }
  },
  //点击查看商品详情
  wachted: function (event) {
    
    var index = event.currentTarget.dataset.index;
    var glist = this.data.glist;
    var goods = glist[index];
    var showimg = app.globalData.url2 + goods.photos;
    var showgoods = goods.name;
    var showdescr = goods.descr;
    var showindex = index;
    // console.log(event);
    var goodsid = goods.id;
    wx.setStorageSync('id', goodsid);
    
    this.setData({
      screenType: '0',
      showimg: showimg,
      showgoods: showgoods,
      showdescr: showdescr,
      showindex:showindex
    });
  },
  hideshade: function () {
    this.setData({
      screenType: ''

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
}));