"use strict";
let offset = { x: 0, y: 0 };
let highestZIndex = 1; // Initialize the variable to track highest z-index
let brick_cnt = 0;
const tolerance = { x: 18, y: 13 };
var cur_brick = null;
var cur_Brick = null;
let left_max_limit = 600;
let top_min_limit = 50;
let root_left_min = 150;
let mid_block_pos = { x: 0, y: 0 };
const start_brick_pos = { x: 170, y: 70 };
let now_running = false;
let fin_run = false;
let already_gen_map = false;
let collected_coin = 0;
const sleep_time = 1000;
let cur_rule_page = 1;
let coin_map = [];

document.querySelectorAll('.clickable-brick').forEach(brick => {
    brick.addEventListener('mousedown', startDrag);
});


class Brick {
    constructor(id, num) {
        this.id = id;
        this.num = num;
        this.parent = null;
        this.child = null;
        this.left = 0;
        this.top = 0;
        this.zIndex = 0;
        this.exist = true;
        this.type = "normal";
        this.for_parent = null;
        this.for_times = 0;
    }
}

let Brick_list = [];
let avail_id = [];

function logAll() {
    for (let i = 0; i < Brick_list.length; i++) {
        //log num parent child zIndex type
        console.log('i:'+i+' num:' + Brick_list[i].num + ' parent:' + Brick_list[i].parent + ' child:' + Brick_list[i].child + ' zIndex:' + Brick_list[i].zIndex + ' type:' + Brick_list[i].type + ' exist:' + Brick_list[i].exist);
    }
    if (avail_id.length > 0) {
        let tmp_output = 'AVAIL: ';
        for (let i = 0; i < avail_id.length; i++) {
            tmp_output += avail_id[i] + ' ';
        }
        console.log(tmp_output);
    }
}
function get_new_id() {
    if (avail_id.length == 0) {
        brick_cnt++;
        return brick_cnt - 1;
    }
    else {
        return avail_id.pop();
    }
}

function update_pos(brick_num) {
    //console.log('update_pos: ' + brick_num);
    let update_brick = Brick_list[brick_num];
    let tmp = document.getElementById(update_brick.id);
    tmp.style.left = update_brick.left + 'px';
    tmp.style.top = update_brick.top + 'px';
    tmp.style.zIndex = update_brick.zIndex;
}

function init_startbrick() {
    let start_brick = document.getElementById('brick_0');
    brick_cnt++;
    let start_Brick = new Brick('brick_0', 0);
    start_Brick.left = start_brick_pos.x;
    start_Brick.top = start_brick_pos.y;
    start_Brick.zIndex = 1;
    highestZIndex++;
    Brick_list.push(start_Brick);
    update_pos(0);
    start_brick.addEventListener('mousedown', startDrag);
}

function update_body_height() {
    let body = document.body;
    let highest_brick = 0;
    for (let i = 0; i < Brick_list.length; i++) {
        if (Brick_list[i].exist && Brick_list[i].top > highest_brick) {
            highest_brick = Brick_list[i].top;
        }
    }
    body.style.height = Math.max(highest_brick + 400, window.innerHeight) + 'px';
}

