// 当前页面索引
let currentPage = 1;
const totalPages = 3;
let musicStarted = false;

// 页面切换函数
function nextPage() {
    const bgMusic = document.getElementById('background-music');

    // 当从第一页切换走时，第一次播放音乐
    if (currentPage === 1 && !musicStarted) {
        if (bgMusic) {
            bgMusic.play().catch(e => console.error("Music playback failed:", e));
            musicStarted = true;
        }
    }

    if (currentPage < totalPages) {
        // 隐藏当前页面
        const currentPageElement = document.getElementById(`page${currentPage}`);
        currentPageElement.classList.remove('active');
        currentPageElement.classList.add('prev');
        
        // 显示下一页
        currentPage++;
        const nextPageElement = document.getElementById(`page${currentPage}`);
        
        setTimeout(() => {
            nextPageElement.classList.add('active');
            
            // 如果离开第二页，只停止背景轮播，音乐继续播放
            if (currentPage - 1 === 2) {
                stopBackgroundSlideshow();
            }
            
            // 为不同页面启动对应的打字机效果
            if (currentPage === 1) {
                setTimeout(() => {
                    typeWriterPage1();
                }, 500);
            } else if (currentPage === 2) {
                // 不再需要在这里控制音乐播放
                setTimeout(() => {
                    typeWriterPage2();
                }, 500);
            } else if (currentPage === 3) {
                setTimeout(() => {
                    typeWriterPage3();
                }, 500);
            }
        }, 100);
        
        // 如果是第三页，添加特殊效果
        if (currentPage === 3) {
            setTimeout(() => {
                createConfetti();
            }, 1000);
        }
    }
}

// 背景图片轮播
let currentImageIndex = 0;
const images = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png'];
let imageChangeInterval;

function startBackgroundSlideshow() {
    const page2 = document.getElementById('page2');
    let currentStyle = null;
    
    function changeBackgroundImage() {
        // 移除旧样式
        if (currentStyle) {
            document.head.removeChild(currentStyle);
        }
        
        // 创建新样式
        currentStyle = document.createElement('style');
        currentStyle.textContent = `
            #page2::before {
                background-image: url('${images[currentImageIndex]}');
            }
        `;
        document.head.appendChild(currentStyle);
        
        // 逐渐清晰
        page2.classList.remove('blur-bg');
        page2.classList.add('show-bg');
        
        // 3秒后开始模糊，准备切换下一张
        const blurTimer = setTimeout(() => {
            page2.classList.remove('show-bg');
            page2.classList.add('blur-bg');
            
            // 2秒模糊过渡后切换图片
            const nextTimer = setTimeout(() => {
                currentImageIndex = (currentImageIndex + 1) % images.length;
                changeBackgroundImage();
            }, 2000);
            allTimers.push(nextTimer);
        }, 3000);
        allTimers.push(blurTimer);
    }
    
    // 立即开始第一张图片
    changeBackgroundImage();
}

function stopBackgroundSlideshow() {
    if (imageChangeInterval) {
        clearInterval(imageChangeInterval);
        imageChangeInterval = null;
    }
    const page2 = document.getElementById('page2');
    page2.classList.remove('show-bg', 'blur-bg');
}

// 第二页打字机效果 - 按自然打字节奏
function typeWriterPage2() {
    clearAllTimers();
    setTimeout(() => startBackgroundSlideshow(), 1000);

    const allTextElements = [
        document.querySelector('#page2 .quote'),
        ...document.querySelectorAll('#page2 .reflection-text p'),
        ...document.querySelectorAll('#page2 .philosophy-text p'),
        ...document.querySelectorAll('#page2 .metaphor-text p'),
        ...document.querySelectorAll('#page2 .conclusion-text p')
    ].filter(el => el);

    // 确保保存原始文本
    allTextElements.forEach(el => {
        if (el && !el.getAttribute('data-original-text')) {
            el.setAttribute('data-original-text', el.textContent);
        }
    });

    // 开始顺序打字
    sequentialType(allTextElements, () => {
        const button = document.querySelector('#page2 .next-btn');
        if (button) {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }
    });
}

// 彻底重构的、稳定可靠的通用连续打字函数
function sequentialType(elements, onComplete) {
    let index = 0;
    function nextLine() {
        if (index >= elements.length) {
            if (onComplete) onComplete();
            return;
        }
        const element = elements[index];
        index++;
        if (element) {
            startTypingWithCallback(element, () => setTimeout(nextLine, 1000));
        } else {
            nextLine(); // Skip null elements
        }
    }
    const startTimer = setTimeout(nextLine, 1000);
    allTimers.push(startTimer);
}

