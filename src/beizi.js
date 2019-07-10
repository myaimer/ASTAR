var Beizi = cc.Sprite.extend({
    ctor:function (url,index) {
        this._super(url);
        this.setControl();
        this.index = index;
    },

    setControl:function () {
        var that = this;
        var listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowtouches:true,
            onTouchBegan:function (touch,event) {
                if(cc.vv.CUPLOCK){
                    return;
                }
                var pos = touch.getLocation();
                var rect = cc.rect(0,0,that.width,that.height)
                pos = that.convertToNodeSpace(pos);
                if(cc.rectContainsPoint(rect,pos)){
                    that.parent.onClick(that);
                }

                return true;
            },
        })
        cc.eventManager.addListener(listener,this);
    }
})