function startDrag(event) {
    if (now_running) {
        return;
    }
    const target = event.target;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Update z-index to bring the dragged brick to the top
    highestZIndex += 1;
    target.style.zIndex = highestZIndex;

    const rect = target.getBoundingClientRect();
    offset.x = rect.width / 2;
    offset.y = rect.height / 2;
    cur_brick = target;
    if (target.classList.contains('gen-brick')) {
        console.log('click gen brick')
        cur_brick = target.cloneNode(true);
        cur_brick.classList.remove('gen-brick'); // Remove parent class from cloned brick
        cur_brick.style.position = 'absolute';
        //set id="brick_" + brick_cnt
        let tmp_id = get_new_id();
        cur_brick.id = 'brick_' + tmp_id;
        cur_Brick = new Brick(cur_brick.id, tmp_id);
        cur_Brick.left = event.clientX - offset.x;
        cur_Brick.top = event.clientY - offset.y;
        cur_Brick.zIndex = highestZIndex;
        if (tmp_id == brick_cnt) {
            Brick_list.push(cur_Brick);
        } else {
            Brick_list[tmp_id] = cur_Brick;
        }
        document.body.appendChild(cur_brick);
        update_pos(tmp_id);
        if (target.classList.contains('for-brick')){
            let tmp_child_id = get_new_id();
            let tmp_child_brick = target.cloneNode(true);
            tmp_child_brick.id = 'brick_' + tmp_child_id;
            tmp_child_brick.classList.remove('gen-brick');
            tmp_child_brick.style.position = 'absolute';
            tmp_child_brick.textContent = 'end for';
            let tmp_child_Brick = new Brick('brick_' + tmp_child_id, tmp_child_id);
            cur_Brick.type = "for";
            cur_Brick.for_times = 2;
            tmp_child_Brick.type = "end_for";
            tmp_child_Brick.left = event.clientX - offset.x;
            tmp_child_Brick.top = event.clientY - offset.y + 50;
            tmp_child_Brick.zIndex = cur_Brick.zIndex;
            cur_Brick.zIndex += 1;
            cur_Brick.child = tmp_child_id;
            tmp_child_Brick.parent = cur_Brick.num;
            tmp_child_Brick.for_parent = cur_Brick.num;
            Brick_list[cur_Brick.num] = cur_Brick;
            if (tmp_child_id == brick_cnt - 1) {
                Brick_list.push(tmp_child_Brick);
            }else{
                Brick_list[tmp_child_id] = tmp_child_Brick;
            }
            document.body.appendChild(tmp_child_brick);
            update_pos(cur_Brick.num);
            update_pos(tmp_child_id);
            cur_brick.addEventListener('contextmenu', function (event) {
                event.preventDefault();
                // modify the for times of the for loop
                if (cur_Brick.for_times == 2){
                    cur_Brick.for_times = 3;
                    cur_brick.textContent = 'for 3 times';
                } else if (cur_Brick.for_times == 3){
                    cur_Brick.for_times = 4;
                    cur_brick.textContent = 'for 4 times';
                } else if (cur_Brick.for_times == 4){
                    cur_Brick.for_times = 5;
                    cur_brick.textContent = 'for 5 times';
                } else if (cur_Brick.for_times == 5){
                    cur_Brick.for_times = 6;
                    cur_brick.textContent = 'for 6 times';
                } else if (cur_Brick.for_times == 6){
                    cur_Brick.for_times = 2;
                    cur_brick.textContent = 'for 2 times';
                }
            });
        }
        // cur_brick.removeEventListener('mousedown', startDrag); // Add startDrag listener to cloned brick
    } else {
        console.log('move child brick')
        let moving_for_list = [];
        let parent_id = null;
        cur_Brick = Brick_list.find(brick => brick.id == target.id);
        // console.log('cur_Brick: ' + cur_Brick.num);
        // if(cur_Brick.parent!=null) console.log('parent: ' + cur_Brick.parent);
        // if(cur_Brick.child!=null) console.log('child: ' + cur_Brick.child);
        cur_Brick.left = event.clientX + scrollX - offset.x;
        cur_Brick.top = event.clientY + scrollY - offset.y;
        cur_Brick.zIndex = highestZIndex;
        if (cur_Brick.type == "for") {
            moving_for_list.push(cur_Brick.num);
        }
        if (cur_Brick.left > left_max_limit) {
            cur_Brick.left = left_max_limit;
        }
        update_pos(cur_Brick.num);
        if (Brick_list[cur_Brick.num].parent != null) {
            parent_id = Brick_list[cur_Brick.num].parent;
            Brick_list[parent_id].child = null;
            Brick_list[cur_Brick.num].parent = null;
        }
        let tmp = cur_Brick.child;
        let tmp_top = 50;
        let tmp_z = highestZIndex-1;
        let for_child_end = null;
        while (tmp != null) {
            if (Brick_list[tmp].type == "for") {
                moving_for_list.push(tmp);
            } else if (Brick_list[tmp].type == "end_for") {
                if (moving_for_list.includes(Brick_list[tmp].for_parent)) {
                    moving_for_list.pop();
                }else{
                    for_child_end = tmp;
                    Brick_list[Brick_list[tmp].parent].child = null;
                    break;
                }
            }
            Brick_list[tmp].left = cur_Brick.left;
            Brick_list[tmp].top = cur_Brick.top + tmp_top;
            Brick_list[tmp].zIndex = tmp_z--;
            tmp_top += 50;
            update_pos(tmp);
            tmp = Brick_list[tmp].child;
        }
        cur_brick.removeEventListener('mousedown', startDrag);
        if (for_child_end != null) {
            Brick_list[for_child_end].parent = parent_id;
            Brick_list[parent_id].child = for_child_end;
            Brick_list[for_child_end].left = Brick_list[parent_id].left;
            Brick_list[for_child_end].top = Brick_list[parent_id].top + 50;
            update_pos(for_child_end);
            tmp = Brick_list[for_child_end].child;
            tmp_top = 50;
            while (tmp != null) {
                console.log('tmp: ' + tmp);
                Brick_list[tmp].left = Brick_list[for_child_end].left;
                Brick_list[tmp].top = Brick_list[for_child_end].top + tmp_top;
                tmp_top += 50;
                update_pos(tmp);
                tmp = Brick_list[tmp].child;
            }
        }
    }
    function moveBrick(event) {
        // console.log('now move id: ' + cur_Brick.num);
        Brick_list[cur_Brick.num].left = event.clientX + scrollX - offset.x;
        Brick_list[cur_Brick.num].top = event.clientY + scrollY - offset.y;
        if (Brick_list[cur_Brick.num].left > left_max_limit) {
            Brick_list[cur_Brick.num].left = left_max_limit;
        }
        if (Brick_list[cur_Brick.num].top < top_min_limit) {
            Brick_list[cur_Brick.num].top = top_min_limit;
        }
        if (cur_Brick.num == 0 && Brick_list[cur_Brick.num].left < root_left_min) {
            Brick_list[cur_Brick.num].left = root_left_min;
        }
        update_pos(cur_Brick.num);
        let tmp = cur_Brick.child;
        let tmp_top = 52;
        while (tmp != null) {
            Brick_list[tmp].left = cur_Brick.left;
            Brick_list[tmp].top = cur_Brick.top + tmp_top;
            tmp_top += 50;
            update_pos(tmp);
            tmp = Brick_list[tmp].child;
        }
    }

    function releaseBrick(event) {
        document.removeEventListener('mousemove', moveBrick);
        document.removeEventListener('mouseup', releaseBrick);
        cur_brick.addEventListener('mousedown', startDrag);
        if (parseInt(cur_brick.style.left) + offset.x <= 150 && cur_Brick.num != 0) {
            let tmp = cur_Brick.child;
            while (tmp != null) {
                let tmp_brick = document.getElementById('brick_' + tmp);
                Brick_list[tmp].exist = false;
                tmp_brick.remove();
                avail_id.push(tmp);
                tmp = Brick_list[tmp].child;
            }
            console.log('remove brick' + cur_Brick.num);
            Brick_list[cur_Brick.num].exist = false;
            avail_id.push(cur_Brick.num);
            cur_brick.remove();
            return;
        }
        // console.log('cur_Brick: ' + cur_Brick.num + ' left: ' + cur_Brick.left + ' top: ' + cur_Brick.top);
        let close_brick_id = -1;
        for (let i = 0; i < Brick_list.length; i++) {
            if (i == cur_Brick.num) continue;
            // console.log('i: ' + i + ' left: ' + Brick_list[i].left + ' top: ' + Brick_list[i].top + ' z-index: ' + Brick_list[i].zIndex);
            if (Math.abs(Brick_list[i].left - cur_Brick.left) < tolerance.x && Math.abs(Brick_list[i].top - cur_Brick.top + 50) < tolerance.y) {
                close_brick_id = i;
                console.log('close_brick_id: ' + close_brick_id);
                break;
            }
        }
        if (close_brick_id != -1) {
            cur_Brick.left = Brick_list[close_brick_id].left;
            cur_Brick.top = Brick_list[close_brick_id].top + 50;
            //cur_Brick.zIndex = Brick_list[close_brick_id].zIndex;
            let origin_child = Brick_list[close_brick_id].child;
            cur_Brick.parent = Brick_list[close_brick_id].num;
            Brick_list[close_brick_id].child = cur_Brick.num;
            let tmp = cur_Brick.parent;
            let tmp_z = cur_Brick.zIndex + 1;
            while (tmp != null) {
                Brick_list[tmp].zIndex = tmp_z++;
                let tmp_brick = document.getElementById('brick_' + tmp);
                tmp_brick.style.zIndex = Brick_list[tmp].zIndex;
                tmp = Brick_list[tmp].parent;
            }
            // console.log('origin_child: ' + origin_child);
            highestZIndex = tmp_z;
            update_pos(cur_Brick.num);
            tmp = cur_Brick.child;
            let tmp_top = 52;
            // console.log('cur: ' + cur_Brick.num + ' child: ' + origin_child);
            if (cur_Brick.child == null && origin_child != null) {
                // console.log('In If!! cur: ' + cur_Brick.num + ' child: ' + origin_child);
                cur_Brick.child = origin_child;
                Brick_list[origin_child].parent = cur_Brick.num;
                tmp = origin_child;
                origin_child = null;
            }
            Brick_list[cur_Brick.num] = cur_Brick;
            while (tmp != null) {
                Brick_list[tmp].top = cur_Brick.top + tmp_top;
                Brick_list[tmp].left = cur_Brick.left;
                tmp_top += 50;
                update_pos(tmp);
                if (Brick_list[tmp].child == null && origin_child != null) {
                    Brick_list[tmp].child = origin_child;
                    Brick_list[origin_child].parent = tmp;
                    origin_child = null;
                }
                tmp = Brick_list[tmp].child;
            }
            
        }
        update_body_height();
        // logAll();
    }
    document.addEventListener('mousemove', moveBrick);
    document.addEventListener('mouseup', releaseBrick);
}