// 第一页打字机效果（诗歌）
function typeWriterPage1() {
    clearAllTimers();

    const allElements = [
        document.querySelector('#page1 .poem-title'),
        ...document.querySelectorAll('#page1 .poem-line')
    ].filter(el => el);

    // 确保保存原始文本
    allElements.forEach(el => {
        if (el && !el.getAttribute('data-original-text')) {
            el.setAttribute('data-original-text', el.textContent);
        }
    });

    // 使用与第二页完全相同的打字函数
    sequentialType(allElements, () => {
        const button = document.querySelector('#page1 .next-btn');
        if (button) {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }
    });
}

// 第三页打字机效果（表白）
function typeWriterPage3() {
    clearAllTimers();

    const confessionTexts = document.querySelectorAll('#page3 .confession-text p');
    const mainConfession = document.querySelector('#page3 .main-confession');
    const nameHighlight = document.querySelector('#page3 .name-highlight');
    const loveDeclaration = document.querySelector('#page3 .love-declaration');
    const finalMessages = document.querySelectorAll('#page3 .final-message p');
    const button = document.querySelector('#page3 .restart-btn');

    // 保存所有需要打字的元素的原始文本
    [...confessionTexts, nameHighlight, loveDeclaration, ...finalMessages].forEach(el => {
        if (el && !el.getAttribute('data-original-text')) {
            el.setAttribute('data-original-text', el.textContent);
        }
    });

    let typingQueue = [];
    confessionTexts.forEach(el => typingQueue.push(el));

    // 按顺序执行动画
    function runQueue() {
        if (typingQueue.length === 0) {
            // 前言结束后，播放主表白动画
            if (mainConfession) {
                mainConfession.style.opacity = '1';
                mainConfession.style.transform = 'translateY(0)';
                
                // 在容器出现后，再开始打印里面的字
                setTimeout(() => {
                    sequentialType([nameHighlight, loveDeclaration], () => {
                        // 表白结束后，播放后续动画
                        let finalDelay = 1000;
                        setTimeout(() => createConfetti(), finalDelay);
                        finalDelay += 2000;
                        
                        finalMessages.forEach((msg, i) => {
                            setTimeout(() => startTyping(msg), finalDelay + (i * 2000));
                        });

                        setTimeout(() => {
                            if (button) {
                                button.style.opacity = '1';
                                button.style.transform = 'translateY(0)';
                            }
                        }, finalDelay + (finalMessages.length * 2000));
                    });
                }, 500); // 等待容器动画结束
            }
        } else {
            const currentElement = typingQueue.shift();
            startTypingWithCallback(currentElement, () => {
                setTimeout(runQueue, 1000);
            });
        }
    }
    
    setTimeout(runQueue, 1000);
}

function startTyping(element) {
    const text = element.getAttribute('data-original-text') || element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    
    // 如果是第二页的元素，启动自动滚动
    const isPage2Element = element.closest('#page2');
    
    let index = 0;
    const typingInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
            
            // 如果是第二页，自动滚动到当前元素
            if (isPage2Element) {
                autoScrollToElement(element);
            }
        } else {
            clearInterval(typingInterval);
            
            // 打字完成后，确保滚动到正确位置
            if (isPage2Element) {
                setTimeout(() => {
                    autoScrollToElement(element);
                }, 100);
            }
        }
    }, 200); // 每200毫秒显示一个字
    
    // 将打字间隔也加入到定时器数组中，以便可以被清除
    allTimers.push(typingInterval);
}

// 带回调的打字函数
function startTypingWithCallback(element, callback) {
    const text = element.getAttribute('data-original-text') || element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    
    // 【关键修复】将isPage2Element的判断移到这里，确保它在定时器外被正确赋值
    const isPage2Element = element.closest('#page2');
    
    let index = 0;
    const typingInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
            
            // 确保每次打字都调用滚动
            if (isPage2Element) {
                autoScrollToElement(element);
            }
        } else {
            clearInterval(typingInterval);
            
            // 打字完成后，再次确保滚动到正确位置
            if (isPage2Element) {
                setTimeout(() => {
                    autoScrollToElement(element);
                }, 100);
            }
            
            if (callback) {
                callback();
            }
        }
    }, 200);
    
    allTimers.push(typingInterval);
}

