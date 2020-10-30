var table;
var squareWidth = 50;//每个小方块的宽度，50px;
var boardWidth = 10;//横竖各有多少个小方块
var squareSet = [];//小方块的集合，二维数组
var choose = [];//被选中的小方块的集合
var timer = null;
var baseScore = 5;//基础分
var stepScore = 10;//递增分
var totalScore = 0;
var targetScore = 2000;
var flag = true;//对点击事件加锁，消除过程中不允许有其他的移入和点击操作
var tempSquare = null;//在处理鼠标动作过程中，动作被屏蔽，导致事件处理完成，有不连贯现象

function refresh() {
    for (var i = 0 ; i < squareSet.length ; i ++) {
        for (var j = 0 ; j < squareSet[i].length ; j ++) {
            if (squareSet[i][j] == null) {
                continue;
            }
            squareSet[i][j].row = i;
            squareSet[i][j].col = j;
            squareSet[i][j].style.transition = "left 0.3s, bottom 0.3s";
            squareSet[i][j].style.left = squareSet[i][j].col * squareWidth + "px";
            squareSet[i][j].style.bottom = squareSet[i][j].row * squareWidth + "px";
            squareSet[i][j].style.backgroundImage = "url('./pic/" + squareSet[i][j].num + ".png')";
            squareSet[i][j].style.backgroundSize = "cover";
            squareSet[i][j].style.transform = "scale(0.95)";
        }
    }
}

//创建小方块
function createSquare(value, row, col) {
    var temp = document.createElement("div");
    temp.style.width = squareWidth + "px";
    temp.style.height = squareWidth + "px";
    temp.style.display = "inline-block";
    temp.style.position = "absolute";
    temp.style.boxSizing = "border-box";
    temp.style.borderRadius = "12px";
    temp.num = value;
    temp.row = row;
    temp.col = col;
    return temp;
}

function checkLinked(square, arr) {
    if (square == null) {
        return;
    }
    arr.push(square);
    //判断左边的小方块需不需要被收录进来
    /*
    * 1.不能是最左边的
    * 2.左边得存在一个小块
    * 3.左边的小方块和当前的小方块颜色相同
    * 4.左边的小方块没有被收录进数组
    * */
    if (square.col > 0 && squareSet[square.row][square.col - 1] && squareSet[square.row][square.col - 1].num == square.num && arr.indexOf(squareSet[square.row][square.col - 1]) == -1) {
        checkLinked(squareSet[square.row][square.col - 1], arr);
    }
    if (square.col < boardWidth - 1 && squareSet[square.row][square.col + 1] && squareSet[square.row][square.col + 1].num == square.num && arr.indexOf(squareSet[square.row][square.col + 1]) == -1) {
        checkLinked(squareSet[square.row][square.col + 1], arr);
    }
    if (square.row < boardWidth - 1 && squareSet[square.row + 1][square.col] && squareSet[square.row + 1][square.col].num == square.num && arr.indexOf(squareSet[square.row + 1][square.col]) == -1) {
        checkLinked(squareSet[square.row + 1][square.col], arr);
    }
    if (square.row > 0 && squareSet[square.row - 1][square.col] && squareSet[square.row - 1][square.col].num == square.num && arr.indexOf(squareSet[square.row - 1][square.col]) == -1) {
        checkLinked(squareSet[square.row - 1][square.col], arr);
    }
}

//这个函数是闪啊闪
function flicker(arr) {
    var num = 0;
    timer = setInterval(function () {//循环是为了不断的放大缩小
        for (var i = 0 ; i < arr.length ; i ++) {
            arr[i].style.border = "3px solid #BFEFFF";
            arr[i].style.transform = "scale(" + (0.90 + 0.05 * Math.pow(-1, num)) + ")";
        }
        num ++;
    }, 300);
}

