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
    hid:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    var shopid = wx.getStorageSync('shopid');
    var scene = decodeURIComponent(options.scene);

    if (scene != undefined && scene != '') {
      var arr = scene.split('=');
      if (arr[0] == 'did') {
        this.setData({did:arr[1]});
      }
    } 
    if (options.mid != undefined && options.mid != '') {
      wx.setStorageSync('inviter', options.mid);

    }
    var shopinfo = wx.getStorageSync('shopinfo');
    if (shopinfo == undefined || shopinfo == '') {
      app.login('/pages/zzgoods/zzgoods?did=' + this.data.did);
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
    this.setData({ spec: {}, goods: {} })
    this.getCartCount();
    this.getGoodsList();
    this.getStyle();
    this.categorylist();
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
   * 获取用户
   */
  checkMember: function () {
    
    var inviter = wx.getStorageSync('inviter');
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    wx.login({
      success: function (res) {
        var code_ = res.code;
        wx.getUserInfo({
          success: function (res) {
            var userinfo = res.userInfo;
            wx.request({
              url: app.globalData.url + '/cy/member/check',
              method: 'post',
              data: {
                shopid: shopid,
                code: code_,
                userinfo: userinfo,
                inviter: inviter
              },
              success: function (res) {
                if (res.data.errorCode == 0) {
                  wx.setStorageSync('openid', res.data.results.openid);
                  wx.reLaunch({
                    url: '/pages/zzgoods/goods',
                  })
                } else {
                  wx.showToast({
                    title: res.data.errorStr,
                  })
                }
              }
            })
          }
        })
      }
    })
  },
  //商品
  getGoodsList:function(){
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var did = this.data.did;
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/goods/list',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        subsid: subsid,
        did:did
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
    var did = this.data.did;
    console.log('did is '+did);
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/cart/count',
      method: 'post',
      data: {
        shopid: shopid,
        subsid: subsid,
        openid: openid,
        did:did
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
  categorylist:function(){
    let openid = wx.getStorageSync('openid');
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    let subsid = wx.getStorageSync('subsid');
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/category/list',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        subsid: subsid
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          that.setData({ re_list: res.data.results })

        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    });
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
  handleZanQuantityChange(e) {
    var componentId = e.componentId;
    var quantity = e.quantity;
    if(!isNaN(parseInt(componentId))){
      var that = this;
      var glist = this.data.glist;
      var did = this.data.did;
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
          count: quantity,
          did:did
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
    var did = this.data.did;
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
        keyword:keyword,
        did:did
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
    var did = this.data.did;
    that.setData({keyword:keyword});
    wx.request({
      url: app.globalData.url + '/cy/goods/list',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        subsid: subsid,
        cid: cid,
        keyword: keyword,
        did:did
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
    var did = this.data.did;
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
        page: that.data.page,
        did:did
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
      var did = this.data.did;
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
          count: count,
          did:did
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
      var did = this.data.did;
      var that = this;
      wx.setStorageSync('items', [{gid:gid,gsid:gsid,count:count}]);
      wx.navigateTo({
        url: '/pages/zzconfirmOrder/confirmOrder?did='+did,
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
    this.setData({
      screenType: '0',
      showimg: showimg,
      showgoods: showgoods,
      showdescr: showdescr
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
    var did = this.data.did;
    return {
      title: shopname,
      path: url + '?did='+did+'&mid=' + icode,
      success: function (res) {
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
}));