let map = [];
let map_pos = [];
let map_size = 7;

function log_map() {
    for (let i = 0; i < map_size; i++) {
        let tmp = '';
        for (let j = 0; j < map_size; j++) {
            tmp += map[i][j] + ' ';
        }
        console.log(tmp);
    }
}

function gen_map_pos(n) {
    let mid = Math.floor(n / 2);
    map_pos = [];
    for (let j = 0; j < n; j++) {
        let tmp = [];
        for (let i = 0; i < n; i++) {
            tmp.push({ x: (i - mid) * 60 + (j - mid) * 20 + mid_block_pos.x, y: (mid - j) * 45 + mid_block_pos.y });
        }
        map_pos.push(tmp);
    }
}

class Queue {
    constructor() {
        this.items = [];
    }
    push(item) {
        this.items.push(item);
    }
    pop() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.shift();
    }
    front() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[0];
    }
    isEmpty() {
        return this.items.length === 0;
    }
    size() {
        return this.items.length;
    }
}

function gen_coin(n, coin_num) {
    let availpos = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i==0 && j==0) continue;
            if (i==n-1 && j==n-1) continue;
            if (map[i][j] == 0) {
                availpos.push(i * n + j);
            }
        }
    }
    let rand_num = Math.floor(Math.random() * availpos.length);
    let coinPos = availpos[rand_num];
    map[Math.floor(coinPos / n)][coinPos % n] = 3;
    coin_map.push(coinPos);
    if (coin_num > 1) {
        gen_coin(n, coin_num - 1);
    }
}

