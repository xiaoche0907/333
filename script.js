// 页面元素选择
const phoneFrame = document.querySelector('.phone-frame');
const cards = document.querySelectorAll('.card');

// 步骤一元素
const btnYes1 = document.getElementById('btn-yes-1');
const btnNo1 = document.getElementById('btn-no-1');
const btnPlaceholder = document.querySelector('.btn-placeholder');

// 步骤二元素
const btnOk2 = document.getElementById('btn-ok-2');

// 步骤三元素
const btnSubmit3 = document.getElementById('btn-submit-3');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const customTimeGroup = document.getElementById('custom-time-group');
const customTimeInput = document.getElementById('custom-time-input');

// 步骤四元素
const btnSubmit4 = document.getElementById('btn-submit-4');
const foodItems = document.querySelectorAll('.food-item');
const otherFoodContainer = document.getElementById('other-food-container');
const otherFoodInput = document.getElementById('other-food-input');

// 步骤五元素
const summaryText = document.getElementById('summary-text');
const resultDate = document.getElementById('result-date');
const resultTime = document.getElementById('result-time');
const resultFood = document.getElementById('result-food');
const btnCopy = document.getElementById('btn-copy');
const toastMsg = document.getElementById('toast-msg');

// 存储约会数据
const dateData = {
  date: '',
  time: '',
  food: ''
};

// ----------------- 躲避按钮逻辑开始 -----------------
let hasMoved = false;

// 获取元素相对于 phoneFrame 的坐标
function getRelativeCoords(element, parent) {
  const elementRect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  return {
    left: elementRect.left - parentRect.left,
    top: elementRect.top - parentRect.top,
    width: elementRect.width,
    height: elementRect.height
  };
}

// 让“不要”按钮对准占位按钮
function alignButtonToPlaceholder() {
  if (hasMoved) return;
  const coords = getRelativeCoords(btnPlaceholder, phoneFrame);
  btnNo1.style.position = 'absolute';
  btnNo1.style.left = `${coords.left}px`;
  btnNo1.style.top = `${coords.top}px`;
  btnNo1.style.width = `${coords.width}px`;
  btnNo1.style.height = `${coords.height}px`;
  btnNo1.style.margin = '0';
}

// 页面加载后挂载按钮
window.addEventListener('load', () => {
  // 把“不要”按钮提升为 phoneFrame 的直接子元素，方便做绝对定位
  phoneFrame.appendChild(btnNo1);
  alignButtonToPlaceholder();
  
  // 设置日期输入框的默认值为明天
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.value = tomorrow.toISOString().split('T')[0];
  // 限制只能选择今天之后的日期
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
});

// 窗口尺寸改变时重新对准
window.addEventListener('resize', alignButtonToPlaceholder);

// 核心躲避算法
function moveButtonRandomly(e) {
  // 标记已经开始飞走
  hasMoved = true;
  
  const frameRect = phoneFrame.getBoundingClientRect();
  const btnRect = btnNo1.getBoundingClientRect();
  
  // 获取鼠标或触摸点的相对坐标
  let clientX, clientY;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  
  const cursorX = clientX - frameRect.left;
  const cursorY = clientY - frameRect.top;
  
  let newLeft, newTop;
  let attempts = 0;
  const padding = 20; // 屏幕四周留白边界
  let distance = 0;
  
  do {
    // 随机计算新位置
    newLeft = Math.random() * (frameRect.width - btnRect.width - padding * 2) + padding;
    newTop = Math.random() * (frameRect.height - btnRect.height - padding * 2) + padding;
    attempts++;
    
    // 计算新按钮中心到指针的距离
    const btnCenterX = newLeft + btnRect.width / 2;
    const btnCenterY = newTop + btnRect.height / 2;
    distance = Math.hypot(btnCenterX - cursorX, btnCenterY - cursorY);
    
  } while (attempts < 30 && distance < 120); // 确保距离光标至少 120 像素

  // 移动按钮并加上一点酷炫的微转角
  const randomRotate = (Math.random() - 0.5) * 15;
  btnNo1.style.left = `${newLeft}px`;
  btnNo1.style.top = `${newTop}px`;
  btnNo1.style.transform = `rotate(${randomRotate}deg) scale(1.05)`;
}

// 绑定事件：PC 端悬停及移动端触摸
btnNo1.addEventListener('mouseenter', moveButtonRandomly);
btnNo1.addEventListener('mouseover', moveButtonRandomly);
btnNo1.addEventListener('touchstart', (e) => {
  e.preventDefault(); // 阻止点击穿透或触发 click 事件
  moveButtonRandomly(e);
});

// 防止直接通过 Tab 键聚焦按回车选中
btnNo1.addEventListener('focus', (e) => {
  btnNo1.blur();
});
// ----------------- 躲避按钮逻辑结束 -----------------


