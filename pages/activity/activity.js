// pages/activity/activity.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    shopActivity:'',
    imgurl:app.globalData.url2,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.setData({
      id: options.id
    })
    if (options.mid != undefined && options.mid != '') {
      wx.setStorageSync('inviter', options.mid);

    }
    var shopinfo = wx.getStorageSync('shopinfo');
    if (shopinfo == undefined || shopinfo == '') {
      app.login('/pages/activity/activity?id='+this.data.id);

    }
    var icode = wx.getStorageSync('inviter');
    if(icode!=undefined && icode!='' && icode !=null){
      app.bindInviter();
    }
    
    
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var that = this;
    var WxParse = require('../../wxParse/wxParse.js');
    wx.request({
      url: app.globalData.url + '/cy/activity/detail',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        subsid: subsid,
        id:that.data.id
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
         that.setData({
           shopActivity: res.data.results
         })
         WxParse.wxParse('content', 'html', res.data.results.other, that, 5);
        } else {
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
  onShareAppMessage: function (res) {
    var pages = getCurrentPages()    //获取加载的页面

    var currentPage = pages[pages.length - 1]    //获取当前页面的对象

    var url = currentPage.route    //当前页面url
    var shopinfo = wx.getStorageSync('shopinfo');
    var shopname = shopinfo.name
    var icode = wx.getStorageSync('icode');
    var id = this.data.id;
    return {
      title: shopname,
      path: url + '?id='+id+'&mid=' + icode,
      success: function (res) {
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})