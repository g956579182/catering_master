// pages/myRecord/myRecord.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nomore:false,
    page:1,
    logs:[],
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
    this.getLog();
  },
  /**
  * 交易记录 
  */
  getLog:function(){
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var that = this;
    var page = this.data.page;
    wx.request({
      url: app.globalData.url+'/cy/member/logs',
      method:'post',
      data:{
        shopid:shopid,
        openid:openid,
        page:page
      },
      success:function(res){
        if(res.data.errorCode == 0){
          var list = res.data.results.data;
          var len = list.length;
          var logs = that.data.logs;
          for(var i=0;i<len;i++){
            logs.push(list[i]);
          }
          that.setData({logs:logs});
          if(page>=res.data.results.last_page){
            that.setData({nomore:true});
          }else{
            that.setData({page:page+1});
          }

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
    if(!this.data.nomore){
      this.getLog();
    }
  },

})