// ----------------- 步骤卡片流转逻辑 -----------------
function goToStep(stepNumber) {
  // 隐藏当前卡片，显示新卡片
  cards.forEach(card => card.classList.remove('active'));
  
  // 延迟一瞬间激活以配合CSS过渡
  setTimeout(() => {
    const targetCard = document.getElementById(`card-${stepNumber}`);
    if (targetCard) {
      targetCard.classList.add('active');
    }
  }, 50);
}

// 步骤一：点击愿意
btnYes1.addEventListener('click', () => {
  // 隐藏飞走的不要按钮，防止它游离在屏幕上
  btnNo1.style.display = 'none';
  goToStep(2);
});

// 步骤二：确认
btnOk2.addEventListener('click', () => {
  goToStep(3);
});

// 步骤三：日期时间监听与确认
timeInput.addEventListener('change', () => {
  if (timeInput.value === 'custom') {
    customTimeGroup.style.display = 'flex';
    customTimeInput.required = true;
    customTimeInput.focus();
  } else {
    customTimeGroup.style.display = 'none';
    customTimeInput.required = false;
  }
});

btnSubmit3.addEventListener('click', () => {
  // 验证输入
  if (!dateInput.value) {
    showToast('请选择哪一天呢？📅');
    return;
  }
  
  let selectedTime = timeInput.value;
  if (!selectedTime) {
    showToast('请选择几点见面？⏰');
    return;
  }
  
  if (selectedTime === 'custom') {
    if (!customTimeInput.value.trim()) {
      showToast('请输入具体的见面时间吧 ⏰');
      return;
    }
    selectedTime = customTimeInput.value.trim();
  }
  
  // 保存数据
  dateData.date = dateInput.value;
  dateData.time = selectedTime;
  
  // 进入步骤四
  goToStep(4);
});

// 步骤四：美食选择
let selectedFood = '';
foodItems.forEach(item => {
  item.addEventListener('click', () => {
    // 移除其他选中
    foodItems.forEach(f => f.classList.remove('selected'));
    // 添加当前选中
    item.classList.add('selected');
    
    selectedFood = item.getAttribute('data-food');
    
    // 如果是“其他”
    if (selectedFood === 'other') {
      otherFoodContainer.style.display = 'block';
      otherFoodInput.focus();
    } else {
      otherFoodContainer.style.display = 'none';
    }
  });
});

btnSubmit4.addEventListener('click', () => {
  if (!selectedFood) {
    showToast('请挑选一个好吃的嘛 🍕');
    return;
  }
  
  let foodName = '';
  if (selectedFood === 'other') {
    const customFood = otherFoodInput.value.trim();
    if (!customFood) {
      showToast('请告诉我你想吃什么呢？✍️');
      return;
    }
    foodName = `✍️ ${customFood}`;
  } else {
    // 寻找匹配名称
    const matchedItem = Array.from(foodItems).find(f => f.getAttribute('data-food') === selectedFood);
    const emoji = matchedItem.querySelector('.emoji').innerText;
    const name = matchedItem.querySelector('.name').innerText;
    foodName = `${emoji} ${name}`;
  }
  
  dateData.food = foodName;
  
  // 渲染最终结果
  renderFinalResults();
  
  // 进入步骤五
  goToStep(5);
});

// 渲染结果页
function renderFinalResults() {
  // 格式化日期
  const dateObj = new Date(dateData.date);
  const month = dateObj.getMonth() + 1;
  const date = dateObj.getDate();
  const formattedDate = `${month}月${date}日`;
  
  // 渲染卡片展示
  resultDate.innerText = formattedDate;
  resultTime.innerText = dateData.time;
  resultFood.innerText = dateData.food;
  
  // 渲染段落文案
  summaryText.innerText = `${formattedDate} ${dateData.time}，我们去吃${dateData.food.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim()}。带好胃口，我带好路线。`;
}

// 复制消息功能
btnCopy.addEventListener('click', () => {
  const dateObj = new Date(dateData.date);
  const month = dateObj.getMonth() + 1;
  const date = dateObj.getDate();
  const formattedDate = `${month}月${date}日`;
  
  const textToCopy = `约定好啦！📅 日期：${formattedDate} ⏰ 时间：${dateData.time} 🍽️ 美食：${dateData.food}。不见不散哦！`;
  
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      showToast('已成功复制约会详情！快去发给他吧 💌');
    })
    .catch(err => {
      console.error('无法复制: ', err);
      showToast('复制失败，请截图发送给他吧！');
    });
});

// 弹窗提示
let toastTimeout;
function showToast(message) {
  toastMsg.innerText = message;
  toastMsg.style.display = 'block';
  
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastMsg.style.display = 'none';
  }, 2500);
}
