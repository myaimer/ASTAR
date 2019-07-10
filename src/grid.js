/**
 Created by ming on 2019/5/24
 * */
const  CLOSE = 'CLOSE';
const OPEN = 'OPEN';
const UNKNOWN = 'UNKNOWN';

//代价计算规则
const LINE_DISTANCE = 20;
const DIAGONAL_DISTANCE = Math.sqrt(LINE_DISTANCE * LINE_DISTANCE)|0;

//合法相邻位置之间的下标偏移量(8个方向)
const DIR = [[-1,0],[1,0],[0,-1],[0,1],[1,1],[-1,-1],[1,-1],[-1,1]];

//计算曼哈顿距离
function manhattan (index,endIndex){
    this.endIndex = endIndex;
    return (Math.abs(index[0] - endIndex[0]) + Math.abs(index[1] - endIndex[1]))*10;
};

//越界检查
function checkIndex (idx,dir,row,line){
    var target = [idx[0] + dir[0],idx[1] + dir[1]];
    return target[0] >= 0 && target[0] < row  && target[1] >= 0 && target[1] < line;
};


var Grid = cc.Class.extend({
    ctor:function (idx,rect,type,gridList) {
        //当前方格的下标
        this.index = idx;
        //当前方格在场景中对应的覆盖区域
        this.rect = rect;
        //当前方格的类型
        this.type = type;
        //当前方格的状态
        this.state = UNKNOWN;
        this.gridList = gridList;
        this.midPos = cc.p(rect.x+rect.width/2,rect.y+rect.height/2);
        //当前方格的父方格
        this.par = null;
        //方格的估值数据
        this.hasCost = 0;
        this.remainCost = 0;
        this.totalCost = 0;
        return true;
    },

    //再次点击重置使用
    init:function () {
        this.state=UNKNOWN;
        this.par=null;
        this.hasCost=0;
        this.remainCost=0;
        this.totalCost=0;
    },

    //计算代价(当一个方格被放进开放列表是，也就是说它有了一个父方格,才可以计算)
    calcCost:function(endIndex){
        //剩余代价
        this.remainCost = manhattan(this.index,endIndex);
        //已消耗的代价
        var distance ;
        if(Math.abs(this.index[0] - this.par.index[0]) + Math.abs(this.index[1] - this.par.index[1]) === 1){
            distance = LINE_DISTANCE;
        }else{
            distance = DIAGONAL_DISTANCE;
        }
        this.hasCost = this.par.hasCost + distance;
        //总代价
        this.totalCost = this.hasCost + this.remainCost;
    },

    //获取所有方格的合法邻居
    getNeighbor:function(){
        var neighbor = [];
        for(var i = 0;i < DIR.length;i++){
            var dir = DIR[i];
            // 越界排除
            if(!checkIndex(this.index,dir,this.gridList.length,this.gridList[0].length)){
                continue;
            }
            var target = [this.index[0] + dir[0],this.index[1] + dir[1]];
            var node = this.gridList[target[0]][target[1]];
            // close状态排除
            if(node.state === CLOSE){
                continue;
            }
            // 障碍排除
            if(node.type === BARRIER){
                continue;
            }
            // 挂角排除
            if(Math.abs(dir[0]) === Math.abs(dir[1])
                && (this.gridList[this.index[0] + dir[0]][this.index[1]].type === BARRIER
                    || this.gridList[this.index[0]][this.index[1] + dir[1]].type === BARRIER)	){
                continue;
            }
            neighbor.push(node);
        }
        return neighbor;
    },

});

//寻路模块  核心逻辑
function AStart (START,END,gridList){
    var count = 0;
    for(var i=0;i<gridList.length;i++){
        for(var j=0;j<gridList[0].length;j++){
            gridList[i][j].init();
        }
    };
    var path = [];
    //将起点方格放进锅里
    var openList = [START];
    //确定当前搜索的位置
    var curStep = START;
    //开始寻路
    search();

    function search(){
        if(count > gridList.length * gridList[0].length ){
            cc.log('死循环了');
            return;
        }

        //找出当前方块的所有邻居
        var neighbor = curStep.getNeighbor();
        //判断找到的邻居中有没有终点
        var index = neighbor.indexOf(END);
        if(index > -1){
            //说明找到了，准备绘制路径
            END.par = curStep;
            curStep = END;
            drawPath();
            return;
        }else{
            for(var i = 0;i < neighbor.length;i++){
                if(neighbor[i].state === OPEN){
                    var clone = Object.create(neighbor[i]);
                    clone.par = curStep;
                    clone.calcCost(END.index);
                    if(clone.totalCost < neighbor[i].totalCost){
                        neighbor[i].par = curStep;
                        neighbor[i].calcCost(END.index);
                    }
                }else{
                    //如果之前不在开放列表里面的，就添加到开放列表
                    addNodeToOpenList(neighbor[i],curStep)
                }
            }
        }
        //将当前方块关闭
        removeNodeFromOpenList(curStep);
        //决定下一步走哪个方块
        //首先将开放列表中的方格对象，按照总代价从小到大排序
        if(openList.length > 0){
            openList.sort(function(a,b){return a.totalCost - b.totalCost});
            curStep = openList[0];
            search();
        }else{
            cc.log('寻路失败，死球了！！！');
        }

    }

    //往开放列表里面添加节点
    function addNodeToOpenList (node,par){
        count ++;
        //指定它的上一格
        node.par = par;
        //计算它的代价
        node.calcCost(END.index);
        //放入开放列表
        openList.push(node);
        //更新开启或关闭状态
        node.state = OPEN;
    }
    //从开放列表里面删除节点
    function removeNodeFromOpenList (node){
        var index = openList.indexOf(node);
        node.state = CLOSE;
        openList.splice(index,1);
    }
    //绘制路径
    function drawPath  (){
        var p = END;
        while(p){
            path.unshift(p.index);
            p = p.par;
        }
    }

    return path;
};




