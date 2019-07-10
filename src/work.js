var workLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        var size = cc.winSize;


        var star = [];
        for(var i =0;i<800;i++){
            var m = Math.random()*size.width;
            var n = Math.random()*size.height;
            star[i] = new cc.Sprite(res.star);
            star[i].attr({
                x:m,
                y:n,
                scale: Math.random()*0.4+0.1
            })
            this.addChild(star[i],1);

            star[i].runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.rotateBy(Math.random()*2, 360),
                        cc.fadeOut(Math.random()*2.5),
                        cc.fadeIn(Math.random()*2.5)
                    )
                )
            )

        };


        var moon = new cc.Sprite(res.moon);
        moon.x = size.width/6;
        moon.y = size.height-100;
        moon.scale = 0.1;
        this.addChild(moon,2);

        moon.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.spawn(
                        cc.moveBy(4, cc.p(size.width-220, -size.height/6)),
                        cc.scaleTo(4, 0.15, 0.15)
                    ),
                    cc.spawn(
                        cc.moveTo(4,size.width/6,size.height-100),
                        cc.scaleTo(4, 0.05, 0.05)
                    )
                )
            )
        )

        var label = new cc.LabelTTF("Star Night", "Arial", 25);
        label.x = size.width/2;
        label.y = 0;
        this.addChild(label,3);

        label.runAction(
            cc.spawn(
                cc.moveBy(2.5, cc.p(0, size.height - 40)),
                cc.tintTo(2.5,255,125,0)
            )
        )








    }

})


var workScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new workLayer();
        this.addChild(layer);
    }
})