function gen_map(n) {
    coin_map = [];
    let visited = new Set();
    function checkLegal(map) {
        visited = new Set();
        let q = new Queue();
        let n = map.length;
        q.push(0);
        visited.add(0);
        while (!q.isEmpty()) {
            let curPos = q.pop();
            let i = Math.floor(curPos / n);
            let j = curPos % n;
            if (i > 0 && map[i - 1][j] == 0 && !visited.has((i - 1) * n + j)) {
                q.push((i - 1) * n + j);
                visited.add((i - 1) * n + j);
            }
            if (i < n - 1 && map[i + 1][j] == 0 && !visited.has((i + 1) * n + j)) {
                q.push((i + 1) * n + j);
                visited.add((i + 1) * n + j);
            }
            if (j > 0 && map[i][j - 1] == 0 && !visited.has(i * n + j - 1)) {
                q.push(i * n + j - 1);
                visited.add(i * n + j - 1);
            }
            if (j < n - 1 && map[i][j + 1] == 0 && !visited.has(i * n + j + 1)) {
                q.push(i * n + j + 1);
                visited.add(i * n + j + 1);
            }
        }
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (map[i][j] == 0 && !visited.has(i * n + j)) {
                    return false;
                }
            }
        }
        return true;
    }

    if (n == 3) {
        map = genEasyMap();
        while (!checkLegal(map)) {
            map = genEasyMap();
        }
        map[2][2] = 2;
        gen_coin(n, 1);
        log_map();
        return;
    }
    map = [];
    for (let i = 0; i < n; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
            if (i%2==0 && j%2==0) row.push(0);
            else row.push(1);
        }
        map.push(row);
    }
    map[0][0] = 0;
    map[n - 1][n - 1] = 0;
    // log map length
    console.log('map length: ' + map.length, 'map width: ' + map[0].length);
    
    function drawWall(map) {
        let availpos = [];
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if ((i == 0 && j == 0) || (i == n - 1 && j == n - 1)) continue;
                if (i % 2 == 1 && j % 2 == 1) continue;
                if (map[i][j] == 1) {
                    if (i % 2 == 0 && visited.has(i*n+(j-1)) && visited.has(i*n+(j+1))) continue;
                    if (j % 2 == 0 && visited.has((i-1)*n+j) && visited.has((i+1)*n+j)) continue;
                    availpos.push(i * n + j);
                }
            }
        }
        let rand_num = Math.floor(Math.random() * availpos.length);
        // console.log('rand: '+rand_num);
        // console.log('availpos: ' + availpos);
        let wallPos = availpos[rand_num];
        // console.log('wallPos: ' + wallPos);
        map[Math.floor(wallPos / n)][wallPos % n] = 0;
    }

    while (!checkLegal(map)) {
        // log_map();
        drawWall(map);
    }
    map[n - 1][n - 1] = 2;
    gen_coin(n, n-2);
    log_map();
}

