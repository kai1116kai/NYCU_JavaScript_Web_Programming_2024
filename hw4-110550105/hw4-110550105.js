"use strict";

// 全局变量，用于存储随机生成的数字
var lotteryNumbers = [];
var stop_period = 1500;

// 全局变量，用于存储計時器的 ID
var interval1, interval2, interval3, interval4, interval5, interval6;

// 隨機生成一個不重複的數字
function generateUniqueNumber(id) {
    var num = Math.floor(Math.random() * 48) + 1;
    if (lotteryNumbers.slice(0,id-1).includes(num)) {
        return generateUniqueNumber(id);
    } else {
        lotteryNumbers[id-1]=num;
        return num;
    }
}

// 更新數字
function updateNumber(Id) {
    document.getElementById('num'+Id).textContent = generateUniqueNumber(Id);
}

// 開始抽獎，每0.2秒更新一個數字，持續一定時間後停止
function draw_num() {
    // 清空數字
    lotteryNumbers = [0,0,0,0,0,0];
    
    // 開始隨機變換數字
    
    interval1 = setInterval(function() { updateNumber(1); }, 200);
    interval2 = setInterval(function() { updateNumber(2); }, 200);
    interval3 = setInterval(function() { updateNumber(3); }, 200);
    interval4 = setInterval(function() { updateNumber(4); }, 200);
    interval5 = setInterval(function() { updateNumber(5); }, 200);
    interval6 = setInterval(function() { updateNumber(6); }, 200);
    
    // 一定時間後停止
    setTimeout(function() { clearInterval(interval1); }, stop_period * 1);
    setTimeout(function() { clearInterval(interval2); }, stop_period * 2);
    setTimeout(function() { clearInterval(interval3); }, stop_period * 3);
    setTimeout(function() { clearInterval(interval4); }, stop_period * 4);
    setTimeout(function() { clearInterval(interval5); }, stop_period * 5);
    setTimeout(function() { clearInterval(interval6); }, stop_period * 6);
}