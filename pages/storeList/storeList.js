// pages/storeList/storeList.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopList:[],
    imgDomain: app.globalData.url2,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取分店的列表
    this.getShopList();

  },

  //获取店铺列表
  getShopList: function () {
    let _this = this;
    let openid = wx.getStorageSync('openid');
    let shopid = wx.getStorageSync('shopid');
    wx.request({
      url: app.globalData.url+'/cy/subs',
      method:'post',
      data:{
        'openid':openid,
        'shopid':shopid,
        'page':'-1',
      },
      success:function(res){
        if(res.data.errorCode==0){
          console.log("获取店铺列表成功");
          _this.setData({shopList:res.data.results.data})
        }
      }
    })
  },
  //获取分店id
  getSubsid: function (event) {
    wx.setStorage({
      key: 'subsid',
      data: event.currentTarget.dataset.subsid,
      success: function () {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    })
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

  //查看位置
  lookLocation: function (event) {
    let coordinate = event.currentTarget.dataset.location;
    let arr = coordinate.split(',');
    wx.openLocation({
      latitude: parseInt(arr[0]),
      longitude: parseInt(arr[1]),
      scale: 28
    })
  },
  //拨打电话
  calling: function (event) {
    let phoneNumber = event.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phoneNumber,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  }
})