function genEasyMap() {
    let n = 3;
    let map = [];
    for (let i = 0; i < n; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
            row.push(0);
        }
        map.push(row);
    }
    let wallPos1 = Math.floor(Math.random() * 7) + 1;
    let wallPos2 = Math.floor(Math.random() * 6) + 1;
    if (wallPos2 >= wallPos1) {
        wallPos2++;
    }
    map[Math.floor(wallPos1 / n)][wallPos1 % n] = 1;
    map[Math.floor(wallPos2 / n)][wallPos2 % n] = 1;
    return map;
}

function update_slime(slime, cur_pos, cur_dir) {
    console.log('update slime x:'+cur_pos.x+' y:'+cur_pos.y+' dir:'+cur_dir);
    slime.style.left = map_pos[cur_pos.x][cur_pos.y].x + "px";
    slime.style.top = map_pos[cur_pos.x][cur_pos.y].y + "px";
    slime.style.background = 'url(./img/slime_' + cur_dir + '.png)';
} 

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run_program() {
    now_running = true;
    let run_button = document.getElementById('run');
    run_button.disabled = true;
    run_button.classList.add('but_disabled');
    let slime = document.getElementById('slime');
    let cur_pos = { x: 0, y: 0 };
    let cur_dir = 'r';
    let BrickIdx = 0;

    const for_stack = [];
    const for_return_stack = [];

    // Helper function to introduce a delay
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    function logStacks() {
        console.log('for_stack: ' + for_stack);
        console.log('for_return_stack: ' + for_return_stack);
    }

    async function processBricks() {
        while (BrickIdx != null) {
            // logStacks();
            // console.log('BrickIdx: ' + BrickIdx);
            let cur_Brick = Brick_list[BrickIdx];
            let cur_brick = document.getElementById(cur_Brick.id);
            let jump_back = false;
            cur_brick.style.color = 'white';

            if (cur_brick.classList.contains('straight')) {
                if (cur_dir == 'r' && cur_pos.y < map_size - 1) {
                    if (map[cur_pos.x][cur_pos.y + 1] != 1) {
                        cur_pos.y += 1;
                    }
                } else if (cur_dir == 'l' && cur_pos.y > 0) {
                    if (map[cur_pos.x][cur_pos.y - 1] != 1) {
                        cur_pos.y -= 1;
                    }
                }
                else if (cur_dir == 'u' && cur_pos.x < map_size - 1) {
                    if (map[cur_pos.x + 1][cur_pos.y] != 1) {
                        cur_pos.x += 1;
                    }
                } else if (cur_dir == 'd' && cur_pos.x > 0) {
                    if (map[cur_pos.x - 1][cur_pos.y] != 1) {
                        cur_pos.x -= 1;
                    }
                }
                update_slime(slime, cur_pos, cur_dir);
            } else if (cur_brick.classList.contains('turnL')) {
                if (cur_dir == 'r') cur_dir = 'u';
                else if (cur_dir == 'u') cur_dir = 'l';
                else if (cur_dir == 'l') cur_dir = 'd';
                else if (cur_dir == 'd') cur_dir = 'r';
                update_slime(slime, cur_pos, cur_dir);
            } else if (cur_brick.classList.contains('turnR')) {
                if (cur_dir == 'r') cur_dir = 'd';
                else if (cur_dir == 'd') cur_dir = 'l';
                else if (cur_dir == 'l') cur_dir = 'u';
                else if (cur_dir == 'u') cur_dir = 'r';
                update_slime(slime, cur_pos, cur_dir);
            } else if (cur_Brick.type == 'for') {
                for_stack.push(cur_Brick.for_times-1);
                for_return_stack.push(cur_Brick.child);
            } else if (cur_Brick.type == 'end_for') {
                if (for_stack[for_stack.length - 1] == 0) {
                    for_stack.pop();
                    for_return_stack.pop();
                } else {
                    for_stack[for_stack.length - 1]--;
                    jump_back = true;
                }
            } else if (cur_brick.classList.contains('collect-brick')) {
                if (map[cur_pos.x][cur_pos.y] == 3) {
                    map[cur_pos.x][cur_pos.y] = 0;
                    collected_coin++;
                    let coin_container = document.getElementById('coin-container');
                    let coin = document.createElement('div');
                    coin.style.background = 'url(./img/coin.png)';
                    coin.style.height = '100px';
                    coin.style.width = '68px';
                    coin_container.appendChild(coin);
                    let cur_img = document.getElementById('map_' + cur_pos.x + '_' + cur_pos.y);
                    cur_img.style.background = 'url(./img/ground0.png)';
                }
            }

            // 1.5-second delay
            await sleep(sleep_time);
            cur_brick.style.color = 'black';
            BrickIdx = cur_Brick.child;
            if (jump_back) {
                BrickIdx = for_return_stack[for_return_stack.length - 1];
                console.log('jump back to: ' + BrickIdx);
            }
        }
    }

    await processBricks();
    now_running = false;
    run_button.classList.remove('but_disabled');
    run_button.disabled = false;
    run_button.textContent = 'Reset';
    run_button.classList.remove('colorffcc43');
    run_button.classList.add('color00aaaa');
    fin_run = true;
    if (cur_pos.x == map_size - 1 && cur_pos.y == map_size - 1) {
        // win
        let modal = document.getElementById('Modal');
        modal.style.display = 'block';
        let initmodal = document.getElementById('init-modal');
        initmodal.style.display = 'none';
        let finmodal = document.getElementById('finish-modal');
        finmodal.style.display = 'block';
        let win_coin_container = document.getElementById('fin-coin-container');
        while (win_coin_container.firstChild) {
            win_coin_container.removeChild(win_coin_container.firstChild);
        }
        for (let i = 0; i < collected_coin; i++) {
            let coin = document.createElement('div');
            coin.style.background = 'url(./img/coin.png)';
            coin.style.height = '100px';
            coin.style.width = '68px';
            win_coin_container.appendChild(coin);
        }
    }
}