// 自动滚动到指定元素
function autoScrollToElement(element) {
    const textContainer = document.querySelector('.text-container');
    if (!textContainer || !element) return;
    
    // 使用 requestAnimationFrame 确保在DOM更新后执行滚动
    requestAnimationFrame(() => {
        // 计算需要滚动的距离
        const elementTop = element.offsetTop;
        const containerHeight = textContainer.clientHeight;
        const elementHeight = element.offsetHeight;
        
        // 滚动到让当前元素在容器中下部可见，留一些余量
        const targetScrollTop = Math.max(0, elementTop + elementHeight - containerHeight * 0.8);
        
        textContainer.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
        });
    });
}

// 重新触发第二页文字动画
function restartTextAnimations() {
    // 清除所有现有的文字
    const textElements = document.querySelectorAll('#page2 .quote, #page2 p');
    textElements.forEach(element => {
        element.textContent = element.getAttribute('data-original-text') || element.textContent;
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
    });
    
    // 隐藏按钮
    const button = document.querySelector('#page2 .next-btn');
    if (button) {
        button.style.opacity = '0';
        button.style.transform = 'translateY(20px)';
    }
    
    // 开始打字效果
    setTimeout(() => {
        typeWriterEffect();
    }, 100);
}

// 重新开始
function restart() {
    // 停止背景轮播，但音乐不停止
    stopBackgroundSlideshow();
    
    // 隐藏当前页面
    const currentPageElement = document.getElementById(`page${currentPage}`);
    currentPageElement.classList.remove('active');
    
    // 重置所有页面状态
    for (let i = 1; i <= totalPages; i++) {
        const page = document.getElementById(`page${i}`);
        page.classList.remove('active', 'prev');
    }
    
    // 回到第一页
    currentPage = 1;
    setTimeout(() => {
        document.getElementById('page1').classList.add('active');
        // 启动第一页打字机效果
        setTimeout(() => {
            typeWriterPage1();
        }, 500);
    }, 500);
    
    // 清除彩带效果
    const existingConfetti = document.querySelectorAll('.confetti');
    existingConfetti.forEach(confetti => confetti.remove());
}

// 创建飘落的花瓣
function createPetals() {
    const petalsContainer = document.querySelector('.petals-container');
    const petalSymbols = ['🌸', '🌺', '🌷', '🌹', '💐', '🌻', '🌼'];
    
    function createPetal() {
        const petal = document.createElement('div');
        petal.className = 'petal';
        petal.textContent = petalSymbols[Math.floor(Math.random() * petalSymbols.length)];
        
        // 随机位置
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDuration = (Math.random() * 3 + 4) + 's';
        petal.style.animationDelay = Math.random() * 2 + 's';
        
        petalsContainer.appendChild(petal);
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (petal.parentNode) {
                petal.parentNode.removeChild(petal);
            }
        }, 7000);
    }
    
    // 定期创建花瓣
    setInterval(createPetal, 800);
}

// 创建游泳的小鱼
function createSwimmingFish() {
    const fishContainer = document.querySelector('.fish-container');
    // 各种可爱的鱼类
    const fishSymbols = ['🐟', '🐠', '🐡', '🦈', '🐋', '🐳', '🐟', '🐠', '🐡'];
    const fishColors = ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C', '#FFA07A', '#20B2AA', '#FF69B4', '#40E0D0', '#FF6347'];
    
    function createFish() {
        const fish = document.createElement('div');
        fish.className = 'fish';
        fish.textContent = fishSymbols[Math.floor(Math.random() * fishSymbols.length)];
        
        // 随机颜色
        fish.style.color = fishColors[Math.floor(Math.random() * fishColors.length)];
        
        // 随机大小，让鱼儿大小更有变化
        const size = Math.random() * 20 + 18; // 18-38px
        fish.style.fontSize = size + 'px';
        
        // 随机垂直位置，让鱼儿游得更自由
        fish.style.top = Math.random() * 85 + 5 + '%';
        
        // 随机选择游泳方向
        const isReverse = Math.random() > 0.5;
        const swimDuration = Math.random() * 10 + 15; // 15-25秒，让鱼儿游得更慢更优雅
        
        // 设置游泳动画
        const verticalDuration = Math.random() * 3 + 4; // 4-7秒的垂直摆动
        
        if (isReverse) {
            fish.style.animationName = 'swimReverse, swimVerticalReverse';
            fish.style.animationDuration = swimDuration + 's, ' + verticalDuration + 's';
        } else {
            fish.style.animationName = 'swim, swimVertical';
            fish.style.animationDuration = swimDuration + 's, ' + verticalDuration + 's';
        }
        
        fish.style.animationDelay = Math.random() * 2 + 's, 0s';
        fish.style.animationIterationCount = '1, infinite';
        
        fishContainer.appendChild(fish);
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (fish.parentNode) {
                fish.parentNode.removeChild(fish);
            }
        }, (swimDuration + 2) * 1000);
    }
    
    // 更频繁地创建小鱼，让整个屏幕都有鱼儿游泳
    setInterval(createFish, 1200);
    
    // 立即创建更多鱼，让开始就很热闹，确保左右都有
    for (let i = 0; i < 6; i++) {
        setTimeout(createFish, i * 600);
    }
}

