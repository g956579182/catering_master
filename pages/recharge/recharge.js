// pages/recharge/recharge.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    amount:0
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

  setAmount:function(event){
    var amount = event.detail.value;
    console.log(amount);
    this.setData({amount:amount});
  },
  charge:function(){
    var that = this;
    var amount = this.data.amount;
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0){
      wx.showToast({
        title: '请输入正确的充值金额' + parseFloat(amount),
      })
      return false;
    }
    wx.showModal({
      title: '提示',
      content: '确认充值',
      success: function (sm) {
        if (sm.confirm) {
          var ext = wx.getExtConfigSync();
          var shopid = ext.shopid;
          var openid = wx.getStorageSync('openid');
          wx.request({
            url: app.globalData.url+'/cy/member/charge',
            method:'post',
            data:{
              shopid:shopid,
              openid:openid,
              amount:amount
            },
            success:function(res){
              if(res.data.errorCode==0){
                var results = res.data.results;
                if (results.result_code == 'SUCCESS' && results.return_code=='SUCCESS'){
                  
                  wx.requestPayment({
                    timeStamp: results.timeStamp,
                    nonceStr: results.nonceStr,
                    package: results.package,
                    signType: results.signType,
                    paySign: results.paySign,
                    success:function(res){
                      wx.navigateBack();
                    }
                  });

                }
              }else{
                wx.showToast({
                  title: res.data.errorStr,
                })
              }
            }
          })
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
   
  }
})