function reset_map() {
    let slime = document.getElementById('slime');
    let run_button = document.getElementById('run');
    run_button.textContent = 'Start!!';
    run_button.classList.remove('color00aaaa');
    run_button.classList.add('colorffcc43');
    run_button.disabled = false;
    let cur_pos = { x: 0, y: 0 };
    let cur_dir = 'r';
    update_slime(slime, cur_pos, cur_dir);
    let coin_container = document.getElementById('coin-container');
    while (coin_container.firstChild) {
        coin_container.removeChild(coin_container.firstChild);
    }
    collected_coin = 0;
    for (let i = 0; i < coin_map.length; i++) {
        let coinPos = coin_map[i];
        map[Math.floor(coinPos / map_size)][coinPos % map_size] = 3;
        let cur_img = document.getElementById('map_' + Math.floor(coinPos / map_size) + '_' + coinPos % map_size);
        cur_img.style.background = 'url(./img/ground3.png)';
    }
    fin_run = false;
}

function run_but_click() {
    if (!fin_run) {
        run_program();
    }
    else {
        reset_map();
    }
}

function InitMap() {
    gen_map(map_size);
    gen_map_pos(map_size);
    let mp_zone = document.getElementById('map-container');
    while (mp_zone.firstChild) {
        mp_zone.removeChild(mp_zone.firstChild);
    }
    for (let i = 0; i < map_size; i++) {
        for (let j = 0; j < map_size; j++) {
            let imgElement = document.createElement('div');
            imgElement.style.background = 'url(./img/ground' + map[i][j] + '.png)';
            imgElement.style.position = "absolute";
            imgElement.style.left = map_pos[i][j].x + "px";
            imgElement.style.top = map_pos[i][j].y + "px";
            imgElement.style.zIndex = 100 - i * 10 + 1;
            imgElement.style.height = '100px';
            imgElement.style.width = '68px';
            imgElement.id = 'map_' + i + '_' + j;
            mp_zone.appendChild(imgElement);
        }
    }
    let slime = document.createElement('div');
    slime.style.background = 'url(./img/slime_r.png)';
    slime.style.position = "absolute";
    slime.style.left = map_pos[0][0].x + "px";
    slime.style.top = map_pos[0][0].y + "px";
    slime.style.zIndex = 1000;
    slime.style.height = '100px';
    slime.style.width = '68px';
    slime.id = 'slime';
    mp_zone.appendChild(slime);
    already_gen_map = true;
}