function goBack() {
    if (timer != null) {
        clearInterval(timer);
    }
    for (var i  = 0 ; i < squareSet.length ; i ++) {
        for (var j = 0 ; j < squareSet[i].length ; j ++) {
            if (squareSet[i][j] == null) {
                continue;
            }
            squareSet[i][j].style.border = "0px solid #BFEFFF";
            squareSet[i][j].style.transform = "scale(0.95)";
        }
    }
}
//计算选中这些小方块的总分
function selectScore() {
    var score = 0;
    for (var i = 0 ; i < choose.length ; i ++) {
        score += baseScore + i * stepScore;//基础分加递增分
    }
    if (score <= 0) {
        return;
    }
    document.getElementById("select_score").innerHTML = choose.length + "块 " + score + "分";
    document.getElementById("select_score").style.transition = null;//需要还原,不然的话下一次会渐变出现
    document.getElementById("select_score").style.opacity = 1;
    setTimeout(function() {
        document.getElementById("select_score").style.transition = "opacity 2s";
        document.getElementById("select_score").style.opacity = 0;
    }, 1000);
}

function mouseOver(obj) {//鼠标移动上去的时候，obj代表的是小方块
    if (!flag) {//处于锁定状态不允许有操作
        tempSquare = obj;
        return;
    }
    goBack();
    choose = [];
    checkLinked(obj, choose);
    if (choose.length <= 1) {
        choose = [];
        return;
    }
    flicker(choose);
    selectScore();
}

function move() {
    //向下移动
    for (var i = 0 ; i < boardWidth ; i ++) {
        var pointer = 0;//pointer指向小方块，当遇到null的时候停止，等待上面的小方块落到这里来
        for (var j = 0 ; j < boardWidth ; j ++) {
            if (squareSet[j][i] != null) {
                if (j != pointer) {
                    squareSet[pointer][i] = squareSet[j][i];
                    squareSet[j][i].row = pointer;
                    squareSet[j][i] = null;
                }
                pointer ++;
            }
        }
    }
    //横向移动
    for (var i = 0 ; i < squareSet[0].length ; ) {
        if (squareSet[0][i] == null) {
            for (var j  = 0 ; j < boardWidth ; j ++) {
                squareSet[j].splice(i, 1);
            }
            continue;
        }
        i ++;
    }
    refresh();
}

function isFinish() {
    for (var i = 0 ; i < squareSet.length ; i ++) {
        for (var j = 0 ; j < squareSet[i].length ; j ++) {
            var temp = [];
            checkLinked(squareSet[i][j], temp);//判断周围还是否存在可以消去的小方块
            if (temp.length > 1) {
                return false;
            }
        }
    }
    return true;
}

//总体的初始化方法
function init () {
    table = document.getElementById("pop_star");
    for (var i  = 0 ; i < boardWidth ; i ++) {
        squareSet[i] = new Array();
        for (var j  = 0 ; j < boardWidth ; j ++) {
            var square = createSquare(Math.floor(Math.random() * 5), i, j);//创建小方块，双重循环，i是行，j是列
            square.onmouseover = function () {//鼠标悬停事件,鼠标放在某个小方块上的时候触发
                mouseOver(this);//this指代的是小方块
            }
            square.onclick = function () {//鼠标点击事件
                if (!flag || choose.length == 0) {//处于被锁定状态时，不允许有操作的
                    return;
                }
                flag = false;//开始执行点击事件了，所以从这时起，加锁，不再执行任何点击和移入事件
                tempSquare = null;
                //加分数
                var score = 0;
                for (var i = 0 ; i < choose.length ; i ++) {
                    score += baseScore + i * stepScore;//基础分加递增分
                }
                totalScore += score;
                document.getElementById("now_score").innerHTML = "当前分数：" + totalScore;
                //消灭星星
                for (var i = 0 ; i < choose.length ; i ++) {
                    (function(i) {
                        setTimeout(function () {
                            squareSet[choose[i].row][choose[i].col] = null;
                            table.removeChild(choose[i]);
                        }, i * 100);
                    })(i);

                }
                //移动
                setTimeout(function () {
                    move();
                    //判断结束
                    setTimeout(function() {
                        var is = isFinish();
                        if (is) {
                            if (totalScore > targetScore) {
                                alert("牛哇王晨晨！你很有游戏天赋");
                            } else {
                                alert("菜菜菜！你需要重新来过");
                            }
                        } else {
                            choose = [];
                            flag = true;//在所有动作都执行完成之后释放锁
                            mouseOver(tempSquare);
                        }
                    }, 300 + choose.length * 150);
                }, choose.length * 100);

            }
            squareSet[i][j] = square;
            table.appendChild(square);
        }
    }

    refresh();
}

window.onload = function () {
    init();
}