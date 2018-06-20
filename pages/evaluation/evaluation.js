// pages/evaluation/evaluation.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    screenType:'',
    flag2: 5,
    selects:'',
    evaluations:[
      {
        prologo:'/image/product.png'
      }
    ],
    items:[
      {
        value:'匿名评价',
        name: 'evaluation', 
        checked: 'true'
      }
    ],
    reportevalu:[],
    imgDomain: app.globalData.url2,
    comments:[],
    anonymity:1,
    photos:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id;
    this.setData({'oid':id});
    this.getGoods(id);
  },
  
  hideshade: function () {
    this.setData({
      screenType: ''
    })
  },
  checkboxChange: function (e) {
    this.setData({
      anonymity: e.detail.value
    })
  },
  changeColor11: function (event) {
    var index = event.target.dataset.index;
    var comments = this.data.comments;
    var comment = comments[index];
    comment.star = 1;
    comments[index] = comment;
    this.setData({comments:comments});
  },
  changeColor12: function (event) {
    var index = event.target.dataset.index;
    var comments = this.data.comments;
    var comment = comments[index];
    comment.star = 2;
    comments[index] = comment;
    this.setData({ comments: comments });
  },
  changeColor13: function (event) {
    var index = event.target.dataset.index;
    var comments = this.data.comments;
    var comment = comments[index];
    comment.star = 3;
    comments[index] = comment;
    this.setData({ comments: comments });
  },
  changeColor14: function (event) {
    var index = event.target.dataset.index;
    var comments = this.data.comments;
    var comment = comments[index];
    comment.star = 4;
    comments[index] = comment;
    this.setData({ comments: comments });
  },
  changeColor15: function (event) {
    var index = event.target.dataset.index;
    var comments = this.data.comments;
    var comment = comments[index];
    comment.star = 5;
    comments[index] = comment;
    this.setData({ comments: comments });
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
  getGoods:function(oid){
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var that = this;
    wx.request({
      url: app.globalData.url+'/cy/comment/goods',
      method:'post',
      data:{
        shopid:shopid,
        openid:openid,
        id:oid
      },
      success:function(res){
        if(res.data.errorCode==0){
          that.setData({ evaluations:res.data.results});
          that.initComments(res.data.results);
        }
      }
    })
  },
  initComments: function (evaluations){
    var comments = [];
    var elen = evaluations.length;
    for(var i=0;i<elen;i++){
      var tmp = { gid: evaluations[i].id,star:5};
      comments.push(tmp);
    } 
    this.setData({comments:comments});
  },
  formSubmit:function(e){
    var _this = this;
    var openid = wx.getStorageSync('openid');
    var shopid = wx.getStorageSync('shopid');
    var subsid = wx.getStorageSync('subsid');
    var id = this.data.oid;
    var comments = this.data.comments;
    var anonymity = this.data.anonymity;
    wx.request({
      url: app.globalData.url+'/cy/comment/post',
      method:'post',
      data:{
        openid:openid,
        shopid:shopid,
        id:id,
        comments:comments,
        anonymity: anonymity,
      },
      success:function(res){
        if(res.data.errorCode==0){
          _this.setData({ screenType:1});
          wx.navigateBack({
            
          });
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

  chooseImg:function(event){
    var index = event.target.dataset.index;
    var comments = this.data.comments;
    var comment = comments[index];
    if (comment.photos==undefined){
      comment.photos = [];
    }
    var that = this;
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        wx.uploadFile({
          url: app.globalData.url+'/file/upload', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          success: function (res) {
            console.log(res.data);
            var result = JSON.parse(res.data);
            if (result.errorCode==0){
              comment.photos.push(result.results);
              comments[index] = comment;
              that.setData({ comments: comments});
              // console.log(comments);
            }
            
          },fail:function(res){
            console.log(res);
          }
        })
      },fail:function(res){
        console.log(res);
      }
    })
  },
  comments:function(e){
    var comment = e.detail.value;
    var index = e.target.dataset.index;
    var comments = this.data.comments;
    comments[index].comments = comment;
    this.setData({comments:comments});
  }
})