function InitBricks() {
    for (let i = 1; i < Brick_list.length; i++) {
        let tmp = document.getElementById(Brick_list[i].id);
        if (tmp != null) {
            tmp.remove();
        }
    }
    highestZIndex = 1;
    brick_cnt = 0;
    cur_brick = null;
    cur_Brick = null;
    Brick_list = [];
    avail_id = [];
    init_startbrick();
}

function InitAll() {
    InitBricks();
    map = [];
    map_pos = [];
    now_running = false;
    fin_run = false;
    collected_coin = 0;
    InitMap();
    let run_button = document.getElementById('run');
    run_button.style.left = (mid_block_pos.x - 150 / 2) + 'px';
    run_button.style.top = Math.max((mid_block_pos.y * 2), mid_block_pos.y + 270) + 'px';
    run_button.style.display = 'block';
    let coin_container = document.getElementById('coin-container');
    coin_container.style.top = ((-Math.floor(map_size/2)*45 + mid_block_pos.y)/2) + 'px';
    while (coin_container.firstChild) {
        coin_container.removeChild(coin_container.firstChild);
    }
    console.log('Initialization complete.');
}

function gameStart(mpsize) {
    let modal = document.getElementById('Modal');
    modal.style.display = 'none';
    map_size = mpsize;
    InitAll();
}