// 创建彩带效果（表白页面）
function createConfetti() {
    const confettiColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const confettiShapes = ['❤️', '💕', '💖', '💗', '💝', '🌟', '✨', '🎉'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.textContent = confettiShapes[Math.floor(Math.random() * confettiShapes.length)];
            
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-50px';
            confetti.style.fontSize = (Math.random() * 20 + 15) + 'px';
            confetti.style.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            confetti.style.zIndex = '1000';
            confetti.style.pointerEvents = 'none';
            
            // 动画
            confetti.style.animation = `confettiFall ${Math.random() * 2 + 3}s linear forwards`;
            
            document.body.appendChild(confetti);
            
            // 清理
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 5000);
        }, i * 100);
    }
}

// 添加彩带掉落动画
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// 键盘事件监听
document.addEventListener('keydown', function(event) {
    // 检查焦点是否在文本容器内（第二页）
    const textContainer = document.querySelector('.text-container');
    const isTextContainerFocused = textContainer && (
        textContainer.contains(document.activeElement) ||
        textContainer === document.activeElement ||
        (currentPage === 2 && textContainer.matches(':hover'))
    );
    
    // 如果在第二页的文本容器内，只允许Home键
    if (currentPage === 2 && isTextContainerFocused && (event.key === 'ArrowRight' || event.key === ' ')) {
        return;
    }
    
    if (event.key === 'ArrowRight' || event.key === ' ') {
        nextPage();
    } else if (event.key === 'ArrowLeft') {
        if (currentPage === 1) {
            restart();
        }
    } else if (event.key === 'Home') {
        restart();
    }
});

// 触摸事件支持（移动端）
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
let touchStartElement = null;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
    touchStartElement = event.target;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const horizontalDiff = touchStartX - touchEndX;
    const verticalDiff = touchStartY - touchEndY;
    
    // 检查是否在文本容器内开始触摸
    const textContainer = document.querySelector('.text-container');
    const isInTextContainer = textContainer && textContainer.contains(touchStartElement);
    
    // 如果在第二页的文本容器内，且主要是垂直滑动，则不切换页面
    if (currentPage === 2 && isInTextContainer && Math.abs(verticalDiff) > Math.abs(horizontalDiff)) {
        return;
    }
    
    // 只处理水平滑动
    if (Math.abs(horizontalDiff) > swipeThreshold && Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
        if (horizontalDiff > 0) {
            // 向左滑动 - 下一页
            nextPage();
        } else {
            // 向右滑动 - 上一页或重新开始
            if (currentPage === 1) {
                restart();
            }
        }
    }
}

// 鼠标滚轮事件 - 只在非滚动区域内才触发页面切换
let isScrolling = false;
document.addEventListener('wheel', function(event) {
    if (isScrolling) return;
    
    // 检查是否在可滚动的文本容器内
    const textContainer = document.querySelector('.text-container');
    const isInTextContainer = textContainer && textContainer.contains(event.target);
    
    // 如果在第二页的文本容器内，允许正常滚动，不切换页面
    if (currentPage === 2 && isInTextContainer) {
        return;
    }
    
    isScrolling = true;
    setTimeout(() => {
        isScrolling = false;
    }, 1000);
    
    if (event.deltaY > 0) {
        // 向下滚动 - 下一页（仅在非文本区域）
        nextPage();
    } else {
        // 向上滚动 - 重新开始（仅在第一页时）
        if (currentPage === 1) {
            restart();
        }
    }
});

