cc.vv = cc.vv || {};
cc.vv.CUPLOCK = true;  //杯子的锁
cc.vv.BUTTONLOCK = false;  //按钮的锁


var GohomeLayer = cc.Layer.extend({
    beiziList:[], //杯子的列表
    NUM:3,//杯子数量
    EXNUM:5, //初始交换次数
    SCORE:0, //分数

    ctor:function () {
        this._super();
        this.size = cc.winSize;
        this.step = 0;

        var zhuozi = new cc.Sprite(res.zhuozi);
        zhuozi.attr({
            x:this.size.width/2,
            y:this.size.height/2,
            scaleX:this.size.width / zhuozi.width,
            scaleY:this.size.height / zhuozi.height
        })
        this.addChild(zhuozi);


        this.ball = new cc.Sprite(res.ball);
        this.ball.x = this.size.width/ 2;
        this.ball.y = this.size.height/ 2 + 30;
        this.ball.scale = 0.4;
        this.addChild(this.ball);

        for(var i = 0;i < this.NUM;i++){
            var beizi = new Beizi(res.beizi,i);
            beizi.x = 350 + i * 250;
            beizi.y = this.size.height/ 2 + 200;
            beizi.scale = 0.6;
            beizi.opacity = 100;
            this.addChild(beizi);
            this.beiziList.push(beizi);
        }

        var button = new cc.MenuItemImage(
            res.go_1,
            res.go_2,
            function () {
                if(cc.vv.BUTTONLOCK){
                    return;
                }else {
                    this.cupDown();
                    setTimeout(function () {
                        this.exchange();
                        cc.vv.CUPLOCK = false;
                    }.bind(this),2000);
                }

            }, this);
        button.attr({
            x: this.size.width/2,
            y: this.size.height/2 - 200,
        });

        var menu = new cc.Menu(button);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu);

        this.label = new cc.LabelTTF("得分：0", "宋体", 38);
        this.label.x = this.size.width / 2;
        this.label.y = this.size.height / 2-100;
        this.label.color = cc.color.RED;
        this.addChild(this.label);


    },

    //杯子降落
    cupDown:function () {
        for(var i = 0;i < this.NUM;i++){
            this.beiziList[i].runAction(cc.moveTo(1,this.beiziList[i].x,this.size.height/ 2+100));
        }
    },

    //杯子上升
    cupUp:function () {
        for(var i = 0;i < this.NUM;i++){
            this.beiziList[i].runAction(cc.moveTo(1,this.beiziList[i].x,this.size.height/ 2+200));
        }
    },

    //杯子交换
    exchange:function () {
        this.step = 0;
        var callback = cc.callFunc(function () {
            this.step ++;
            if(this.step < this.EXNUM + (this.SCORE * 3)){
                var ran = [0,1,2];
                ran.sort(function (a,b) {return Math.random() - 0.5  });
                var num1 = ran.shift();
                var num2 = ran.shift();
                if(num1 == 1){
                    this.ball.runAction(cc.moveTo(0.52 /(1+ this.SCORE),this.beiziList[num2].x,this.ball.y));
                }
                if(num2 == 1){
                    this.ball.runAction(cc.moveTo(0.52/(1+ this.SCORE),this.beiziList[num1].x,this.ball.y));
                }
                this.beiziList[num1].runAction(cc.moveTo(0.5/(1+ this.SCORE),this.beiziList[num2].x,this.beiziList[num2].y));
                this.beiziList[num2].runAction(
                    cc.sequence(
                        cc.moveTo(0.55/(1+ this.SCORE),this.beiziList[num1].x,this.beiziList[num1].y),
                        callback
                    )
                );
            }
        }.bind(this));

        var ran = [0,1,2];
        ran.sort(function (a,b) {return Math.random() - 0.5  });
        var num1 = ran.shift();
        var num2 = ran.shift();
        if(num1 == 1){
            this.ball.runAction(cc.moveTo(0.52/(1+ this.SCORE),this.beiziList[num2].x,this.ball.y));
        }
        if(num2 == 1){
            this.ball.runAction(cc.moveTo(0.52/(1+ this.SCORE),this.beiziList[num1].x,this.ball.y));
        }
        this.beiziList[num1].runAction(cc.moveTo(0.5/(1+ this.SCORE),this.beiziList[num2].x,this.beiziList[num2].y));
        this.beiziList[num2].runAction(
            cc.sequence(
                cc.moveTo(0.55/(1+ this.SCORE),this.beiziList[num1].x,this.beiziList[num1].y),
                callback
            )
        );
    },

    //杯子的点击变色
    onClick:function (cup) {
        this.cupUp();
        if(cup.index === this.beiziList[1].index){
            this.SCORE ++;
            this.label.string = "得分：" + this.SCORE;
            var temp = cup.color;
            cup.color = cc.color.GREEN;
            setTimeout(function () {
                cup.color = temp;
            },1000);

        }else {
            this.SCORE = 0;
            this.label.string = "得分：" + this.SCORE;
            var temp = cup.color;
            cup.color = cc.color.RED;
            setTimeout(function () {
                cup.color = temp;
            },1000);
        }
    }
})


var GohomeScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GohomeLayer();
        this.addChild(layer);
    }
})