document.addEventListener('DOMContentLoaded', function () {
    document.body.style.width = Math.max(1135, (window.innerWidth)) + 'px';
    left_max_limit = Math.max(parseInt(document.body.style.width) / 2 - 100, 256);
    let rightBar = document.getElementById('right_bar');
    rightBar.style.width = (parseInt(document.body.style.width) - left_max_limit - 100) + 'px';
    console.log(parseInt(document.body.style.width) + ', ' + left_max_limit + ', ' + rightBar.style.width);
    rightBar.style.left = left_max_limit + 100 + 'px';
    mid_block_pos.x = left_max_limit / 2 + 50;
    mid_block_pos.y = window.innerHeight / 3;
    show_init_modal();
});


function updateWidth(){
    if (now_running) {
        return;
    }
    let w = window.innerWidth;
    document.body.style.width = Math.max(1135, w) + 'px';
    left_max_limit = Math.max(parseInt(document.body.style.width) / 2 - 100, 256);
    let rightBar = document.getElementById('right_bar');
    rightBar.style.width = (parseInt(document.body.style.width) - left_max_limit - 100) + 'px';
    rightBar.style.left = left_max_limit + 100 + 'px';
    mid_block_pos.x = left_max_limit / 2 + 50;
    let run_button = document.getElementById('run');
    run_button.style.left = (mid_block_pos.x - 150 / 2) + 'px';
    if (!already_gen_map) {
        return;
    }
    gen_map_pos(map_size);
    for (let i = 0; i < map_size; i++) {
        for (let j = 0; j < map_size; j++) {
            let tmp = document.getElementById('map_' + i + '_' + j);
            tmp.style.left = map_pos[i][j].x + "px";
            tmp.style.top = map_pos[i][j].y + "px";
        }
    }
    let slime = document.getElementById('slime');
    slime.style.left = map_pos[0][0].x + "px";
    slime.style.top = map_pos[0][0].y + "px";
}

window.addEventListener('resize', updateWidth);

function select_difficulty() {
    let selectDiff = document.getElementById('select-diff');
    selectDiff.style.display = 'none';
    const buttons = document.querySelectorAll('.but-diff');
    buttons.forEach(button => {
        button.style.display = 'inline-block';
    });
}

function show_init_modal() {
    let modal = document.getElementById('Modal');
    modal.style.display = 'block';
    let initmodal = document.getElementById('init-modal');
    initmodal.style.display = 'block';
    let finmodal = document.getElementById('finish-modal');
    finmodal.style.display = 'none';
    cur_rule_page = 1;
    let rule_page = document.getElementById('rules');
    rule_page.style.background = 'url(./img/rulepage1.png)';
    let last_page_but = document.getElementById('rule-last-page');
    last_page_but.disabled = true;
    let next_page_but = document.getElementById('rule-next-page');
    next_page_but.disabled = false;
    let selectDiff = document.getElementById('select-diff');
    selectDiff.style.display = 'inline-block';
    const buttons = document.querySelectorAll('.but-diff');
    buttons.forEach(button => {
        button.style.display = 'none';
    });
}

function next_page() {
    let rule_page = document.getElementById('rules');
    cur_rule_page++;
    rule_page.style.background = 'url(./img/rulepage' + cur_rule_page + '.png)';
    let last_page_but = document.getElementById('rule-last-page');
    last_page_but.disabled = false;
    if (cur_rule_page == 3) {
        let next_page_but = document.getElementById('rule-next-page');
        next_page_but.disabled = true;
    }
}

function last_page() {
    let rule_page = document.getElementById('rules');
    cur_rule_page--;
    rule_page.style.background = 'url(./img/rulepage' + cur_rule_page + '.png)';
    let next_page_but = document.getElementById('rule-next-page');
    next_page_but.disabled = false;
    if (cur_rule_page == 1) {
        let last_page_but = document.getElementById('rule-last-page');
        last_page_but.disabled = true;
    }
}

function close_modal() {
    let modal = document.getElementById('Modal');
    modal.style.display = 'none';
}