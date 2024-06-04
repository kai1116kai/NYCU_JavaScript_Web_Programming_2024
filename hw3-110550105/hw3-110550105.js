"use strict";
var num = 1;
const tables = document.getElementById('tables');
tables.className = 'tables';
for (let table_cnt = 0; table_cnt < 6; table_cnt++) {

    // 創建新的表格
    const table = document.createElement('table');
    table.className = 'table';
    const row1 = document.createElement('tr');
    row1.className = 'table_title';
    const table_title = document.createElement('td');
    table_title.colSpan = 8;
    table_title.textContent = '卡片 ' + (table_cnt+1);
    const check_box = document.createElement('input');
    check_box.type = 'checkbox';
    check_box.className = 'check_box';
    table_title.appendChild(check_box);
    row1.appendChild(table_title);
    table.appendChild(row1);
    
    // 在表格中添加一些行和單元格
    num = 1;
    for (let i = 0; i < 4; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 8; j++) {
            const cell = document.createElement('td');
            while(!(num>>table_cnt&1)){
                num++;
            }
            cell.textContent = num; // 填入數字
            num++;
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    // 添加表格
    tables.appendChild(table);
}

var sum=0;
function guess_num(){
    const check_boxs = document.getElementsByClassName('check_box');
    const tables = document.getElementsByClassName('table');
    sum=0;
    for (let i = 0; i < check_boxs.length; i++) {
        if(check_boxs[i].checked){
            const table = tables[i];
            const cells = table.getElementsByTagName('td');
            sum += 1<<i;
            // 顯示答案
        }
    }
    const answer = document.getElementById('ans');
    answer.textContent = '數字總和為 ' + sum;
}
const guess_button = document.getElementById('guess_button');
guess_button.onclick = guess_num;