// 添加兔子跳跃动画
function createJumpingRabbits() {
    const rabbits = document.querySelectorAll('.rabbit');
    
    rabbits.forEach((rabbit, index) => {
        rabbit.addEventListener('click', function() {
            rabbit.style.animation = 'none';
            setTimeout(() => {
                rabbit.style.animation = 'bounce 0.6s ease-out';
            }, 10);
            
            setTimeout(() => {
                rabbit.style.animation = 'bounce 1s infinite';
            }, 600);
        });
    });
}

// 添加心形漂浮效果
function createFloatingHearts() {
    const hearts = ['💕', '💖', '💗', '💝', '💘'];
    
    function createHeart() {
        const heart = document.createElement('div');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.position = 'fixed';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.bottom = '-50px';
        heart.style.fontSize = (Math.random() * 15 + 10) + 'px';
        heart.style.color = '#ff69b4';
        heart.style.zIndex = '1';
        heart.style.pointerEvents = 'none';
        heart.style.animation = 'floatUp 4s linear forwards';
        
        document.body.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 4000);
    }
    
    // 每3秒创建一个漂浮的心形
    setInterval(createHeart, 3000);
}

// 添加漂浮动画
const floatStyle = document.createElement('style');
floatStyle.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(floatStyle);

// 添加快进功能
function skipToAllText() {
    if (currentPage === 2) {
        // 清除所有正在进行的定时器
        clearAllTimers();
        
        const textElements = document.querySelectorAll('#page2 .quote, #page2 p');
        textElements.forEach(element => {
            // 恢复完整文本
            const fullText = element.getAttribute('data-original-text') || element.textContent;
            element.textContent = fullText;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
        
        // 显示按钮
        const button = document.querySelector('#page2 .next-btn');
        if (button) {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }
        
        // 自动滚动到底部
        setTimeout(() => {
            const textContainer = document.querySelector('.text-container');
            if (textContainer) {
                textContainer.scrollTo({
                    top: textContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 100);
        
        console.log('💫 已快进显示所有文字！');
    }
}

// 清除所有定时器的辅助函数
let allTimers = [];
function clearAllTimers() {
    allTimers.forEach(timer => {
        clearTimeout(timer);
        clearInterval(timer);
    });
    allTimers = [];
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    const bgMusic = document.getElementById('background-music');

    if (bgMusic) {
        bgMusic.src = 'taixiang.mp3'; // 使用您新添加的 taixiang.mp3
        bgMusic.volume = 0.5; // Set a default volume
    }

    // 音乐开关的逻辑已移除

    // 开始创建花瓣效果
    createPetals();
    
    // 创建游泳的小鱼效果
    createSwimmingFish();
    
    // 创建漂浮心形效果
    createFloatingHearts();
    
    // 初始化兔子动画
    setTimeout(() => {
        createJumpingRabbits();
    }, 1000);
    
    // 添加双击快进功能
    document.addEventListener('dblclick', function(event) {
        const textContainer = document.querySelector('.text-container');
        if (textContainer && textContainer.contains(event.target)) {
            skipToAllText();
        }
    });
    
    // 添加页面进入动画
    setTimeout(() => {
        document.getElementById('page1').classList.add('active');
        // 启动第一页打字机效果
        setTimeout(() => {
            typeWriterPage1();
        }, 500);
    }, 500);
    
    // 添加操作提示
    console.log('💕 表白网站已加载完成！全新的年轻活泼配色！');
    console.log('🖼️ 第二页新增背景图片轮播效果：从模糊到清晰再到模糊的美丽过渡');
    console.log('📜 第二页自动滚动：文字会自动滚动到最新位置，无需手动操作，滚动条已隐藏');
    console.log('🐟 背景动画升级：飘落花瓣 + 自由游泳的鱼儿 + 漂浮爱心，营造海底世界的浪漫氛围');
    console.log('💡 操作提示：');
    console.log('   • 所有页面：都采用打字机效果，一个字一个字浪漫出现');
    console.log('   • 第二页：自然打字节奏，每行完成后等待1秒再开始下一行');
    console.log('   • 如果想快进：双击文本区域可以让所有文字立即显示');
    console.log('   • 可以使用方向键、空格键、鼠标滚轮或触摸滑动来切换页面');
    console.log('🏠 按Home键可以重新开始');
});

// 添加页面可见性检测，当页面重新获得焦点时重新启动动画
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时，确保动画正常运行
        const activeElements = document.querySelectorAll('.poem-line, .rabbit, .heart');
        activeElements.forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }
});

// 防止右键菜单（增加沉浸感）
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

// 添加加载动画
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 1s ease-in-out';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
