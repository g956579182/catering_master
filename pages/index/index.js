//index.js
//获取应用实例
var app = getApp()
import url from '../../utils/url.js'
var Zan = require('../../dist/index');
Page(Object.assign({}, Zan.Quantity,Zan.Shake,{
  data: {
    motto: 'Hello World',
    userInfo: {},
    shopInfo:{},
    activityInfo:[],
    categoryInfo:[],
    goodsInfo:[],
    imgDomain: app.globalData.url2,
    page:1,
    nomore:false,
    cartcount:0,
    actionSheetHidden: true,
    screenType:'',
    shakeInfo: { gravityModalHidden: true, enable:false},
    shakeData:{x:0,y:0,z:0},
  },
  //事件处理函数
  bindViewTap: function() {
    // wx.navigateTo({
    //   url: '../logs/logs'
    // })
  },
  onLoad: function (options) {
    
    
    var shopid = wx.getStorageSync('shopid');
    var scene = decodeURIComponent(options.scene);
    if(scene != undefined && scene != '' && scene!='undefined'){
      var arr = scene.split('=');
      if(arr[0]=='inviter'){
        wx.setStorageSync('inviter', arr[1]);
      }
    }else if(options.mid!=undefined){
      wx.setStorageSync('inviter', options.mid);
    }
    var shopinfo = wx.getStorageSync('shopinfo');
    if (shopinfo == undefined || shopinfo==''){
      app.login('/pages/index/index');
    }
    var icode = wx.getStorageSync('inviter');
    if (icode != undefined && icode != '' && icode != null) {
      app.bindInviter();
    }
  },
  onShow: function () {
    var openid = wx.getStorageSync('openid');
    if(openid==undefined || openid=='' || openid==null){
      return;
    }
    this.setData({ spec: {}, goods: {} });
    this.getShopInfo();

    this.getActivityInfo();
    this.getCategoryInfo();
    this.getGoodsInfo();
    this.getCartCount();
    this.getStyle();
    this.getMemberCard();
    
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      actionSheetHidden: true,
      nomore:false,
    })
  },
  /**
   * 获取主题
   */
  getStyle:function(){
    var openid = wx.getStorageSync('openid');
    var shopid = wx.getStorageSync('shopid');
    var that = this;
    wx.request({
      url: app.globalData.url+'/cy/index/style',
      method:'post',
      data:{
        shopid:shopid,
        openid:openid
      },
      success:function(res){
        if(res.data.errorCode == 0){
          that.setData({style:res.data.results})
        }else{
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  
  /**
   * 获取子店铺
   */
  getSubsid:function(){
    var subsid = wx.getStorageSync('subsid');
    if (subsid == undefined || subsid == 0) {
      wx.navigateTo({url:'/pages/storeList/storeList'});
    }
  },
  //获取购物车数量
  getCartCount:function(){
    let openid = wx.getStorageSync('openid');
    let shopid = wx.getStorageSync('shopid');
    let subsid = wx.getStorageSync('subsid');
    var that = this;
    wx.request({
      url: app.globalData.url+'/cy/cart/count',
      method:'post',
      data:{
        shopid:shopid,
        subsid:subsid,
        openid:openid
      },
      success:function(res){
        if(res.data.errorCode==0){
          that.setData({cartcount:res.data.results});
        }else{
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  //获取首页店铺的信息
  getShopInfo: function () {
    var shopinfo = wx.getStorageSync('shopinfo');
    this.setData({shopInfo:shopinfo});
  },
  //获取首页活动的信息
  getActivityInfo: function () {
    let _this = this;
    let openid = wx.getStorageSync('openid');
    let shopid = wx.getStorageSync('shopid');
    let subsid = wx.getStorageSync('subsid');
    wx.request({
      url: app.globalData.url + url.activity,
      method:'post',
      data:{
        'openid':openid,
        'shopid':shopid,
        'subsid':subsid,
      },
      success:function(res){
        if(res.data.errorCode==0){
          _this.setData({activityInfo:res.data.results})
        }
      }
    })
  },
  //获取首页分类的信息
  getCategoryInfo: function () {
    let _this = this;
    let openid = wx.getStorageSync('openid');
    let shopid = wx.getStorageSync('shopid');
    let subsid = wx.getStorageSync('subsid');
    wx.request({
      url: app.globalData.url + url.category,
      method:'post',
      data:{
        'openid':openid,
        'shopid':shopid,
        'subsid':subsid,
      },
      success:function(res){
        if(res.data.errorCode==0){
          _this.setData({categoryInfo:res.data.results})
        }
      }
    })
  },
  //获取首页商品的信息
  getGoodsInfo: function () {
    if(!this.data.nomore){
      var _this = this;
      let openid = wx.getStorageSync('openid');
      let shopid = wx.getStorageSync('shopid');
      let subsid = wx.getStorageSync('subsid');
      let page = this.data.page;
      wx.request({
        url: app.globalData.url + url.goods,
        method: 'post',
        data: {
          'openid': openid,
          'shopid': shopid,
          'subsid': subsid,
          'page': page
        },
        success: function (res) {
          if (res.data.errorCode == 0) {
            var len = res.data.results.data.length;
            var rgoods = res.data.results.data;
            var goodsInfo = _this.data.goodsInfo;
            for (var i = 0; i < len; i++) {
              goodsInfo.push(rgoods[i]);
            }
            _this.setData({ goodsInfo: goodsInfo })
            _this.setData({ page: page + 1 })
            if (page >= res.data.results.last_page) {
              _this.setData({ nomore: true });
            }

          }
          
        }
      })
    }
    wx.hideNavigationBarLoading();
  },
  /**
   * 下拉加载
   */
  onReachBottom: function(){
    wx.showNavigationBarLoading();
    this.getGoodsInfo();
  },
  //查看位置
  lookLocation: function () {
    let coordinate = this.data.shopInfo.coordinate;
    let arr = coordinate.split(',');
    var that = this;
    wx.openLocation({
      latitude:parseFloat(arr[0]),
      longitude: parseFloat(arr[1]),
      scale: 28,
      name:that.data.shopInfo.name,
      address:that.data.shopInfo.address
    })
  },
  //拨打电话
  calling:function(){
    let phoneNumber = this.data.shopInfo.contact;
    wx.makePhoneCall({
      phoneNumber: phoneNumber,
      success:function(){
        console.log("拨打电话成功！")
      },
      fail:function(){
        console.log("拨打电话失败！")
      }
    })
  },
  actionSheetTap: function (event) {
    var index = event.currentTarget.dataset.index;
    var goods = this.data.goodsInfo[index];
    this.setData({ goods: goods,gindex:index });
    if(goods.specs.length==0){
      this.setData({ spec: goods });
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
    var goods = this.data.goods;
    var spec = goods.specs[index];
    this.setData({ spec: spec,sindex:index });
    this.setData({ gsid: spec.id });
  },
  add:function(event){
    var index = event.currentTarget.dataset.index;
    var glist = this.data.goodsInfo;
    glist[index].quantity = parseInt(glist[index].quantity) + 1;
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var gid = glist[index].id;
    var count = glist[index].quantity
    var that = this;
    wx.request({
      url: app.globalData.url+'/cy/cart/add',
      method:'post',
      data:{
        shopid:shopid,
        subsid:subsid,
        openid:openid,
        gid:gid,
        count:count
      },
      success:function(res){
        if(res.data.errorCode==0){
          that.setData({goodsInfo:glist});
          that.getCartCount();
        }else{
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  handleZanQuantityChange(e) {
    var componentId = e.componentId;
    var quantity = e.quantity;
    var specIndex = 0;
    var goods = this.data.goods;
    var specs = goods.specs;
    var spec = this.data.spec;
    var slen = specs.length;
    var gindex = this.data.gindex;
    var glist = this.data.goodsInfo;
    if(slen>0){
      specIndex = this.data.sindex;
      specs[specIndex].quantity = quantity;
      this.setData({ spec: specs[specIndex] });
      goods.specs = specs;
      glist[gindex] = goods;
      this.setData({ goods: goods,goodsInfo:glist });
    }else{
      goods.quantity = quantity;
      glist[gindex] = goods;
      this.setData({ goods: goods, goodsInfo: glist});
      this.setData({ spec: goods });
    }
    
  },
  cart: function (event) {
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
  activity: function (e) {
    var dataset = e.currentTarget.dataset,
      activityId = dataset.id
    wx.navigateTo({
      url: "../activity/activity?id=" + activityId,//url跳转地址
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  //跳转到分类页面
  goType: function (e) {
    var dataset = e.currentTarget.dataset,
      orderId = dataset.id
    app.globalData.cid = orderId

    wx.switchTab({
      url: "../goods/goods"
    });

  },
  //点击查看商品详情
  wachted:function (event){
    var index = event.currentTarget.dataset.index;
    var glist = this.data.goodsInfo;
    var goods = glist[index];
    var showimg = app.globalData.url2 + goods.photos;
    var showgoods = goods.name;
    var showdescr = goods.descr;
    var showindex = index;
    var showprice = goods.price
    wx.setStorageSync('id', goods.id);
    this.setData({
      screenType: '0',
      showimg:showimg,
      showgoods:showgoods,
      showdescr:showdescr,
      showprice:showprice,
      showindex:showindex
    });
  },
  hideshade:function(){
    this.setData({
      screenType:''
    
    })
  },
  //获取会员卡信息
  getMemberCard:function(){
    var that = this;
    var openid = wx.getStorageSync('openid');
    var shopid = wx.getStorageSync('shopid');
    wx.request({
      url: app.globalData.url+'/cy/coupon/mcard',
      method:'post',
      data:{
        shopid:shopid,
        openid:openid
      },
      success:function(res){
        console.log(res.data);
        if(res.data.errorCode==0){
          var result = res.data.results;
          if(result.length == 0){
            
          }else{
            that.setData({cardInfo:result})
            that.setData({ shakeInfo: { gravityModalHidden: false, enable: true } })
          }
        }
      }
    })
  },
  //摇一摇成功后的操作
  shakesuccess() {
    var that = this;
    wx.playBackgroundAudio({
      dataUrl: 'http://7xqnxu.com1.z0.glb.clouddn.com/wx_app_shake.mp3',

    })
    wx.onBackgroundAudioStop(function () {
      
      var openid = wx.getStorageSync('openid');
      var shopid = wx.getStorageSync('shopid');
      wx.addCard({
        cardList: that.data.cardInfo,
        success:function(res){
          var calist = res.cardList;
          var clen = calist.length;
          var items = [];
          for (var i = 0; i < clen; i++) {
            if (calist[i].isSuccess === true) {
              items.push({ cardid: calist[i].cardId, code: calist[i].code });
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
                if (res.data.errorCode == 0) {
                  wx.openCard({
                    cardList: res.data.results,
                  })
                } else {
                  wx.showToast({
                    title: res.data.errorStr,
                  });
                  var shakeinfo = that.data.shakeInfo;
                  shakeinfo = {enable: true, gravityModalHidden: false };
                  that.setData({ shakeInfo: shakeinfo });
                }
              }
            })
          }
        }
      });
    })

  },
  seedetails: function () {
    this.hideshade();
    wx.navigateTo({ url: '/pages/detail/detail' });
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
      path: url + '?mid='+icode,
      success: function (res) {
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
}))
