/**
Created by ming on 2019/5/24
 * */

//类型标签
const BARRIER = 'barrier';
const BLANK = 'blank';


var AstarLayer = cc.Layer.extend({
    //指定单元格的宽高
    wid:20,
    hei:20,
    map:[],                   //地图抽象数据
    barrierList:[],         //打飞机对象列表
    gridList:[],            //格子列表
    barrierRect:[],         //障碍物方块大小列表
    barrierGridList:[],   //障碍物小格子对象列表

    ctor:function () {
        this._super();
        var size = cc.winSize;

        this.bg = new cc.LayerColor(cc.color(25,20,50),size.width,size.height);
        this.addChild(this.bg);

        this.draw = new cc.DrawNode();
        this.addChild(this.draw);

        this.draw2 = new cc.DrawNode();
        this.addChild(this.draw2);

        this.draw3 = new cc.DrawNode();
        this.addChild(this.draw3);

        this.init();
        this.touch();

        return true;
    },

    //初始化
    init:function () {
        //创建障碍物
        this.createBarrier(res.plane_1,this.bg,cc.p(500,300));
        this.createBarrier(res.plane_2,this.bg,cc.p(400,600));
        this.createBarrier(res.plane_3,this.bg,cc.p(900,400));

        //初始化map数据
        this.row = this.bg.height / this.hei;
        this.line = this.bg.width / this.wid;
        for(var i = 0;i < this.row;i++){
            this.map[i] = [];
            this.gridList[i] = [];
            for(var j = 0;j < this.line;j++){
                var rect = cc.rect(j * this.wid,i * this.hei,this.wid,this.hei);
                this.fill = null;
                this.color = cc.color(100,0,125);
                this.map[i][j] = BLANK;
                if(!this.checkIsBlank(rect)){
                    this.color = cc.color.BLACK;
                    this.map[i][j] = BARRIER;
                }
                //设置出发位置颜色
                if(i == 0 && j == 0){
                    this.fill = cc.color.YELLOW;
                }
                this.draw.drawRect(
                    cc.p(rect.x, rect.y),
                    cc.p(rect.x + rect.width, rect.y + rect.height),
                    this.fill, 2, this.color);

                var grid = new Grid([i,j],rect,this.map[i][j],this.gridList);
                if(this.map[i][j] === BARRIER){
                    this.barrierGridList.push(grid) ;
                }
                this.gridList[i][j] = grid;
            }
        };
        this.START = this.gridList[0][0];

        this.bomb = new cc.Sprite(res.bomb);
        this.bomb.setPosition(cc.p(0,0));
        this.bomb.scale = 0.5;
        this.addChild(this.bomb);

    },

    //创建障碍物
    createBarrier:function (url,par,pos) {
        var br = new cc.Sprite(url);
        br.setPosition(pos);
        br.scale = 1.5;
        par.addChild(br);
        this.barrierList.push(br);

    },

    //检测指定区域是否为障碍物
    checkIsBlank:function (rect) {
        var isBlank = true;
        for(var i = 0;i < this.barrierList.length;i++){
            if(cc.rectIntersectsRect(rect,this.barrierList[i].getBoundingBox())){
                isBlank = false;
                this.barrierRect[i] = cc.rect(this.barrierList[i].x - this.barrierList[i].width / 2,
                    this.barrierList[i].y - this.barrierList[i].height / 2,
                    this.barrierList[i].width,this.barrierList[i].height);
                break;
            }
        }
        return isBlank;
    },

    //改变方块颜色
    changeGridColor:function (pos,fill) {
        for(var i = 0;i < this.gridList.length;i++){
            for(var j = 0;j < this.gridList[i].length;j++){
                if(cc.rectContainsPoint(this.gridList[i][j].rect,pos)){
                    this.draw2.drawRect(
                        cc.p(this.gridList[i][j].rect.x, this.gridList[i][j].rect.y),
                        cc.p(this.gridList[i][j].rect.x + this.gridList[i][j].rect.width,
                            this.gridList[i][j].rect.y + this.gridList[i][j].rect.height),
                        fill, 2, this.color);
                    this.END = [i,j];

                    break;
                }
            }
        }
        return this.END;
    },

    //点击事件
    touch:function () {
        var that = this;
        var listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowtouches:true,
            onTouchBegan:function (touch,event) {
                that.draw2.clear();
                that.draw3.clear();
                var endPos = touch.getLocation();
                var End = that.changeGridColor(endPos,cc.color.RED);
                //todo 先判断点击的点是否在障碍物内部，在内部就生成最近的可行走的点
                // if(that.gridList[End[0]][End[1]].type === BARRIER){
                //     End = that.findGoodNeighbor(End);
                // }

                that.draw2.drawSegment(that.START.midPos, that.gridList[End[0]][End[1]].midPos,1,cc.color.YELLOW);
                //todo 再判断是走直线，还是A星寻路(已写)
                //检查能不能走直线
                var isWalkLine = that.checkWay(that.START.midPos,endPos);
                if(isWalkLine){
                    that.draw3.drawSegment(that.START.midPos, that.gridList[End[0]][End[1]].midPos,3,cc.color.BLUE);
                }else {
                    var path = AStart(that.START,that.gridList[End[0]][End[1]],that.gridList);
                    that.showPath(path);
                    // that.autoMove(path);
                }

                return true;
            },
            onTouchMoved:function (touch,event) {

                return true;
            },
            onTouchEnded:function (touch,event) {
                // that.draw2.clear();
                return true;
            },
        })
        cc.eventManager.addListener(listener,this);
    },

    //显示路径
    showPath:function (path){
        for(var i = 0;i < path.length - 1;i++){
            this.draw3.drawSegment(
                cc.p(this.gridList[path[i][0]][path[i][1]].midPos),
                cc.p(this.gridList[path[i+1][0]][path[i+1][1]].midPos),
                3,cc.color.GREEN);
        }
    },

    //检查路线
    checkWay:function (startPos,endPos) {
        var isWalkLine = true;
        for(var i = 0;i < this.barrierGridList.length;i++){
            var rect = this.barrierGridList[i].rect;
            //判断点击终点是否在障碍物内部
            if(cc.rectContainsPoint(rect,endPos)){
                isWalkLine = false;
                break;
            };
            //判断是否与障碍物的两条对角线相交
            var line1 = {start:startPos,end:endPos};
            var line2 = {start:cc.p(rect.x,rect.y),end:cc.p(rect.x+rect.width,rect.y+rect.height)};
            var line3 = {start:cc.p(rect.x,rect.y+rect.height),end:cc.p(rect.x+rect.width,rect.y)};
            if(this.checkCross(line1,line2) || this.checkCross(line1,line3)){
                isWalkLine = false;
                break;
            }
        };
        return isWalkLine;
    },

    //检查两条线段是否相交
    checkCross:function (line1,line2) {
        //证明line2的两个端点在line1的两侧(或者之上)
        var p1 = sub(line1.start,line1.end); //AB
        var p2 = sub(line1.start,line2.start); //AC
        var p3 = sub(line1.start,line2.end);  //AD
        var r1 = cross(p1,p2) * cross(p1,p3);
        //证明line1的两个端点在line2的两侧(或者之上)
        p1 = sub(line2.start,line2.end);  //CD
        p2 = sub(line2.start,line1.start);  //CA
        p3 = sub(line2.start,line1.end);  //CB
        var r2 = cross(p1,p2) * cross(p1,p3);

        //向量相减
        function sub(v1,v2) {
            return {x:v2.x - v1.x,y:v2.y - v1.y};
        };
        //向量叉乘
        function cross(v1,v2){
            return v1.x * v2.y - v1.y * v2.x;
        };

        //如果前面两个证明的额结果都是小于等于0，则两条线段相交
        return (r1 <= 0 && r2 <= 0);
    },


    //发现好邻居
    findGoodNeighbor:function (endIndex) {
        var target = null;
        var Index = [];
        var distance = [];
        var dir = [[1,0],[-1,0],[0,-1],[0,1]];
        var distanceList = [];
        for(var i = 0;i < dir.length;i++){
            Index[i] = goodNeighbor(dir[i],endIndex);
            distance[i] = manhattan(endIndex,Index[i]);
            distanceList.push(distance[i]);
        }
        distanceList.sort(function (a,b) { return a-b });
        target = distanceList[0].endIndex;

        function goodNeighbor(dir,endIndex) {
            var index = [dir[0]+endIndex[0],dir[1]+endIndex[1]];
            if(this.gridList[index[0]][index[1]].type === BLANK ){
                return index;
            }
            goodNeighbor(dir,index);
        }

        return target;
    },

    //炸弹移动
    autoMove:function (path) {
        var path = path;
        var index = path.length -1;
        if(index >= 0){
            index --;
            var callback = cc.callFunc(function () {
                this.bomb.runAction(
                    cc.sequence(
                        cc.moveTo(0.1,this.gridList[path[index][0]][path[index][1]].midPos)),
                         callback
                    )
            }.bind(this));
        }

        this.bomb.runAction(
            cc.sequence(
                cc.moveTo(0.1,this.gridList[path[0][0]][path[0][1]].midPos)),
                 callback
            );

    }

})


var AstarScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new AstarLayer();
        this.addChild(layer);
    }
})