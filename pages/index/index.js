// pages/index/index.js

const app = getApp()
const utils = require('../../utils/utils.js')
const constants = require('../../data/constants.js')
const store = require('../../data/store.js')
const client = require('../../services/client.js')

Page({

  /* 
    说明：页面数据集合
  */
  data: {
    cards: 0,
    duration: 0,
    popuped: false,
    actived: 0
  },

  /* 
    说明：页面加载事件
  */
  onLoad: function(){

    var wp = this;

    store.awaitAuthorize(function(){

      wp.setData({
        cards: store.client.cards,
        duration: store.client.duration,
        actived: store.client.actived
      });
    });
  },

  /* 
    说明：开始游戏事件 [ 授权 ]
  */
  onGetUserInfo: function(res){

    var wp = this;

    if (this.data.actived == 1){
      client.mine.setUserInfo(res.detail.userInfo, function (data) {

        wp.onStart();
      });
    }
  },

  /* 
    说明：开始游戏事件
  */
  onStart: function () {

    if (this.data.actived == 1) {
      if (store.client.status == 200){
        this.selectComponent('#dialog').show();
      } else {
        wx.navigateTo({
          url: '/pages/game/index',
        });
      }
    }
  },

  /* 
    说明：排行榜事件
  */
  onRank: function(){

    if (this.data.actived == 1) {
      wx.navigateTo({
        url: '/pages/rank/index',
      });
    }
  },

  /* 
    说明：使用复活卡继续答题事件
  */
  onContinue: function(){

    var wp = this;

    if (this.data.cards) {
      client.game._continue(function (data) {

        store.client = data || {};

        wp.selectComponent('#dialog').close();
        wp.onStart();
      });
    } else {
      wx.showToast({
        title: '没有复活卡',
      })
    }
  },

  /* 
    说明：重新开始答题事件
  */
  onRestart: function () {

    var wp = this;
    var callback = function (data) {

      store.client = data || {};

      wp.selectComponent('#dialog').close();
      wp.onStart();
    }

    if (this.data.duration < 2) {
      client.game.restart(callback);
    } else {
      wx.showModal({
        title: '操作提示',
        content: '重新开始会清除之前的成绩，确定要重新开始吗？',
        success: function (res) {

          if (res.confirm) {
            client.game.restart(callback);
          }
        }
      })
    }
  },

  /*
    说明：分享回调事件
  */
  onShareAppMessage: function (res) {
    
    return client.shareAppMessage(res, {}, function(){ });
  }
})
