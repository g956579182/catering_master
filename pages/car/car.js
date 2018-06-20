// pages/car/car.js
var Zan = require('../../dist/index');
var app = getApp();
function caltotal(checks,carts){
  var clen = checks.length;
  var total = 0;
  for(var i=0;i<clen;i++){
    if(checks[i]==true){
      total += carts[i].price * carts[i].count
    }
  }
  return total;
}
Page(Object.assign({}, Zan.Quantity,{

  /**
   * 页面的初始数据
   */
  data: {
     carts:[],
     imgDomain: app.globalData.url2,
     checks:[],
     checkall:false,
     total:0,
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
    this.cartlist();
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
   * 购物车列表
   */
  cartlist:function(){
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/cart/list',
      method: 'post',
      data: {
        shopid: shopid,
        subsid: subsid,
        openid: openid,
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          var carts = res.data.results.data;
          that.setData({ carts: carts });
        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  /**
   * 删除购物车
   */
  deleteCart:function(event){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          var id = event.currentTarget.dataset.id;
          var index = event.currentTarget.dataset.index;
          var ext = wx.getExtConfigSync();
          var shopid = ext.shopid;
          var openid = wx.getStorageSync('openid');
          var subsid = wx.getStorageSync('subsid');
          wx.request({
            url: app.globalData.url+'/cy/cart/delete',
            method:'post',
            data:{
              shopid:shopid,
              subsid:subsid,
              openid:openid,
              id:[id]
            },
            success:function(res){
              if(res.data.errorCode==0){
                var carts = that.data.carts;
                var checks = that.data.checks;
                carts.splice(index,1);
                checks.splice(index,1);
                that.setData({carts:carts});
                that.setData({checks:checks});
                var total = caltotal(checks,carts);
                that.setData({total:total});
              }else{
                wx.showToast({
                  title: res.data.errorStr,
                })
              }
            }
          })
        } else if (sm.cancel) {
          // console.log('用户点击取消')
        }
      }
    })
  },
  handleZanQuantityChange(e) {
    var componentId = e.componentId;
    var quantity = e.quantity;
    var that = this;
    var carts = this.data.carts;
    var checks = this.data.checks;
    carts[componentId].count = quantity;
    this.setData({
      carts: carts
    });
    var total = caltotal(checks,carts);
    this.setData({total:total});
    var single = carts[componentId];
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    if(single.count == 0){

    }else{
      wx.request({
        url: app.globalData.url + '/cy/cart/add',
        method: 'post',
        data: {
          shopid: shopid,
          openid: openid,
          subsid: subsid,
          gid: single.gid,
          gsid: single.gsid,
          count: single.count
        },
        success: function (res) {
          if (res.data.errorCode == 0) {

          } else {
            wx.showToast({
              title: res.data.errorStr,
            })
          }
        }
      })
    }
    
  },
  /**
   * 全选
   */
  checkall:function(event){
    if(event.detail.value.length==0){
      this.setData({checks:[]});
      var total = caltotal([], []);
      this.setData({ total: total }); 
    }else{
      var carts = this.data.carts;
      var clen = carts.length;
      var checks = [];
      for(var i=0;i<clen;i++){
        checks[i] = true;
      }
      this.setData({ checks: checks }); 
      this.setData({checkall:true})
      var total = caltotal(checks,carts);
      this.setData({total:total});
    }
  },
  /**
   * 选择某个
   */
  check:function(event){
    var index = event.currentTarget.dataset.index;
    var checks = this.data.checks;
    var carts = this.data.carts;
    if (event.detail.value.length == 0) {
      
      checks[index] = false;
      this.setData({ checkall: false })
    } else {
      checks[index] = true;
      var chlen = checks.length;
      
      var clen = carts.length;
      var count = 0;
      for (var i = 0; i < chlen;i++){
        if(checks[i]==true){
          count++;
        }
      }
      if (clen == count){
        this.setData({ checkall: true })
      }
    }
    this.setData({checks:checks});
    var total = caltotal(checks, carts);
    this.setData({ total: total });
  },
  /**
   * 付款
   */
  pay:function(event){
    var checks = this.data.checks;
    var carts = this.data.carts;
    var clen = checks.length;
    var items = [];
    for(var i=0;i<clen;i++){
      if(checks[i] == true){
        items.push({'gid':carts[i].gid,'gsid':carts[i].gsid,'count':carts[i].count})
      }
    }
    if(items.length == 0){
      wx.showToast({
        title: '请选择商品',
      })
    }else{
      wx.setStorage({
        key: 'items',
        data: items,
      })
      wx.navigateTo({
        url: '/pages/confirmOrder/confirmOrder',
      })
    }
  }
}))